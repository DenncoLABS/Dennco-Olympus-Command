const CACHE_NAME = 'olympus-map-session-tiles-v1';
const MAX_ENTRIES = 1200;

function isMapAsset(url) {
  const path = url.pathname.toLowerCase();
  const host = url.hostname.toLowerCase();
  if (path.includes('/tile') || path.includes('/tiles') || path.includes('/glyph') || path.includes('/sprite')) return true;
  if (path.endsWith('.pbf') || path.endsWith('.mvt') || path.endsWith('.png') || path.endsWith('.jpg') || path.endsWith('.jpeg') || path.endsWith('.webp') || path.endsWith('.json')) {
    return host.includes('map') || host.includes('tile') || host.includes('carto') || host.includes('basemaps') || host.includes('arcgis') || host.includes('openstreetmap') || host.includes('stadiamaps') || host.includes('maptiler');
  }
  return false;
}

async function trimCache(cache) {
  const keys = await cache.keys();
  if (keys.length <= MAX_ENTRIES) return;
  const remove = keys.slice(0, keys.length - MAX_ENTRIES);
  await Promise.all(remove.map((key) => cache.delete(key)));
}

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  let url;
  try { url = new URL(request.url); } catch { return; }
  if (!isMapAsset(url)) return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request, { ignoreVary: true });
    if (cached) return cached;
    const response = await fetch(request);
    if (response && (response.ok || response.type === 'opaque')) {
      cache.put(request, response.clone()).then(() => trimCache(cache)).catch(() => undefined);
    }
    return response;
  })());
});
