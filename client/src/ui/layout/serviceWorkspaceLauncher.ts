import { useThemeStore } from '../theme/theme.store';

const BOOT_KEY = '__olympusServiceWorkspaceLauncherReady';
const SERVICE_KEY = 'olympus.service.selected';
const serviceIds = ['agent-dvr', 'rc2', 'freepbx', 'gitlab', 'nethserver8', 'proxmox8'];

type ScopedWindow = Window & { [BOOT_KEY]?: boolean };

function serviceIdFromCard(node: HTMLElement | null) {
  const card = node?.closest('[data-app-card="true"]') as HTMLElement | null;
  const id = card?.dataset.appId || '';
  return serviceIds.includes(id) ? id : '';
}

if (typeof window !== 'undefined') {
  const scopedWindow = window as ScopedWindow;
  if (!scopedWindow[BOOT_KEY]) {
    scopedWindow[BOOT_KEY] = true;
    document.addEventListener('click', (event) => {
      const id = serviceIdFromCard(event.target as HTMLElement | null);
      if (!id) return;
      event.preventDefault();
      event.stopPropagation();
      localStorage.setItem(SERVICE_KEY, id);
      useThemeStore.getState().setActiveModule('svc' as never);
    }, true);
  }
}
