const CACHE = 'equilibrium-v2';
const STATIC = [
  './index.html',
  './app.css',
  './app.js',
  './manifest.json',
  './icon.svg',
  './icon-maskable.svg',
];

// Install: pre-cache all static assets
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(STATIC))
      .then(() => self.skipWaiting()) // activate immediately
  );
});

// Activate: remove old caches, claim all clients right away
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim()) // take control without reload
  );
});

// Fetch: network-first for app files so updates are always picked up.
// Falls back to cache when offline.
self.addEventListener('fetch', e => {
  // Only handle same-origin requests
  if (!e.request.url.startsWith(self.location.origin)) {
    e.respondWith(fetch(e.request));
    return;
  }

  e.respondWith(
    fetch(e.request)
      .then(networkRes => {
        // Got a fresh response — update the cache in the background
        const clone = networkRes.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return networkRes;
      })
      .catch(() => {
        // Offline — serve from cache
        return caches.match(e.request)
          .then(cached => cached || caches.match('./index.html'));
      })
  );
});
