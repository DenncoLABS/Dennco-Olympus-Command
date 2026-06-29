import { OLYMPUS_DESK_VIEW_SYNC_EVENT } from './workspaceEvents';

const BOOT_KEY = '__olympusDeskWorkspaceViewBridgeReady';
const VIEW_KEY = 'olympus.desk.v2.view';
const HATCH_KEY = 'olympus.desk.v2.hatch';

type ScopedWindow = Window & { [BOOT_KEY]?: boolean };

type DeskViewSyncDetail = {
  view?: string;
  source?: string;
  openedAt?: number;
};

function clickCoreDockButton() {
  const buttons = Array.from(document.querySelectorAll('.olympus-dock-widget button')) as HTMLButtonElement[];
  const button = buttons.find((candidate) => candidate.getAttribute('title') === 'Core' || candidate.textContent?.trim() === 'Core');
  if (!button) return false;

  button.click();
  return true;
}

function clickMatchingDeskButton(view: string) {
  if (view === 'core') return clickCoreDockButton();

  const labelByView: Record<string, string> = {
    apps: 'Open Apps Browser',
    files: 'Open GNOME Files',
    ollama: 'Open Ollama AI',
    architecture: 'Visualize Architecture',
    terminal: 'Open Terminal',
    settings: 'Desk Settings',
  };

  const label = labelByView[view];
  if (!label) return false;

  const buttons = Array.from(document.querySelectorAll('.olympus-powered-desk button')) as HTMLButtonElement[];
  const button = buttons.find((candidate) => candidate.textContent?.trim() === label);
  if (!button) return false;

  button.click();
  return true;
}

function openDeskHatch() {
  const section = document.querySelector('.olympus-powered-desk') as HTMLElement | null;
  if (!section || section.dataset.deskLatched !== 'true') return;

  const latch = section.querySelector('.olympus-hatch-latch') as HTMLButtonElement | null;
  latch?.click();
}

function syncVisibleDeskView(detail: DeskViewSyncDetail) {
  const view = detail.view || localStorage.getItem(VIEW_KEY) || 'core';
  localStorage.setItem(VIEW_KEY, view);
  localStorage.setItem(HATCH_KEY, 'open');

  openDeskHatch();

  window.setTimeout(() => {
    clickMatchingDeskButton(view);
  }, 80);

  window.setTimeout(() => {
    clickMatchingDeskButton(view);
  }, 360);
}

function handleDeskViewSync(event: Event) {
  const detail = (event as CustomEvent<DeskViewSyncDetail>).detail || {};
  syncVisibleDeskView(detail);
}

if (typeof window !== 'undefined') {
  const scopedWindow = window as ScopedWindow;
  if (!scopedWindow[BOOT_KEY]) {
    scopedWindow[BOOT_KEY] = true;
    window.addEventListener(OLYMPUS_DESK_VIEW_SYNC_EVENT, handleDeskViewSync);
  }
}
