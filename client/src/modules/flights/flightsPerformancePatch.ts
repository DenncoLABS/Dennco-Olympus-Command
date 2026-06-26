const BOOT_KEY = '__olympusFlightsPerformanceReady';

type ScopedWindow = Window & { [BOOT_KEY]?: boolean };

if (typeof window !== 'undefined') {
  const scopedWindow = window as ScopedWindow;
  if (!scopedWindow[BOOT_KEY]) {
    scopedWindow[BOOT_KEY] = true;
    sessionStorage.setItem('olympus.map.renderProfile', 'production');
    sessionStorage.setItem('olympus.map.cache', 'enabled');
  }
}
