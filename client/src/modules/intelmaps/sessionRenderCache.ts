const BOOT_KEY = '__olympusSessionRenderCacheReady';

type ScopedWindow = Window & { [BOOT_KEY]?: boolean };

if (typeof window !== 'undefined') {
  const scopedWindow = window as ScopedWindow;
  if (!scopedWindow[BOOT_KEY]) {
    scopedWindow[BOOT_KEY] = true;
    sessionStorage.setItem('olympus.session.mapCache', 'enabled');
    sessionStorage.setItem('olympus.session.renderProfile', 'production');
  }
}
