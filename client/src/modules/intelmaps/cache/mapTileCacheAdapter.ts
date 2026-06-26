import { isMapTileCacheEnabled, MAP_TILE_CACHE_NAME } from './mapTileCachePolicy';

const MAX_CACHE_ENTRIES = 800;

function canUseCache() {
  return typeof window !== 'undefined' && 'caches' in window && isMapTileCacheEnabled();
}

function isSafeCacheResponse(response: Response) {
  return response.ok || response.type === 'opaque';
}

async function trimCache(cache: Cache) {
  const keys = await cache.keys();
  if (keys.length <= MAX_CACHE_ENTRIES) return;
  const remove = keys.slice(0, keys.length - MAX_CACHE_ENTRIES);
  await Promise.all(remove.map((key) => cache.delete(key)));
}

export async function fetchWithMapTileCache(input: RequestInfo | URL, init?: RequestInit) {
  const request = new Request(input, init);
  if (request.method !== 'GET' || !canUseCache()) {
    return fetch(request);
  }

  const cache = await caches.open(MAP_TILE_CACHE_NAME);
  const cached = await cache.match(request, { ignoreVary: true });
  if (cached) return cached;

  const response = await fetch(request);
  if (isSafeCacheResponse(response)) {
    cache.put(request, response.clone()).then(() => trimCache(cache)).catch(() => undefined);
  }
  return response;
}
