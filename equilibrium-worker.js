/**
 * Equilibrium — Cloudflare Worker
 *
 * Routes:
 *   POST /vision  — AI food photo analysis
 *                   Requires: Authorization: Bearer <Firebase ID token>
 *                   Rate-limited: 5 scans/user/day (admin emails are exempt)
 *
 *   GET  /usda    — USDA FoodData Central search proxy
 *                   No auth required (it's public nutrition data)
 *                   Keeps the USDA API key server-side
 *
 * Environment variables (set via `wrangler secret put` or the dashboard):
 *   ANTHROPIC_API_KEY  — Anthropic API key
 *   USDA_API_KEY       — USDA FoodData Central API key
 *
 * KV namespace binding (wrangler.toml):
 *   RATE_LIMITS  — stores per-user daily scan counters
 *
 * Deploy:
 *   wrangler deploy equilibrium-worker.js --name equilibrium-vision
 */

// ── Config ────────────────────────────────────────────────────────
const FIREBASE_PROJECT_ID = 'equilibrium-app-da889';
const FIREBASE_JWK_URL    = 'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com';
const ANTHROPIC_API_URL   = 'https://api.anthropic.com/v1/messages';
const USDA_API_URL        = 'https://api.nal.usda.gov/fdc/v1/foods/search';
const DAILY_SCAN_LIMIT    = 5;
const KV_TTL_SECS         = 90_000; // ~25 h so the key outlives the day

// Admin emails match what app.js considers admin.
// These users bypass the per-day scan limit.
const ADMIN_EMAILS = ['georgie729@gmail.com', 'anaisabelmieses@gmail.com'];

// Allowed origins for CORS
const ALLOWED_ORIGINS = new Set([
  'https://myequilibrium.app',
  'http://localhost:3000',
  'http://localhost:8080',
]);

// ── Firebase JWT verification ─────────────────────────────────────
// JWKs are cached in memory for the lifetime of the worker instance
// (typically minutes-to-hours on Cloudflare). They are re-fetched
// whenever the cache expires or the kid is not found.
let _jwkCache    = null;
let _jwkCacheMs  = 0;
const JWK_TTL_MS = 3_600_000; // 1 hour

async function getFirebaseKeys() {
  const now = Date.now();
  if (_jwkCache && (now - _jwkCacheMs) < JWK_TTL_MS) return _jwkCache;
  const resp = await fetch(FIREBASE_JWK_URL, { cf: { cacheTtl: 3600 } });
  if (!resp.ok) throw new Error(`JWK fetch failed: ${resp.status}`);
  const data = await resp.json();
  _jwkCache   = data.keys; // array of JWK objects
  _jwkCacheMs = now;
  return _jwkCache;
}

function b64urlDecode(str) {
  // Convert base64url → base64, then decode
  return atob(str.replace(/-/g, '+').replace(/_/g, '/'));
}

/**
 * Verifies a Firebase ID token (RS256 JWT) and returns the payload.
 * Throws on any validation failure.
 */
async function verifyFirebaseToken(token) {
  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('Malformed JWT');

  const [headerB64, payloadB64, sigB64] = parts;

  let header, payload;
  try {
    header  = JSON.parse(b64urlDecode(headerB64));
    payload = JSON.parse(b64urlDecode(payloadB64));
  } catch {
    throw new Error('JWT decode failed');
  }

  // ── Claim checks ───────────────────────────────────────────────
  const nowSec = Math.floor(Date.now() / 1000);
  if (!payload.exp || payload.exp < nowSec)
    throw new Error('Token expired');
  if (!payload.iat || payload.iat > nowSec + 300)
    throw new Error('Token issued in the future');
  if (payload.iss !== `https://securetoken.google.com/${FIREBASE_PROJECT_ID}`)
    throw new Error('Invalid issuer');
  if (payload.aud !== FIREBASE_PROJECT_ID)
    throw new Error('Invalid audience');
  if (!payload.sub)
    throw new Error('Missing subject/uid claim');

  // ── Signature check ────────────────────────────────────────────
  // Re-fetch JWKs if we don't have the right key id
  let keys = await getFirebaseKeys();
  let jwk  = keys.find(k => k.kid === header.kid);
  if (!jwk) {
    // Force cache refresh in case Google rotated keys
    _jwkCache = null;
    keys = await getFirebaseKeys();
    jwk  = keys.find(k => k.kid === header.kid);
    if (!jwk) throw new Error(`Unknown key id: ${header.kid}`);
  }

  const cryptoKey = await crypto.subtle.importKey(
    'jwk', jwk,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false, ['verify']
  );

  const sigBytes  = Uint8Array.from(b64urlDecode(sigB64), c => c.charCodeAt(0));
  const dataBytes = new TextEncoder().encode(`${headerB64}.${payloadB64}`);

  const valid = await crypto.subtle.verify(
    'RSASSA-PKCS1-v1_5', cryptoKey, sigBytes, dataBytes
  );
  if (!valid) throw new Error('Signature mismatch');

  return payload; // { uid, email, iat, exp, ... }
}

// ── Helpers ───────────────────────────────────────────────────────
function corsHeaders(requestOrigin) {
  const origin = ALLOWED_ORIGINS.has(requestOrigin)
    ? requestOrigin
    : 'https://myequilibrium.app';
  return {
    'Access-Control-Allow-Origin':  origin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age':       '86400',
  };
}

function jsonResponse(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...extraHeaders },
  });
}

// ── Main handler ─────────────────────────────────────────────────
export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const cors   = corsHeaders(origin);

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors });
    }

    const url  = new URL(request.url);
    const path = url.pathname;

    // ── GET /usda — USDA FoodData Central proxy ───────────────────
    // No authentication required — this is public nutrition data.
    // Keeping the API key server-side prevents rate-limit abuse.
    if (path === '/usda' && request.method === 'GET') {
      const q = (url.searchParams.get('q') || '').trim();
      if (q.length < 2) {
        return jsonResponse({ error: 'Query too short' }, 400, cors);
      }

      try {
        const usdaUrl = new URL(USDA_API_URL);
        usdaUrl.searchParams.set('query', q);
        usdaUrl.searchParams.set('api_key', env.USDA_API_KEY);
        usdaUrl.searchParams.set('pageSize', '10');
        usdaUrl.searchParams.set('dataType', 'Foundation,SR Legacy,Branded');

        const resp = await fetch(usdaUrl.toString(), {
          signal: AbortSignal.timeout(10_000),
        });
        const data = await resp.json();
        return jsonResponse(data, 200, cors);
      } catch {
        return jsonResponse({ error: 'USDA service unavailable' }, 503, cors);
      }
    }

    // ── POST /vision — AI food photo analysis ─────────────────────
    if (path === '/vision' && request.method === 'POST') {

      // 1. Extract and verify the Firebase ID token
      const authHeader = request.headers.get('Authorization') || '';
      const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;

      if (!token) {
        return jsonResponse(
          { error: 'Missing Authorization header' }, 401, cors
        );
      }

      let userPayload;
      try {
        userPayload = await verifyFirebaseToken(token);
      } catch (e) {
        return jsonResponse(
          { error: 'Authentication failed', detail: e.message }, 403, cors
        );
      }

      const uid      = userPayload.sub;
      const email    = (userPayload.email || '').toLowerCase().trim();
      const isAdmin  = ADMIN_EMAILS.includes(email);

      // 2. Server-side rate limiting via KV (admins are exempt)
      if (!isAdmin && env.RATE_LIMITS) {
        const day    = new Date().toISOString().slice(0, 10); // YYYY-MM-DD UTC
        const kvKey  = `scans:${uid}:${day}`;
        const stored = await env.RATE_LIMITS.get(kvKey);
        const count  = stored ? parseInt(stored, 10) : 0;

        if (count >= DAILY_SCAN_LIMIT) {
          return jsonResponse(
            { error: 'Daily scan limit reached', limit: DAILY_SCAN_LIMIT },
            429, cors
          );
        }

        // Increment counter — expires after KV_TTL_SECS
        await env.RATE_LIMITS.put(kvKey, String(count + 1), {
          expirationTtl: KV_TTL_SECS,
        });
      }

      // 3. Parse and validate the request body
      let body;
      try { body = await request.json(); }
      catch { return jsonResponse({ error: 'Invalid JSON body' }, 400, cors); }

      const { image, mediaType } = body;
      if (!image || typeof image !== 'string' ||
          !mediaType || !mediaType.startsWith('image/')) {
        return jsonResponse(
          { error: 'Missing or invalid image / mediaType' }, 400, cors
        );
      }

      // 4. Call Anthropic API
      try {
        const anthropicResp = await fetch(ANTHROPIC_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type':      'application/json',
            'x-api-key':         env.ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model:      'claude-haiku-4-5',
            max_tokens: 1024,
            messages: [{
              role: 'user',
              content: [
                {
                  type:   'image',
                  source: { type: 'base64', media_type: mediaType, data: image },
                },
                {
                  type: 'text',
                  text: 'Identify all food items in this image. For each item return JSON with this exact shape: {"foods":[{"name":"item name","grams":estimated_grams_as_number,"sodium_mg":estimated_sodium_as_number,"notes":"brief note"}]}. Return only valid JSON, no markdown fences.',
                },
              ],
            }],
          }),
        });

        if (!anthropicResp.ok) {
          let detail = `HTTP ${anthropicResp.status}`;
          try {
            const errBody = await anthropicResp.json();
            detail = errBody?.error?.message || errBody?.error?.type || detail;
          } catch {}
          return jsonResponse(
            { error: 'AI service error', detail }, 502, cors
          );
        }

        const aiData = await anthropicResp.json();
        const text   = aiData.content?.[0]?.text || '{}';

        // Strip accidental markdown code fences if the model adds them
        const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

        let result;
        try {
          result = JSON.parse(cleaned);
        } catch {
          return jsonResponse({ error: 'AI returned unparseable JSON' }, 502, cors);
        }

        // Sanitise the AI response: clamp numbers, strip HTML from strings
        if (Array.isArray(result.foods)) {
          result.foods = result.foods.map(f => ({
            name:      String(f.name || 'Unknown food').slice(0, 120),
            grams:     Math.max(0, Math.min(5000, Number(f.grams)  || 0)),
            sodium_mg: Math.max(0, Math.min(50000, Number(f.sodium_mg) || 0)),
            notes:     String(f.notes || '').slice(0, 200),
          }));
        }

        return jsonResponse(result, 200, cors);
      } catch (e) {
        return jsonResponse(
          { error: 'AI service error', detail: e.message }, 502, cors
        );
      }
    }

    // Unknown route
    return jsonResponse({ error: 'Not found' }, 404, cors);
  },
};
