import { openOlympusWorkspace } from './openOlympusWorkspace';
import { publishDeskViewSync } from './publishDeskViewSync';
import { getWorkspaceRoute } from './workspaceRoutes';
import { isCoreDeskView, type CoreDeskView } from './coreDeskViews';

export type DeskViewSetter = (view: CoreDeskView) => void;

export function openDeskOrWorkspace(idOrViewOrLabel: string, setDeskView: DeskViewSetter, source = 'desk-native'): boolean {
  const route = getWorkspaceRoute(idOrViewOrLabel);
  if (!route) return false;

  if (route.module === 'core') {
    if (!isCoreDeskView(route.view)) return false;
    setDeskView(route.view);
    publishDeskViewSync(route.view, source);
    return true;
  }

  return openOlympusWorkspace(route.id, { source });
}
