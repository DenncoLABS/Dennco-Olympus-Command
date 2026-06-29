export type OlympusWorkspaceEventDetail = {
  id?: string;
  label?: string;
  view?: string;
  module?: string;
  group?: string;
  source?: string;
  openedAt?: number;
};

export const OLYMPUS_WORKSPACE_OPENED_EVENT = 'olympus:workspace-opened';
export const OLYMPUS_WORKSPACE_LAUNCH_EVENT = 'olympus:workspace-launch';
export const OLYMPUS_DESK_VIEW_SYNC_EVENT = 'olympus:desk-view-sync';
