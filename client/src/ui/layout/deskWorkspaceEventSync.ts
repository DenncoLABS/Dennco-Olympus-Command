import { getWorkspaceRoute } from './workspaceRoutes';

const BOOT_KEY = '__olympusDeskWorkspaceEventSyncReady';
const VIEW_KEY = 'olympus.desk.v2.view';
const OPEN_HATCH_KEY = 'olympus.desk.v2.hatch';
const DEDUPE_MS = 250;

type ScopedWindow = Window & { [BOOT_KEY]?: boolean };

type WorkspaceEventDetail = {
  id?: string;
  view?: string;
  module?: string;
  source?: string;
  openedAt?: number;
};

let lastSyncKey = '';
let lastSyncAt = 0;

function shouldSkipDuplicate(routeId: string, detail: WorkspaceEventDetail) {
  const eventStamp = detail.openedAt || 0;
  const key = `${routeId}:${eventStamp}:${detail.source || ''}`;
  const now = Date.now();
  if (key === lastSyncKey && now - lastSyncAt < DEDUPE_MS) return true;
  lastSyncKey = key;
  lastSyncAt = now;
  return false;
}

function syncCoreDeskView(detail: WorkspaceEventDetail) {
  const route = getWorkspaceRoute(detail.id || detail.view || '');
  if (!route || route.module !== 'core') return;
  if (shouldSkipDuplicate(route.id, detail)) return;

  localStorage.setItem(VIEW_KEY, route.view);
  localStorage.setItem(OPEN_HATCH_KEY, 'open');
  window.dispatchEvent(new CustomEvent('olympus:desk-view-sync', {
    detail: {
      id: route.id,
      view: route.view,
      source: detail.source || 'workspace-event-sync',
      openedAt: detail.openedAt || Date.now(),
    },
  }));
}

function handleWorkspaceOpened(event: Event) {
  const detail = (event as CustomEvent<WorkspaceEventDetail>).detail;
  if (!detail) return;
  syncCoreDeskView(detail);
}

if (typeof window !== 'undefined') {
  const scopedWindow = window as ScopedWindow;
  if (!scopedWindow[BOOT_KEY]) {
    scopedWindow[BOOT_KEY] = true;
    window.addEventListener('olympus:workspace-opened', handleWorkspaceOpened);
    window.addEventListener('olympus:workspace-launch', handleWorkspaceOpened);
  }
}
