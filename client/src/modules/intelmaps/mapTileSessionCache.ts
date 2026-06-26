const BOOT_KEY = '__olympusMapTileSessionCacheReady';

type ScopedWindow = Window & { [BOOT_KEY]?: boolean };

export function registerMapTileSessionCache() {
  if (typeof window === 'undefined') return;
  if (!('serviceWorker' in navigator)) return;
  const scopedWindow = window as ScopedWindow;
  if (scopedWindow[BOOT_KEY]) return;
  scopedWindow[BOOT_KEY] = true;
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/olympus-map-tile-cache-sw.js', { scope: '/' }).catch(() => undefined);
  });
}

registerMapTileSessionCache();
