self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((key) => key.includes('olympus-map-session-tiles')).map((key) => caches.delete(key)));
    await self.registration.unregister();
  })());
});

// No fetch handler by design. Map tile caching must not intercept the root Olympus browser session.
