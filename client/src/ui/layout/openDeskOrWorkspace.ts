import { openOlympusWorkspace } from './openOlympusWorkspace';
import { getWorkspaceRoute } from './workspaceRoutes';

export type DeskViewSetter = (view: string) => void;

export function openDeskOrWorkspace(idOrViewOrLabel: string, setDeskView: DeskViewSetter, source = 'desk-native') {
  const route = getWorkspaceRoute(idOrViewOrLabel);
  if (!route) return false;

  if (route.module === 'core') {
    setDeskView(route.view);
    return true;
  }

  return openOlympusWorkspace(route.id, { source });
}
