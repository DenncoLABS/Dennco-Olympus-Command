import type { CoreDeskView } from './coreDeskViews';
import { OLYMPUS_DESK_VIEW_SYNC_EVENT, type OlympusDeskViewSyncDetail } from './workspaceEvents';

export type DeskViewSyncPublishOptions = {
  id?: string;
  openedAt?: number;
};

export function publishDeskViewSync(view: CoreDeskView, source = 'desk-sync', options: DeskViewSyncPublishOptions = {}) {
  const detail: OlympusDeskViewSyncDetail = {
    id: options.id,
    view,
    source,
    openedAt: options.openedAt || Date.now(),
  };

  window.dispatchEvent(new CustomEvent<OlympusDeskViewSyncDetail>(OLYMPUS_DESK_VIEW_SYNC_EVENT, { detail }));
}
