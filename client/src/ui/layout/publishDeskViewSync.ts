import { OLYMPUS_DESK_VIEW_SYNC_EVENT } from './workspaceEvents';
import type { CoreDeskView } from './openDeskOrWorkspace';

export function publishDeskViewSync(view: CoreDeskView, source = 'desk-sync') {
  window.dispatchEvent(new CustomEvent(OLYMPUS_DESK_VIEW_SYNC_EVENT, {
    detail: {
      view,
      source,
      openedAt: Date.now(),
    },
  }));
}
