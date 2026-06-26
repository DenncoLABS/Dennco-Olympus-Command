import { deskAppCatalog } from './registry/deskCatalog';
import { dockRegistryItems } from '../dock/registry/dockCatalog';

const BOOT_KEY = '__olympusDeskScalabilityBootstrapReady';

type ScopedWindow = Window & { [BOOT_KEY]?: boolean };

export function installDeskScalabilityBootstrap() {
  if (typeof window === 'undefined') return;
  const scopedWindow = window as ScopedWindow;
  if (scopedWindow[BOOT_KEY]) return;
  scopedWindow[BOOT_KEY] = true;
  window.dispatchEvent(new CustomEvent('olympus:desk-registry-ready', {
    detail: {
      apps: deskAppCatalog.map((app) => ({ id: app.id, label: app.label, view: app.view, group: app.group, status: app.status })),
      dock: dockRegistryItems.map((item) => ({ id: item.id, label: item.label, kind: item.kind, group: item.group })),
    },
  }));
}

installDeskScalabilityBootstrap();
