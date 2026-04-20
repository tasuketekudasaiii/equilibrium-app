const CACHE = 'equilibrium-v14';
const STATIC = [
  './index.html',
  './app.css',
  './app.js',
  './manifest.json',
  './icon.svg',
  './icon-maskable.svg',
  './apple-touch-icon.png',
  './icon-192.png',
  './icon-512.png',
];

// Install: pre-cache all static assets
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(STATIC))
      .then(() => self.skipWaiting())
  );
});

// Activate: remove old caches, claim all clients
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// ── Push: show notification from server ──────────────────────────────
self.addEventListener('push', e => {
  let data = { title: 'Equilibrium', body: 'Time to check in!', url: './' };
  try { data = { ...data, ...e.data.json() }; } catch {}
  e.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: './icon-192.png',
      badge: './icon-192.png',
      data: { url: data.url },
      vibrate: [200, 100, 200],
    })
  );
});

// ── Notification click ───────────────────────────────────────────────
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const actionUrl = e.notification.data?.url || './';
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const c of list) {
        if (c.url && 'focus' in c) {
          c.focus();
          if (actionUrl !== './' && 'navigate' in c) c.navigate(actionUrl);
          return;
        }
      }
      if (clients.openWindow) return clients.openWindow(actionUrl);
    })
  );
});

// ── Message: trigger update check from app ───────────────────────────
self.addEventListener('message', e => {
  if (e.data === 'SKIP_WAITING') self.skipWaiting();
});

// ── Fetch: network-first for same-origin GET only ────────────────────
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  if (!e.request.url.startsWith(self.location.origin)) return;

  e.respondWith(
    fetch(e.request)
      .then(networkRes => {
        const clone = networkRes.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return networkRes;
      })
      .catch(() =>
        caches.match(e.request)
          .then(cached => cached || caches.match('./index.html'))
      )
  );
});
