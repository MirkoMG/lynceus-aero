const CACHE = 'lynceus-v1';
const PRECACHE = ['/', '/style.css', '/app.js', '/icon.svg', '/manifest.webmanifest'];

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
