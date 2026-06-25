import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useRuntimeSettings } from '../../admin/runtimeSettings';
import type { ActiveModule } from '../theme/theme.store';
import { MonitorDeskWidgets } from '../../modules/monitor/widgets/MonitorDeskWidgets';

type DeskView = 'core' | 'apps' | 'files' | 'architecture' | 'terminal' | 'services' | 'packages' | 'intel-maps' | 'flight' | 'maritime' | 'monitor' | 'dot' | 'cad' | 'admin' | 'settings';
type DockPlacement = 'left' | 'center' | 'right';
type DeskItem = { id: string; label: string; icon: string; module?: ActiveModule; view: DeskView };
type DeskWindow = { id: string; view: DeskView; title: string; x: number; y: number; w: number; h: number; z: number };

const HEIGHT_KEY = 'olympus.desktop.height.v2';
const DOCK_KEY = 'olympus.desktop.dock.v2';
const WINDOWS_KEY = 'olympus.desktop.windows.v2';

const deskItems: DeskItem[] = [
  { id: 'core', label: 'Core', icon: 'Ω', view: 'core' },
  { id: 'apps', label: 'Apps', icon: '▦', view: 'apps' },
  { id: 'files', label: 'Files', icon: '▣', view: 'files' },
  { id: 'architecture', label: 'Architecture', icon: '⌬', view: 'architecture' },
  { id: 'terminal', label: 'Terminal', icon: '⌁', view: 'terminal' },
  { id: 'services', label: 'Services', icon: '◫', view: 'services' },
  { id: 'packages', label: 'Packages', icon: '⬡', view: 'packages' },
  { id: 'intel-maps', label: 'Intel Maps', icon: '◎', view: 'intel-maps' },
  { id: 'flight', label: 'Flight', icon: '✈', view: 'flight', module: 'flights' },
  { id: 'maritime', label: 'Maritime', icon: '⛴', view: 'maritime', module: 'maritime' },
  { id: 'monitor', label: 'Monitor', icon: '◉', view: 'monitor', module: 'monitor' },
  { id: 'dot', label: 'DOT', icon: '◆', view: 'dot', module: 'dot' },
  { id: 'cad', label: 'CAD', icon: '☷', view: 'cad', module: 'cad' },
  { id: 'admin', label: 'Admin', icon: '⚙', view: 'admin', module: 'admin' },
  { id: 'settings', label: 'Settings', icon: '◎', view: 'settings' },
];

const internalTileSets: Record<DeskView, Array<{ title: string; detail: string }>> = {
  core: [{ title: 'Core Status', detail: 'Debian, GNOME, package, service, and runtime state.' }, { title: 'Core Actions', detail: 'Future controlled OS actions and command runners.' }],
  apps: [{ title: 'App Catalog', detail: 'Installed Olympus apps and command modules.' }, { title: 'App State', detail: 'Future pinned and running app state.' }],
  files: [{ title: 'File Browser', detail: 'Olympus paths and selected-file actions.' }, { title: 'Selected File', detail: 'Future preview and action panel.' }],
  architecture: [{ title: 'System Architecture', detail: 'Debian → GNOME → Olympus Core → Desk.' }, { title: 'Module Graph', detail: 'Client modules, server routes, and services.' }],
  terminal: [{ title: 'Terminal', detail: 'Local controlled command surface placeholder.' }, { title: 'Command Output', detail: 'Future execution results and logs.' }],
  services: [{ title: 'Systemd Services', detail: 'dennco-olympus-command and local service state.' }, { title: 'Service Logs', detail: 'Future journal and health output.' }],
  packages: [{ title: 'Apt Package', detail: 'Current package and source state.' }, { title: 'Repository', detail: 'GitHub Pages apt repository status.' }],
  'intel-maps': [
    { title: 'Global Intel Map', detail: 'Primary global situational map window.' },
    { title: 'Regional Watch Map', detail: 'Secondary regional map window.' },
    { title: 'Traffic / CCTV Map', detail: 'DOT traffic and camera layer window.' },
    { title: 'Air / Maritime Map', detail: 'Combined aircraft and vessel reference window.' },
  ],
  flight: [{ title: 'Flight Map', detail: 'Aircraft operational map window.' }, { title: 'Flight Diagnostics', detail: 'Provider, alerts, and aircraft state.' }],
  maritime: [{ title: 'Maritime Map', detail: 'AIS vessel operational map window.' }, { title: 'Maritime Diagnostics', detail: 'AIS and vessel-state window.' }],
  monitor: [{ title: 'Monitor Widgets', detail: 'Saved monitor dashboard widgets.' }, { title: 'Monitor Map', detail: 'Global monitor context window.' }],
  dot: [{ title: 'DOT Traffic', detail: 'Traffic event and flow window.' }, { title: 'CCTV Cameras', detail: 'Camera feed reference window.' }],
  cad: [{ title: 'Dispatch Queue', detail: 'CAD call and unit view.' }, { title: 'CAD Map', detail: 'CAD mapping and station context.' }],
  admin: [{ title: 'Runtime Settings', detail: 'Branding, provider, and feature settings.' }, { title: 'Admin Diagnostics', detail: 'System readiness and auth state.' }],
  settings: [{ title: 'Desk Settings', detail: 'Dock placement, window layout, and local preferences.' }, { title: 'Workspace Preferences', detail: 'Future OS workspace configuration.' }],
};

function readNumber(key: string, fallback: number) {
  const raw = Number(localStorage.getItem(key));
  return Number.isFinite(raw) ? raw : fallback;
}

function clampHeight(value: number) {
  return Math.max(132, Math.min(value, Math.floor(window.innerHeight * 0.74)));
}

function readDock(): DockPlacement {
  const raw = localStorage.getItem(DOCK_KEY);
  return raw === 'left' || raw === 'right' || raw === 'center' ? raw : 'center';
}

function titleFor(view: DeskView) {
  return deskItems.find((entry) => entry.view === view)?.label || view;
}

function defaultWindow(view: DeskView, offset = 0): DeskWindow {
  return { id: view, view, title: titleFor(view), x: 24 + offset * 30, y: 18 + offset * 18, w: view === 'intel-maps' || view === 'monitor' ? 720 : 560, h: view === 'intel-maps' || view === 'monitor' ? 330 : 270, z: Date.now() + offset };
}

function readWindows(): DeskWindow[] {
  try {
    const raw = localStorage.getItem(WINDOWS_KEY);
    if (!raw) return [defaultWindow('intel-maps'), defaultWindow('terminal', 1)];
    const parsed = JSON.parse(raw) as DeskWindow[];
    const valid = Array.isArray(parsed) ? parsed.filter((win) => deskItems.some((item) => item.view === win.view)) : [];
    return valid.length ? valid : [defaultWindow('intel-maps'), defaultWindow('terminal', 1)];
  } catch {
    return [defaultWindow('intel-maps'), defaultWindow('terminal', 1)];
  }
}

function clampWindow(win: DeskWindow, deskHeight: number): DeskWindow {
  return {
    ...win,
    x: Math.max(8, Math.min(win.x, Math.max(8, window.innerWidth - win.w - 24))),
    y: Math.max(8, Math.min(win.y, Math.max(8, deskHeight - win.h - 96))),
  };
}

function tileWindows(windows: DeskWindow[], deskHeight: number): DeskWindow[] {
  if (windows.length === 0) return windows;
  const availableWidth = Math.max(360, window.innerWidth - 40);
  const availableHeight = Math.max(150, deskHeight - 108);
  const columns = windows.length === 1 ? 1 : 2;
  const rows = Math.ceil(windows.length / columns);
  const cellWidth = Math.floor((availableWidth - (columns - 1) * 10) / columns);
  const cellHeight = Math.floor((availableHeight - (rows - 1) * 10) / rows);
  return windows.map((win, index) => {
    const col = index % columns;
    const row = Math.floor(index / columns);
    return {
      ...win,
      x: 20 + col * (cellWidth + 10),
      y: 12 + row * (cellHeight + 10),
      w: Math.max(320, cellWidth),
      h: Math.max(140, cellHeight),
      z: Date.now() + index,
    };
  });
}

const dockJustify: Record<DockPlacement, string> = { left: 'justify-start', center: 'justify-center', right: 'justify-end' };

export const OlympusDesktopManager: React.FC = () => {
  const { settings } = useRuntimeSettings();
  const [deskHeight, setDeskHeight] = useState(() => clampHeight(readNumber(HEIGHT_KEY, 300)));
  const [dock, setDock] = useState<DockPlacement>(() => readDock());
  const [open, setOpen] = useState(true);
  const [windows, setWindows] = useState<DeskWindow[]>(() => readWindows());
  const deskDrag = useRef<{ id: number; y: number; h: number } | null>(null);

  const enabledItems = useMemo(() => deskItems.filter((item) => !item.module || settings.featureToggles[item.module] !== false), [settings.featureToggles]);

  useEffect(() => localStorage.setItem(HEIGHT_KEY, String(deskHeight)), [deskHeight]);
  useEffect(() => localStorage.setItem(DOCK_KEY, dock), [dock]);
  useEffect(() => localStorage.setItem(WINDOWS_KEY, JSON.stringify(windows)), [windows]);

  const openWindow = (view: DeskView) => {
    setOpen(true);
    setWindows((current) => {
      const existing = current.find((win) => win.view === view);
      if (existing) return current.map((win) => win.id === existing.id ? { ...win, z: Date.now() } : win);
      return [...current, clampWindow(defaultWindow(view, current.length), deskHeight)];
    });
  };

  const closeWindow = (id: string) => setWindows((current) => current.filter((win) => win.id !== id));
  const focusWindow = (id: string) => setWindows((current) => current.map((win) => win.id === id ? { ...win, z: Date.now() } : win));
  const moveWindow = (id: string, x: number, y: number) => setWindows((current) => current.map((win) => win.id === id ? clampWindow({ ...win, x, y }, deskHeight) : win));
  const arrangeWindows = () => setWindows((current) => tileWindows(current, deskHeight));

  const startDeskResize = (event: React.PointerEvent<HTMLDivElement>) => {
    deskDrag.current = { id: event.pointerId, y: event.clientY, h: deskHeight };
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const moveDeskResize = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = deskDrag.current;
    if (!drag || drag.id !== event.pointerId) return;
    setDeskHeight(clampHeight(drag.h + (drag.y - event.clientY)));
  };
  const endDeskResize = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!deskDrag.current || deskDrag.current.id !== event.pointerId) return;
    deskDrag.current = null;
    try { event.currentTarget.releasePointerCapture(event.pointerId); } catch { /* already released */ }
  };

  return (
    <section className="relative z-[4200] w-full shrink-0 border-t border-cyan-300/25 bg-black/90 font-mono shadow-[0_-16px_40px_rgba(0,0,0,0.82)]" style={{ height: open ? deskHeight : 44 }}>
      <div className="absolute left-1/2 top-0 z-40 h-4 w-48 -translate-x-1/2 cursor-ns-resize rounded-b border-x border-b border-cyan-300/25 bg-cyan-300/10 text-center text-[8px] uppercase tracking-[0.24em] text-cyan-200/65" onPointerDown={startDeskResize} onPointerMove={moveDeskResize} onPointerUp={endDeskResize} onPointerCancel={endDeskResize}>Drag Desk</div>
      <div className="flex h-full flex-col overflow-hidden">
        <div className="flex h-11 items-center justify-between border-b border-white/10 px-4 pt-2">
          <div><div className="text-[10px] uppercase tracking-[0.26em] text-cyan-300">Olympus Desk</div><div className="text-[9px] uppercase tracking-[0.16em] text-white/40">Desktop mode · tiled apps inside the Desk</div></div>
          <div className="flex items-center gap-2 text-[9px] uppercase tracking-[0.14em] text-white/45">
            <span>{windows.length} windows</span>
            <button onClick={arrangeWindows} className="border border-cyan-300/35 px-2 py-1 text-cyan-200 hover:border-cyan-300/70">Tile Windows</button>
            <button onClick={() => setDock('left')} className={`border px-2 py-1 ${dock === 'left' ? 'border-cyan-300/60 text-cyan-200' : 'border-white/10 hover:border-cyan-300/40'}`}>Dock Left</button>
            <button onClick={() => setDock('center')} className={`border px-2 py-1 ${dock === 'center' ? 'border-cyan-300/60 text-cyan-200' : 'border-white/10 hover:border-cyan-300/40'}`}>Dock Center</button>
            <button onClick={() => setDock('right')} className={`border px-2 py-1 ${dock === 'right' ? 'border-cyan-300/60 text-cyan-200' : 'border-white/10 hover:border-cyan-300/40'}`}>Dock Right</button>
            <button onClick={() => setWindows([])} className="border border-white/10 px-2 py-1 text-white/45 hover:border-red-300/50 hover:text-red-200">Clear Windows</button>
            <button onClick={() => setOpen((value) => !value)} className="border border-white/10 px-2 py-1 text-cyan-200 hover:border-cyan-300/60">{open ? 'Hide' : 'Show'}</button>
          </div>
        </div>
        {open && <><div className="relative min-h-0 flex-1 overflow-hidden bg-[radial-gradient(rgba(34,211,238,0.08)_1px,transparent_1px)] bg-[size:22px_22px]">{windows.length === 0 && <div className="absolute inset-0 flex items-center justify-center text-xs uppercase tracking-[0.2em] text-white/25">Open an app from the Olympus Dock</div>}{windows.map((win) => <DeskWindowFrame key={win.id} win={win} deskHeight={deskHeight} onFocus={() => focusWindow(win.id)} onClose={() => closeWindow(win.id)} onMove={moveWindow}><DeskWindowContent view={win.view} /></DeskWindowFrame>)}</div><div className={`flex border-t border-cyan-300/15 bg-black/65 px-3 py-2 ${dockJustify[dock]}`}><div className="flex max-w-full items-end gap-2 overflow-x-auto rounded-2xl border border-cyan-300/20 bg-white/[0.03] px-3 py-2 shadow-[0_0_24px_rgba(34,211,238,0.12)]"><div className="mr-2 hidden min-w-[110px] flex-col items-start border-r border-white/10 pr-3 md:flex"><span className="text-[9px] uppercase tracking-[0.22em] text-cyan-300">Olympus Dock</span><span className="text-[8px] uppercase tracking-[0.16em] text-white/35">App launcher</span></div>{enabledItems.map((item) => <button key={item.id} onClick={() => openWindow(item.view)} className={`group flex min-w-[58px] flex-col items-center justify-center rounded-xl border px-2 py-1.5 transition-all ${windows.some((win) => win.view === item.view) ? 'border-cyan-300/60 bg-cyan-400/15 text-cyan-100 shadow-[0_0_18px_rgba(34,211,238,0.25)]' : 'border-white/10 bg-white/[0.03] text-white/55 hover:border-cyan-300/40 hover:bg-cyan-400/10 hover:text-cyan-100'}`}><span className="text-lg leading-none">{item.icon}</span><span className="mt-1 text-[8px] uppercase tracking-[0.1em]">{item.label}</span></button>)}</div></div></>}
      </div>
    </section>
  );
};

function DeskWindowFrame({ win, deskHeight, onFocus, onClose, onMove, children }: { win: DeskWindow; deskHeight: number; onFocus: () => void; onClose: () => void; onMove: (id: string, x: number, y: number) => void; children: React.ReactNode }) {
  const dragRef = useRef<{ id: number; dx: number; dy: number } | null>(null);
  const start = (event: React.PointerEvent<HTMLDivElement>) => { const target = event.target as HTMLElement; if (target.closest('button,a,input,select,textarea')) return; onFocus(); dragRef.current = { id: event.pointerId, dx: event.clientX - win.x, dy: event.clientY - win.y }; event.currentTarget.setPointerCapture(event.pointerId); };
  const move = (event: React.PointerEvent<HTMLDivElement>) => { const drag = dragRef.current; if (!drag || drag.id !== event.pointerId) return; onMove(win.id, event.clientX - drag.dx, event.clientY - drag.dy); };
  const end = (event: React.PointerEvent<HTMLDivElement>) => { if (!dragRef.current || dragRef.current.id !== event.pointerId) return; dragRef.current = null; try { event.currentTarget.releasePointerCapture(event.pointerId); } catch { /* already released */ } };
  const clamped = clampWindow(win, deskHeight);
  return <div className="absolute overflow-hidden border border-cyan-300/20 bg-[#020617]/95 shadow-[0_18px_44px_rgba(0,0,0,0.86)]" style={{ left: clamped.x, top: clamped.y, width: clamped.w, height: clamped.h, zIndex: win.z }} onMouseDown={onFocus}><div className="flex cursor-move items-center justify-between border-b border-cyan-300/25 bg-white/[0.04] px-3 py-2" onPointerDown={start} onPointerMove={move} onPointerUp={end} onPointerCancel={end}><div><div className="text-[9px] uppercase tracking-[0.22em] text-cyan-300">Desk Window</div><div className="text-sm font-bold uppercase tracking-[0.14em] text-white">{win.title}</div></div><button onClick={onClose} className="text-cyan-300 hover:text-white">[X]</button></div><div className="h-[calc(100%-49px)] overflow-auto p-3 custom-scrollbar">{children}</div></div>;
}

function DeskWindowContent({ view }: { view: DeskView }) {
  if (view === 'monitor') return <MonitorDeskWidgets />;
  if (view === 'intel-maps') return <IntelMapsView />;
  if (view === 'terminal') return <TerminalView />;
  if (view === 'files') return <FilesView />;
  if (view === 'architecture') return <ArchitectureView />;
  if (view === 'services') return <ServicesView />;
  if (view === 'packages') return <PackagesView />;
  return <GenericTiledView view={view} />;
}

function GenericView({ view }: { view: DeskView }) { return <div><h3 className="text-cyan-200 uppercase tracking-[0.18em] text-sm">{view}</h3><p className="mt-3 text-sm text-white/60">This app is open as a movable desktop window inside Olympus Desk.</p></div>; }
function TerminalView() { return <div className="h-full rounded border border-emerald-400/20 bg-black p-4 text-sm text-emerald-300"><div className="text-[10px] uppercase tracking-[0.2em] text-emerald-200/60">Olympus Terminal</div><div className="mt-4">root@olympus:~# <span className="animate-pulse">_</span></div></div>; }
function FilesView() { return <div><h3 className="text-cyan-200 uppercase tracking-[0.18em] text-sm">Files</h3><p className="mt-3 text-sm text-white/60">File selector placeholder for Olympus paths and future selected-file actions.</p><pre className="mt-4 border border-white/10 bg-black/40 p-3 text-xs text-emerald-200">/opt/dennco/olympus-command{`\n`}/etc/dennco/olympus-command{`\n`}/var/lib/dennco</pre></div>; }
function ArchitectureView() { return <div><h3 className="text-cyan-200 uppercase tracking-[0.18em] text-sm">Architecture</h3><p className="mt-3 text-sm text-white/60">Debian → GNOME → Olympus Core → Earth screen → Desk → Dock → desktop windows → tiled app windows.</p></div>; }
function ServicesView() { return <div><h3 className="text-cyan-200 uppercase tracking-[0.18em] text-sm">Services</h3><div className="mt-3 grid grid-cols-2 gap-3 text-xs"><div className="border border-emerald-400/20 bg-emerald-500/5 p-3">dennco-olympus-command.service</div><div className="border border-emerald-400/20 bg-emerald-500/5 p-3">olympus-cad.service</div></div></div>; }
function PackagesView() { return <div><h3 className="text-cyan-200 uppercase tracking-[0.18em] text-sm">Packages</h3><pre className="mt-4 border border-white/10 bg-black/40 p-3 text-xs text-cyan-200">dennco-olympus-command{`\n`}apt source: DenncoLABS gh-pages repo</pre></div>; }

function IntelMapsView() {
  return <TiledApp title="Intel Maps" tiles={[{ title: 'Global Intel Map', detail: 'Primary global situational map window.' }, { title: 'Regional Watch Map', detail: 'Secondary regional map window.' }, { title: 'Traffic / CCTV Map', detail: 'DOT traffic and camera map window.' }, { title: 'Air / Maritime Map', detail: 'Combined aircraft and vessel reference map.' }]} />;
}

function GenericTiledView({ view }: { view: DeskView }) {
  if (view === 'core' || view === 'apps' || view === 'settings') return <GenericView view={view} />;
  return <TiledApp title={`${titleFor(view)} App`} tiles={[{ title: `${titleFor(view)} Primary`, detail: 'Primary app window.' }, { title: `${titleFor(view)} Diagnostics`, detail: 'Diagnostics and source health.' }, { title: `${titleFor(view)} Actions`, detail: 'Future actions and widget staging.' }, { title: `${titleFor(view)} Files`, detail: 'Related files and app state.' }]} />;
}

function TiledApp({ title, tiles }: { title: string; tiles: Array<{ title: string; detail: string }> }) {
  const [mode, setMode] = useState<'one' | 'two' | 'grid'>('grid');
  const visible = mode === 'one' ? tiles.slice(0, 1) : mode === 'two' ? tiles.slice(0, 2) : tiles;
  return <div className="h-full min-h-[180px]"><div className="flex items-center justify-between"><h3 className="text-cyan-200 uppercase tracking-[0.18em] text-sm">{title}</h3><div className="flex gap-1 text-[9px] uppercase tracking-[0.14em]"><button onClick={() => setMode('one')} className={`border px-2 py-1 ${mode === 'one' ? 'border-cyan-300/60 text-cyan-200' : 'border-white/10 text-white/40'}`}>1</button><button onClick={() => setMode('two')} className={`border px-2 py-1 ${mode === 'two' ? 'border-cyan-300/60 text-cyan-200' : 'border-white/10 text-white/40'}`}>2</button><button onClick={() => setMode('grid')} className={`border px-2 py-1 ${mode === 'grid' ? 'border-cyan-300/60 text-cyan-200' : 'border-white/10 text-white/40'}`}>Grid</button></div></div><div className={`mt-3 grid gap-3 ${mode === 'one' ? 'grid-cols-1' : 'grid-cols-2'}`}>{visible.map((tile) => <div key={tile.title} className="min-h-[110px] border border-cyan-300/15 bg-black/45 p-3"><div className="text-sm font-bold text-white">{tile.title}</div><div className="mt-2 text-xs text-white/45">{tile.detail}</div><div className="mt-3 h-12 border border-white/10 bg-[radial-gradient(rgba(34,211,238,0.22)_1px,transparent_1px)] bg-[size:14px_14px]" /><div className="mt-2 text-[9px] uppercase tracking-[0.14em] text-cyan-300/60">Internal tiled window</div></div>)}</div></div>;
}
