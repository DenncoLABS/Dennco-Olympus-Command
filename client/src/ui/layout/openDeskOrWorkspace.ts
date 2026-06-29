import { openOlympusWorkspace } from './openOlympusWorkspace';
import { getWorkspaceRoute } from './workspaceRoutes';
import { OLYMPUS_DESK_VIEW_SYNC_EVENT } from './workspaceEvents';

export type CoreDeskView = 'core' | 'apps' | 'files' | 'architecture' | 'terminal' | 'ollama' | 'packages' | 'settings';
export type DeskViewSetter = (view: CoreDeskView) => void;

function isCoreDeskView(view: string): view is CoreDeskView {
  return ['core', 'apps', 'files', 'architecture', 'terminal', 'ollama', 'packages', 'settings'].includes(view);
}

function publishDeskViewSync(view: CoreDeskView, source: string) {
  window.dispatchEvent(new CustomEvent(OLYMPUS_DESK_VIEW_SYNC_EVENT, {
    detail: {
      view,
      source,
      openedAt: Date.now(),
    },
  }));
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
