const CACHE = 'lynceus-v3';
const PRECACHE = ['/', '/style.css', '/app.js', '/icon.svg', '/manifest.webmanifest',
  '/fonts/plex-sans-var.woff2', '/fonts/plex-mono-600.woff2',
  '/icon-192.png', '/icon-512.png', '/apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(PRECACHE)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Network first, cache fallback — flight data stays fresh online,
// and the last-seen board still opens without a connection.
self.addEventListener('fetch', e => {
  const { request } = e;
  if (request.method !== 'GET' || !request.url.startsWith(self.location.origin)) return;

  // Nearest-airport is resolved from the caller's IP — caching it would replay
  // one visitor's location for the next, and a stale hit is worse than none.
  if (new URL(request.url).pathname === '/api/nearest') return;

  e.respondWith(
    fetch(request)
      .then(res => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(request, copy));
        }
        return res;
      })
      .catch(() => caches.match(request, { ignoreSearch: request.url.includes('/api/') ? false : true })
        .then(hit => hit || Promise.reject(new Error('offline'))))
  );
});
