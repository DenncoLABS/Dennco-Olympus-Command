export const MAP_TILE_CACHE_ENABLE_KEY = 'olympus.mapTileCache.enabled';
export const MAP_TILE_CACHE_NAME = 'olympus-map-session-tiles-v2';

export function isMapTileCacheEnabled() {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(MAP_TILE_CACHE_ENABLE_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setMapTileCacheEnabled(enabled: boolean) {
  if (typeof window === 'undefined') return;
  try {
    if (enabled) localStorage.setItem(MAP_TILE_CACHE_ENABLE_KEY, 'true');
    else localStorage.removeItem(MAP_TILE_CACHE_ENABLE_KEY);
  } catch {
    // localStorage may be unavailable in restricted browser contexts.
  }
}

export async function clearMapTileCaches() {
  if (typeof window === 'undefined') return;
  if (!('caches' in window)) return;
  const keys = await caches.keys();
  await Promise.all(
    keys
      .filter((key) => key.includes('olympus-map-session-tiles'))
      .map((key) => caches.delete(key)),
  );
}

export async function disableMapTileCacheAndClear() {
  setMapTileCacheEnabled(false);
  await clearMapTileCaches();
}
