const CACHE = 'equilibrium-v10';
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

// Notification click: focus or open the app
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const actionUrl = e.notification.data?.url || './';
  e.waitUntil(
    clients.matchAll({type:'window', includeUncontrolled:true}).then(list => {
      for (const c of list) {
        if (c.url && 'focus' in c) {
          c.focus();
          // Navigate to the action URL
          if (actionUrl !== './' && 'navigate' in c) c.navigate(actionUrl);
          return;
        }
      }
      if (clients.openWindow) return clients.openWindow(actionUrl);
    })
  );
});

// Fetch: network-first for GET requests only.
// POST requests (Firebase/Firestore) are never intercepted.
self.addEventListener('fetch', e => {
  // Never intercept non-GET requests — Cache API doesn't support POST
  if (e.request.method !== 'GET') return;

  // Never intercept cross-origin requests — let browser handle Firebase/CDN natively
  if (!e.request.url.startsWith(self.location.origin)) return;

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
