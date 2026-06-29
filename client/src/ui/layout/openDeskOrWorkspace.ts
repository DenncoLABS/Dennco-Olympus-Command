import { openOlympusWorkspace } from './openOlympusWorkspace';
import { publishDeskViewSync } from './publishDeskViewSync';
import { getWorkspaceRoute } from './workspaceRoutes';

export type CoreDeskView = 'core' | 'apps' | 'files' | 'architecture' | 'terminal' | 'ollama' | 'packages' | 'settings';
export type DeskViewSetter = (view: CoreDeskView) => void;

function isCoreDeskView(view: string): view is CoreDeskView {
  return ['core', 'apps', 'files', 'architecture', 'terminal', 'ollama', 'packages', 'settings'].includes(view);
}

export function openDeskOrWorkspace(idOrViewOrLabel: string, setDeskView: DeskViewSetter, source = 'desk-native') {
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
