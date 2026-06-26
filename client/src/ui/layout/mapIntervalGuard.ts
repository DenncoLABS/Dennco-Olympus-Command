const BOOT_KEY = '__olympusMapIntervalGuardReady';

type ScopedWindow = Window & { [BOOT_KEY]?: boolean };

if (typeof window !== 'undefined') {
  const scopedWindow = window as ScopedWindow;
  if (!scopedWindow[BOOT_KEY]) {
    scopedWindow[BOOT_KEY] = true;
    const nativeSetInterval = window.setInterval.bind(window);
    window.setInterval = ((handler: TimerHandler, timeout?: number, ...args: unknown[]) => {
      const safeTimeout = timeout === 100 ? 650 : timeout;
      return nativeSetInterval(handler, safeTimeout, ...args);
    }) as typeof window.setInterval;
  }
}
