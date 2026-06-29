import type { CoreDeskView } from './coreDeskViews';
import { OLYMPUS_DESK_VIEW_SYNC_EVENT, type OlympusDeskViewSyncDetail } from './workspaceEvents';

export function publishDeskViewSync(view: CoreDeskView, source = 'desk-sync') {
  const detail: OlympusDeskViewSyncDetail = {
    view,
    source,
    openedAt: Date.now(),
  };

  window.dispatchEvent(new CustomEvent(OLYMPUS_DESK_VIEW_SYNC_EVENT, { detail }));
}
