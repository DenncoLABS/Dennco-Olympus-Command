import { useThemeStore } from '../theme/theme.store';

const BOOT_KEY = '__olympusMonitoringLauncherReady';

type ScopedWindow = Window & { [BOOT_KEY]?: boolean };

function isMonitoringCard(node: HTMLElement | null) {
  const card = node?.closest('[data-app-card="true"]') as HTMLElement | null;
  if (!card) return false;
  return card.textContent?.includes('ZBX') || false;
}

if (typeof window !== 'undefined') {
  const scopedWindow = window as ScopedWindow;
  if (!scopedWindow[BOOT_KEY]) {
    scopedWindow[BOOT_KEY] = true;
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement | null;
      if (!isMonitoringCard(target)) return;
      event.preventDefault();
      event.stopPropagation();
      useThemeStore.getState().setActiveModule('zbx' as never);
    }, true);
  }
}
