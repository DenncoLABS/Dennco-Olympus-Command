import { useThemeStore, type ActiveModule } from '../theme/theme.store';
import { publishWorkspaceEvents } from './publishWorkspaceEvents';
import { getWorkspaceRoute } from './workspaceRoutes';
import type { OlympusWorkspaceEventDetail } from './workspaceEvents';

const VIEW_KEY = 'olympus.desk.v2.view';
const LAST_WORKSPACE_KEY = 'olympus.workspace.lastOpen';

export type OlympusWorkspaceOpenOptions = {
  source?: string;
  openDeskView?: boolean;
};

export function openOlympusWorkspace(idOrViewOrLabel: string, options: OlympusWorkspaceOpenOptions = {}): boolean {
  const route = getWorkspaceRoute(idOrViewOrLabel);
  if (!route) return false;

  const payload: OlympusWorkspaceEventDetail = {
    id: route.id,
    label: route.label,
    view: route.view,
    module: route.module,
    group: route.group,
    source: options.source ?? 'workspace-opener',
    openedAt: Date.now(),
  };

  localStorage.setItem(VIEW_KEY, route.view);
  localStorage.setItem(LAST_WORKSPACE_KEY, JSON.stringify(payload));
  useThemeStore.getState().setActiveModule(route.module as ActiveModule);

  publishWorkspaceEvents(payload);
  return true;
}

export function closeOlympusWorkspace() {
  return openOlympusWorkspace('core', { source: 'workspace-close' });
}
