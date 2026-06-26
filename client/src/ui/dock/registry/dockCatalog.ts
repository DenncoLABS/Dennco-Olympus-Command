import { deskAppCatalog, dockActionCatalog } from '../../desk/registry/deskCatalog';
import type { DockRegistryItem } from './dockTypes';

export const dockRegistryItems: DockRegistryItem[] = [
  ...deskAppCatalog.map((app) => ({
    id: app.id,
    label: app.label,
    icon: app.icon,
    kind: 'app' as const,
    sourceId: app.id,
    group: app.group,
    order: app.order,
    draggable: true,
    visibleByDefault: app.surfaces.includes('dock'),
  })),
  ...dockActionCatalog.map((action) => ({
    id: action.id,
    label: action.label,
    icon: action.icon,
    kind: 'action' as const,
    sourceId: action.id,
    group: action.group,
    order: action.order,
    draggable: true,
    visibleByDefault: true,
  })),
];

export function getDockRegistryItem(id: string) {
  return dockRegistryItems.find((item) => item.id === id);
}

export function getVisibleDockRegistryItems() {
  return dockRegistryItems.filter((item) => item.visibleByDefault).sort((a, b) => a.order - b.order);
}
