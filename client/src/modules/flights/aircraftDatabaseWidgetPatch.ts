const BOOT_KEY = '__olympusAircraftDatabaseWidgetReady';
const WIDGET_ID = 'olympus-aircraft-db-widget';
const FOLDER_ID = 'olympus-flight-widgets-folder';
const CLOSED_KEY = 'olympus.flight.widgets.aircraftDb.closed';
const POS_KEY = 'olympus.flight.widgets.aircraftDb.position';

type ScopedWindow = Window & { [BOOT_KEY]?: boolean };
type AircraftRecord = { icao24: string; registration?: string; manufacturerName?: string; model?: string; operator?: string; typecode?: string; built?: string };

function flightMapActive() {
  const text = document.body?.innerText || '';
  return text.includes('Flight Map') || text.includes('FLIGHT') || text.includes('Flight Notifications') || text.includes('TARGET // FLIGHT');
}

function readPosition() {
  try {
    const raw = localStorage.getItem(POS_KEY);
    if (!raw) return { x: 24, y: 112 };
    const parsed = JSON.parse(raw) as { x: number; y: number };
    return { x: Math.max(8, parsed.x || 24), y: Math.max(64, parsed.y || 112) };
  } catch {
    return { x: 24, y: 112 };
  }
}

function savePosition(x: number, y: number) {
  localStorage.setItem(POS_KEY, JSON.stringify({ x, y }));
}

function styleElement(el: HTMLElement, styles: Partial<CSSStyleDeclaration>) {
  Object.assign(el.style, styles);
}

function makeButton(label: string) {
  const button = document.createElement('button');
  button.textContent = label;
  styleElement(button, {
    border: '1px solid rgba(34,211,238,.35)',
    background: 'rgba(8,47,73,.55)',
    color: '#a5f3fc',
    padding: '6px 8px',
    fontSize: '10px',
    letterSpacing: '.14em',
    textTransform: 'uppercase',
    cursor: 'pointer',
  });
  return button;
}

async function fetchAircraft(query: string) {
  const response = await fetch(`/api/flights/aircraft-db?q=${encodeURIComponent(query)}&limit=60`);
  if (!response.ok) throw new Error(`Aircraft database failed: ${response.status}`);
  return response.json() as Promise<{ info?: { records?: number; source?: string; loaded?: boolean }; results?: AircraftRecord[] }>;
}

function renderResults(container: HTMLElement, results: AircraftRecord[]) {
  container.innerHTML = '';
  if (!results.length) {
    container.textContent = 'No aircraft records found.';
    return;
  }
  for (const item of results) {
    const row = document.createElement('div');
    styleElement(row, { borderBottom: '1px solid rgba(255,255,255,.08)', padding: '8px 10px' });
    row.innerHTML = `<div style="display:flex;justify-content:space-between;gap:8px"><b style="color:#e0f2fe">${(item.registration || item.icao24 || '').toUpperCase()}</b><span style="color:#67e8f9">${item.typecode || ''}</span></div><div style="margin-top:3px;color:rgba(255,255,255,.62)">${item.manufacturerName || ''} ${item.model || ''}</div><div style="margin-top:3px;color:rgba(255,255,255,.38)">ICAO ${item.icao24 || '—'} · ${item.operator || 'operator unknown'}${item.built ? ` · built ${item.built}` : ''}</div>`;
    container.appendChild(row);
  }
}

function ensureFolder() {
  let folder = document.getElementById(FOLDER_ID) as HTMLDivElement | null;
  if (folder) return folder;
  folder = document.createElement('div');
  folder.id = FOLDER_ID;
  styleElement(folder, {
    position: 'fixed',
    left: '18px',
    bottom: '74px',
    zIndex: '9998',
    fontFamily: 'monospace',
    display: 'none',
    gap: '6px',
    alignItems: 'center',
    background: 'rgba(0,0,0,.72)',
    border: '1px solid rgba(34,211,238,.28)',
    padding: '8px',
    boxShadow: '0 18px 38px rgba(0,0,0,.72)',
  });
  const label = document.createElement('span');
  label.textContent = 'Widgets';
  styleElement(label, { color: 'rgba(255,255,255,.45)', fontSize: '10px', letterSpacing: '.18em', textTransform: 'uppercase' });
  const open = makeButton('Aircraft DB');
  open.onclick = () => {
    localStorage.setItem(CLOSED_KEY, 'false');
    ensureWidget();
    updateVisibility();
  };
  folder.append(label, open);
  document.body.appendChild(folder);
  return folder;
}

function ensureWidget() {
  let widget = document.getElementById(WIDGET_ID) as HTMLDivElement | null;
  if (widget) return widget;
  const pos = readPosition();
  widget = document.createElement('div');
  widget.id = WIDGET_ID;
  styleElement(widget, {
    position: 'fixed',
    left: `${pos.x}px`,
    top: `${pos.y}px`,
    width: '420px',
    maxHeight: 'calc(100vh - 130px)',
    zIndex: '9999',
    display: 'flex',
    flexDirection: 'column',
    background: 'rgba(2,6,23,.94)',
    border: '1px solid rgba(34,211,238,.32)',
    color: '#dbeafe',
    fontFamily: 'monospace',
    boxShadow: '0 24px 60px rgba(0,0,0,.82)',
    backdropFilter: 'blur(10px)',
  });

  const header = document.createElement('div');
  styleElement(header, { cursor: 'move', padding: '10px 12px', borderBottom: '1px solid rgba(34,211,238,.2)', background: 'rgba(0,0,0,.38)' });
  header.innerHTML = '<div style="display:flex;justify-content:space-between;gap:10px"><div><div style="font-size:10px;color:#67e8f9;letter-spacing:.22em;text-transform:uppercase;font-weight:bold">Aircraft Database</div><div style="margin-top:3px;font-size:9px;color:rgba(255,255,255,.45);letter-spacing:.14em;text-transform:uppercase">Browse Olympus aircraft data folder</div></div></div>';
  const close = document.createElement('button');
  close.textContent = '[X]';
  styleElement(close, { position: 'absolute', right: '10px', top: '10px', background: 'transparent', border: '0', color: '#67e8f9', cursor: 'pointer', fontFamily: 'monospace' });
  close.onclick = () => {
    localStorage.setItem(CLOSED_KEY, 'true');
    updateVisibility();
  };
  header.appendChild(close);

  let drag: { dx: number; dy: number } | null = null;
  header.addEventListener('pointerdown', (event) => {
    const target = event.target as HTMLElement;
    if (target.closest('button,input')) return;
    drag = { dx: event.clientX - widget!.offsetLeft, dy: event.clientY - widget!.offsetTop };
    header.setPointerCapture(event.pointerId);
  });
  header.addEventListener('pointermove', (event) => {
    if (!drag) return;
    const x = Math.max(8, Math.min(event.clientX - drag.dx, window.innerWidth - widget!.offsetWidth - 8));
    const y = Math.max(56, Math.min(event.clientY - drag.dy, window.innerHeight - 120));
    widget!.style.left = `${x}px`;
    widget!.style.top = `${y}px`;
  });
  header.addEventListener('pointerup', () => {
    if (!drag) return;
    savePosition(widget!.offsetLeft, widget!.offsetTop);
    drag = null;
  });

  const body = document.createElement('div');
  styleElement(body, { padding: '10px', overflow: 'auto' });
  const controls = document.createElement('div');
  styleElement(controls, { display: 'grid', gridTemplateColumns: '1fr auto', gap: '8px', marginBottom: '10px' });
  const input = document.createElement('input');
  input.placeholder = 'Search ICAO, registration, model, operator...';
  styleElement(input, { background: 'rgba(0,0,0,.45)', border: '1px solid rgba(255,255,255,.14)', color: '#cffafe', padding: '8px', outline: 'none', fontFamily: 'monospace', fontSize: '11px' });
  const search = makeButton('Search');
  controls.append(input, search);
  const info = document.createElement('div');
  styleElement(info, { color: 'rgba(255,255,255,.4)', fontSize: '10px', marginBottom: '8px', lineHeight: '1.45' });
  const results = document.createElement('div');
  styleElement(results, { border: '1px solid rgba(255,255,255,.08)', background: 'rgba(0,0,0,.28)', maxHeight: '440px', overflow: 'auto', fontSize: '11px' });

  async function runSearch() {
    results.textContent = 'Loading aircraft database...';
    try {
      const data = await fetchAircraft(input.value.trim());
      info.textContent = `${data.info?.records || 0} records · ${data.info?.source || 'aircraft data folder'}`;
      renderResults(results, data.results || []);
    } catch (error) {
      results.textContent = String(error);
    }
  }
  search.onclick = runSearch;
  input.addEventListener('keydown', (event) => { if (event.key === 'Enter') void runSearch(); });

  body.append(controls, info, results);
  widget.append(header, body);
  document.body.appendChild(widget);
  void runSearch();
  return widget;
}

function updateVisibility() {
  const active = flightMapActive();
  const closed = localStorage.getItem(CLOSED_KEY) === 'true';
  const folder = ensureFolder();
  const widget = document.getElementById(WIDGET_ID) || ensureWidget();
  folder.style.display = active && closed ? 'flex' : 'none';
  widget.style.display = active && !closed ? 'flex' : 'none';
}

if (typeof window !== 'undefined') {
  const scopedWindow = window as ScopedWindow;
  if (!scopedWindow[BOOT_KEY]) {
    scopedWindow[BOOT_KEY] = true;
    window.setInterval(updateVisibility, 900);
    window.addEventListener('focus', updateVisibility);
    window.addEventListener('resize', updateVisibility);
    setTimeout(updateVisibility, 900);
  }
}
