const BOOT_KEY = '__olympusMapIntervalGuardReady';

type ScopedWindow = Window & { [BOOT_KEY]?: boolean };

if (typeof window !== 'undefined') {
  const scopedWindow = window as ScopedWindow;
  if (!scopedWindow[BOOT_KEY]) {
    scopedWindow[BOOT_KEY] = true;
    // Radar animation speed is restored. Performance now comes from cache/stability layers,
    // not from slowing operational radar sweeps.
  }
}
