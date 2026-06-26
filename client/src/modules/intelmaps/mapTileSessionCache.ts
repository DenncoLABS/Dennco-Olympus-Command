const BOOT_KEY = '__olympusMapTileSessionCacheDisabled';

type ScopedWindow = Window & { [BOOT_KEY]?: boolean };

export function registerMapTileSessionCache() {
  if (typeof window === 'undefined') return;
  const scopedWindow = window as ScopedWindow;
  if (scopedWindow[BOOT_KEY]) return;
  scopedWindow[BOOT_KEY] = true;

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations()
      .then((registrations) => registrations.forEach((registration) => registration.unregister()))
      .catch(() => undefined);
  }

  if ('caches' in window) {
    caches.keys()
      .then((keys) => keys.filter((key) => key.includes('olympus') || key.includes('map')).forEach((key) => caches.delete(key)))
      .catch(() => undefined);
  }
}

registerMapTileSessionCache();
