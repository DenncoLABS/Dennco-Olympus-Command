import { getWorkspaceRoute } from './workspaceRoutes';
import {
  OLYMPUS_DESK_VIEW_SYNC_EVENT,
  OLYMPUS_WORKSPACE_LAUNCH_EVENT,
  OLYMPUS_WORKSPACE_OPENED_EVENT,
  type OlympusWorkspaceEventDetail,
} from './workspaceEvents';

const BOOT_KEY = '__olympusDeskWorkspaceEventSyncReady';
const VIEW_KEY = 'olympus.desk.v2.view';
const OPEN_HATCH_KEY = 'olympus.desk.v2.hatch';
const DEDUPE_MS = 250;

type ScopedWindow = Window & { [BOOT_KEY]?: boolean };

let lastSyncKey = '';
let lastSyncAt = 0;

function shouldSkipDuplicate(routeId: string, detail: OlympusWorkspaceEventDetail) {
  const eventStamp = detail.openedAt || 0;
  const key = `${routeId}:${eventStamp}:${detail.source || ''}`;
  const now = Date.now();
  if (key === lastSyncKey && now - lastSyncAt < DEDUPE_MS) return true;
  lastSyncKey = key;
  lastSyncAt = now;
  return false;
}

function syncCoreDeskView(detail: OlympusWorkspaceEventDetail) {
  const route = getWorkspaceRoute(detail.id || detail.view || '');
  if (!route || route.module !== 'core') return;
  if (shouldSkipDuplicate(route.id, detail)) return;

  localStorage.setItem(VIEW_KEY, route.view);
  localStorage.setItem(OPEN_HATCH_KEY, 'open');
  window.dispatchEvent(new CustomEvent(OLYMPUS_DESK_VIEW_SYNC_EVENT, {
    detail: {
      id: route.id,
      view: route.view,
      source: detail.source || 'workspace-event-sync',
      openedAt: detail.openedAt || Date.now(),
    },
  }));
}

function handleWorkspaceOpened(event: Event) {
  const detail = (event as CustomEvent<OlympusWorkspaceEventDetail>).detail;
  if (!detail) return;
  syncCoreDeskView(detail);
}

if (typeof window !== 'undefined') {
  const scopedWindow = window as ScopedWindow;
  if (!scopedWindow[BOOT_KEY]) {
    scopedWindow[BOOT_KEY] = true;
    window.addEventListener(OLYMPUS_WORKSPACE_OPENED_EVENT, handleWorkspaceOpened);
    window.addEventListener(OLYMPUS_WORKSPACE_LAUNCH_EVENT, handleWorkspaceOpened);
  }
}
