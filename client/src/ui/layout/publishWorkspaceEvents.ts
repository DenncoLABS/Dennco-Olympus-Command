import {
  OLYMPUS_WORKSPACE_LAUNCH_EVENT,
  OLYMPUS_WORKSPACE_OPENED_EVENT,
  type OlympusWorkspaceEventDetail,
} from './workspaceEvents';

export function publishWorkspaceEvents(detail: OlympusWorkspaceEventDetail): OlympusWorkspaceEventDetail {
  window.dispatchEvent(new CustomEvent<OlympusWorkspaceEventDetail>(OLYMPUS_WORKSPACE_OPENED_EVENT, { detail }));
  window.dispatchEvent(new CustomEvent<OlympusWorkspaceEventDetail>(OLYMPUS_WORKSPACE_LAUNCH_EVENT, { detail }));
  return detail;
}
