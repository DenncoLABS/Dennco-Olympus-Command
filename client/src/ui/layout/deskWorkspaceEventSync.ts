import { isCoreDeskView } from './coreDeskViews';
import { publishDeskViewSync } from './publishDeskViewSync';
import { getWorkspaceRoute } from './workspaceRoutes';
import {
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

function getWorkspaceEventRouteKey(detail: OlympusWorkspaceEventDetail): string {
  return detail.id ?? detail.view ?? '';
}

function shouldSkipDuplicate(routeId: string, detail: OlympusWorkspaceEventDetail): boolean {
  const eventStamp = detail.openedAt ?? 0;
  const key = `${routeId}:${eventStamp}:${detail.source ?? ''}`;
  const now = Date.now();
  if (key === lastSyncKey && now - lastSyncAt < DEDUPE_MS) return true;
  lastSyncKey = key;
  lastSyncAt = now;
  return false;
}

function syncCoreDeskView(detail: OlympusWorkspaceEventDetail): void {
  const route = getWorkspaceRoute(getWorkspaceEventRouteKey(detail));
  if (!route || route.module !== 'core') return;
  if (!isCoreDeskView(route.view)) return;
  if (shouldSkipDuplicate(route.id, detail)) return;

  localStorage.setItem(VIEW_KEY, route.view);
  localStorage.setItem(OPEN_HATCH_KEY, 'open');
  publishDeskViewSync(route.view, detail.source ?? 'workspace-event-sync', {
    id: route.id,
    openedAt: detail.openedAt,
  });
}

function handleWorkspaceOpened(event: Event): void {
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
