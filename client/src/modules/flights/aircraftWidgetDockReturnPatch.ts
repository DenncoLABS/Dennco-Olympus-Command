const BOOT_KEY = '__olympusAircraftWidgetDockReturnReady';
const CLOSED_KEY = 'olympus.flight.widgets.aircraftDb.closed';
const DOCK_BUTTON_ID = 'olympus-aircraft-db-dock-return';
const OLD_FLOATING_FOLDER_ID = 'olympus-flight-widgets-folder';

type ScopedWindow = Window & { [BOOT_KEY]?: boolean };

function restoreAircraftWidget() {
  localStorage.setItem(CLOSED_KEY, 'false');
  const oldFolder = document.getElementById(OLD_FLOATING_FOLDER_ID);
  if (oldFolder) oldFolder.style.display = 'none';
  const widget = document.getElementById('olympus-aircraft-db-widget') as HTMLElement | null;
  if (widget) widget.style.display = 'flex';
}

function ensureDockReturnButton() {
  let button = document.getElementById(DOCK_BUTTON_ID) as HTMLButtonElement | null;
  if (button) return button;
  const lane = document.querySelector('.olympus-dock-widget-lane') || document.querySelector('.olympus-dock-track');
  if (!lane) return null;
  button = document.createElement('button');
  button.id = DOCK_BUTTON_ID;
  button.title = 'Restore Aircraft Database widget';
  button.innerHTML = '<div style="font-size:18px;line-height:1">✈</div><div style="font-size:9px;letter-spacing:.12em;text-transform:uppercase">Aircraft DB</div>';
  Object.assign(button.style, {
    minWidth: '74px',
    minHeight: '52px',
    border: '1px solid rgba(34,211,238,.35)',
    background: 'rgba(2,6,23,.86)',
    color: '#a5f3fc',
    borderRadius: '12px',
    padding: '6px 8px',
    cursor: 'pointer',
    fontFamily: 'monospace',
    boxShadow: '0 10px 24px rgba(0,0,0,.45)',
    display: 'none',
  } as Partial<CSSStyleDeclaration>);
  button.onclick = restoreAircraftWidget;
  lane.appendChild(button);
  return button;
}

function syncDockReturn() {
  const oldFolder = document.getElementById(OLD_FLOATING_FOLDER_ID);
  if (oldFolder) oldFolder.style.display = 'none';
  const closed = localStorage.getItem(CLOSED_KEY) === 'true';
  const button = ensureDockReturnButton();
  if (button) button.style.display = closed ? 'block' : 'none';
}

if (typeof window !== 'undefined') {
  const scopedWindow = window as ScopedWindow;
  if (!scopedWindow[BOOT_KEY]) {
    scopedWindow[BOOT_KEY] = true;
    window.setInterval(syncDockReturn, 700);
    window.addEventListener('focus', syncDockReturn);
    window.addEventListener('resize', syncDockReturn);
    setTimeout(syncDockReturn, 700);
  }
}
