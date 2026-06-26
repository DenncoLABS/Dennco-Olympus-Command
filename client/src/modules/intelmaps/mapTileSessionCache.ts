const BOOT_KEY = '__olympusMapTileSessionCacheReady';
const ENABLE_KEY = 'olympus.mapTileCache.enabled';

type ScopedWindow = Window & { [BOOT_KEY]?: boolean };

function enabledByOperator() {
  try {
    return localStorage.getItem(ENABLE_KEY) === 'true';
  } catch {
    return false;
  }
}

function unregisterLegacyMapTileCache() {
  if (!('serviceWorker' in navigator)) return;
  navigator.serviceWorker.getRegistrations()
    .then((registrations) => registrations
      .filter((registration) => registration.active?.scriptURL.includes('olympus-map-tile-cache-sw.js') || registration.installing?.scriptURL.includes('olympus-map-tile-cache-sw.js') || registration.waiting?.scriptURL.includes('olympus-map-tile-cache-sw.js'))
      .forEach((registration) => registration.unregister()))
    .catch(() => undefined);
}

function clearLegacyMapTileCaches() {
  if (!('caches' in window)) return;
  caches.keys()
    .then((keys) => keys.filter((key) => key.includes('olympus-map-session-tiles')).forEach((key) => caches.delete(key)))
    .catch(() => undefined);
}

export function registerMapTileSessionCache() {
  if (typeof window === 'undefined') return;
  const scopedWindow = window as ScopedWindow;
  if (scopedWindow[BOOT_KEY]) return;
  scopedWindow[BOOT_KEY] = true;

  if (!enabledByOperator()) {
    unregisterLegacyMapTileCache();
    clearLegacyMapTileCaches();
    return;
  }

  // Intentionally disabled for now. The prior implementation used root scope `/`,
  // which let a map cache worker affect the entire Olympus browser session.
  console.info('[Olympus] Map tile cache opt-in detected, but service-worker caching remains disabled until a scoped worker path is implemented.');
}

registerMapTileSessionCache();
