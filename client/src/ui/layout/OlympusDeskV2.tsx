import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useRuntimeSettings } from '../../admin/runtimeSettings';
import { useThemeStore, type ActiveModule } from '../theme/theme.store';
import { MonitorDeskWorkspace } from '../../modules/monitor/widgets/MonitorDeskWorkspace';

type DeskView = 'core' | 'apps' | 'files' | 'architecture' | 'terminal' | 'services' | 'packages' | 'intelmaps' | 'monitor' | 'cad' | 'admin' | 'settings';
type DockPlacement = 'left' | 'center' | 'right';
type DeskStatus = 'active' | 'planned' | 'protected';
type DeskItem = { id: string; label: string; icon: string; view: DeskView; module?: ActiveModule; group?: string; description?: string; status?: DeskStatus };

const HEIGHT_KEY = 'olympus.desk.v2.height';
const DOCK_KEY = 'olympus.desk.v2.dock';
const VIEW_KEY = 'olympus.desk.v2.view';
const DEFAULT_HEIGHT = 240;
const COLLAPSED_HEIGHT = 112;
const SNAP_HEIGHT = 150;

const deskItems: DeskItem[] = [
  { id: 'core', label: 'Core', icon: 'Ω', view: 'core', group: 'OS', status: 'active', description: 'Olympus Core system overview and Debian/GNOME shell plan.' },
  { id: 'apps', label: 'Apps', icon: '▦', view: 'apps', group: 'OS', status: 'active', description: 'App browser and launcher for Olympus modules.' },
  { id: 'files', label: 'Files', icon: '▣', view: 'files', group: 'OS', status: 'active', description: 'Olympus file areas and local system paths.' },
  { id: 'architecture', label: 'Architecture', icon: '⌬', view: 'architecture', group: 'OS', status: 'active', description: 'Visual system architecture map.' },
  { id: 'terminal', label: 'Terminal', icon: '⌁', view: 'terminal', group: 'OS', status: 'active', description: 'Controlled terminal workspace placeholder.' },
  { id: 'services', label: 'Services', icon: '◫', view: 'services', group: 'System', status: 'planned', description: 'Service status placeholders.' },
  { id: 'packages', label: 'Packages', icon: '⬡', view: 'packages', group: 'System', status: 'planned', description: 'Debian package controls.' },
  { id: 'intelmaps', label: 'Intel Maps', icon: '▤', view: 'intelmaps', module: 'intelmaps', group: 'Operational', status: 'active', description: 'Deploys the Intel Maps toolbar and map workspace.' },
  { id: 'monitor', label: 'Monitor', icon: '◉', view: 'monitor', module: 'monitor', group: 'Operational', status: 'active', description: 'Monitor Desk widgets and intelligence cards.' },
  { id: 'cad', label: 'CAD', icon: '☷', view: 'cad', module: 'cad', group: 'Operational', status: 'active', description: 'Dispatch, calls, units, personnel, logs, and reports.' },
  { id: 'admin', label: 'Admin', icon: '⚙', view: 'admin', module: 'admin', group: 'System', status: 'protected', description: 'Runtime settings, branding, keys, and feature toggles.' },
  { id: 'settings', label: 'Settings', icon: '◎', view: 'settings', group: 'OS', status: 'planned', description: 'Desk, Dock, GNOME, and shell settings.' },
];

const architectureNodes = [
  ['Debian Base', 'Host OS packages, apt repository, systemd, local state directories'],
  ['GNOME Shell', 'Desktop launcher, autostart entry, future session integration'],
  ['Olympus Core GUI', 'TopNav, Tile Screens, full-width Desk, Dock launcher'],
  ['Tile Screens', 'Primary monitor viewing surface. Intel Maps opens map workspaces from tiles.'],
  ['Olympus Desk', 'Apps, Files, Architecture, Terminal, Services, Packages, Settings'],
  ['Intel Maps App', 'Flight, Maritime, Monitor, DOT, and Cyber maps attach to one workspace bar'],
  ['API Layer', 'Express routes, diagnostics, provider normalization, local CAD service'],
  ['State/Data', 'Runtime settings, CAD state, caches, folders, future file actions'],
] as const;

function savedNumber(key: string, fallback: number) {
  const value = Number(localStorage.getItem(key));
  return Number.isFinite(value) ? value : fallback;
}
function clampHeight(value: number) {
  return Math.max(COLLAPSED_HEIGHT, Math.min(value, Math.floor(window.innerHeight * 0.72)));
}
function savedDock(): DockPlacement {
  const value = localStorage.getItem(DOCK_KEY);
  return value === 'left' || value === 'right' || value === 'center' ? value : 'center';
}
function savedView(): DeskView {
  const value = localStorage.getItem(VIEW_KEY) as DeskView | null;
  return deskItems.some((item) => item.view === value) ? value as DeskView : 'core';
}

export const OlympusDeskV2: React.FC = () => {
  const { settings } = useRuntimeSettings();
  const setActiveModule = useThemeStore((state) => state.setActiveModule);
  const initialHeight = clampHeight(savedNumber(HEIGHT_KEY, DEFAULT_HEIGHT));
  const [height, setHeight] = useState(initialHeight);
  const [open, setOpen] = useState(initialHeight > SNAP_HEIGHT);
  const [view, setView] = useState<DeskView>(() => savedView());
  const [dock, setDock] = useState<DockPlacement>(() => savedDock());
  const resizeRef = useRef<{ pointerId: number; startY: number; startHeight: number } | null>(null);
  const launchers = useMemo(() => deskItems.filter((item) => !item.module || item.module === 'intelmaps' || settings.featureToggles[item.module] !== false), [settings.featureToggles]);

  useEffect(() => { localStorage.setItem(HEIGHT_KEY, String(open ? height : COLLAPSED_HEIGHT)); }, [height, open]);
  useEffect(() => { localStorage.setItem(VIEW_KEY, view); }, [view]);
  useEffect(() => { localStorage.setItem(DOCK_KEY, dock); }, [dock]);
  useEffect(() => {
    const onResize = () => setHeight((current) => clampHeight(current));
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const expandDesk = () => { setOpen(true); setHeight((current) => Math.max(current, DEFAULT_HEIGHT)); };
  const collapseDesk = () => { setOpen(false); setHeight(COLLAPSED_HEIGHT); };
  const openDockItem = (item: DeskItem) => {
    setView(item.view);
    if (!open) expandDesk();
    if (item.module === 'intelmaps') setActiveModule('intelmaps');
  };
  const startResize = (event: React.PointerEvent<HTMLDivElement>) => {
    resizeRef.current = { pointerId: event.pointerId, startY: event.clientY, startHeight: open ? height : COLLAPSED_HEIGHT };
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const moveResize = (event: React.PointerEvent<HTMLDivElement>) => {
    const state = resizeRef.current;
    if (!state || state.pointerId !== event.pointerId) return;
    const nextHeight = clampHeight(state.startHeight + state.startY - event.clientY);
    setHeight(nextHeight);
    setOpen(nextHeight > SNAP_HEIGHT);
  };
  const stopResize = (event: React.PointerEvent<HTMLDivElement>) => {
    const state = resizeRef.current;
    if (!state || state.pointerId !== event.pointerId) return;
    resizeRef.current = null;
    setHeight((current) => {
      if (current <= SNAP_HEIGHT) { setOpen(false); return COLLAPSED_HEIGHT; }
      setOpen(true);
      return current;
    });
    try { event.currentTarget.releasePointerCapture(event.pointerId); } catch { /* noop */ }
  };
  const dockClass = dock === 'left' ? 'justify-start' : dock === 'right' ? 'justify-end' : 'justify-center';
  const latched = !open;

  return (
    <section data-desk-latched={latched ? 'true' : 'false'} className="relative z-[4200] w-full shrink-0 border-t border-cyan-300/25 bg-black/90 font-mono text-white shadow-[0_-16px_40px_rgba(0,0,0,0.82)]" style={{ height: `${latched ? COLLAPSED_HEIGHT : height}px` }}>
      <div title="Drag up to expand. Double-click to open the Desk." className="absolute left-1/2 top-0 z-20 h-4 w-56 -translate-x-1/2 cursor-ns-resize rounded-b border-x border-b border-cyan-300/25 bg-cyan-300/10 text-center text-[8px] uppercase tracking-[0.24em] text-cyan-200/65" onDoubleClick={expandDesk} onPointerDown={startResize} onPointerMove={moveResize} onPointerUp={stopResize} onPointerCancel={stopResize}>{latched ? 'Drag Desk · Latched to Dock' : 'Drag Desk'}</div>
      <div className="flex h-full flex-col overflow-hidden">
        {open && <div className="flex h-11 items-center justify-between border-b border-white/10 px-4 pt-2">
          <div><div className="text-[10px] uppercase tracking-[0.26em] text-cyan-300">Olympus Desk</div><div className="text-[9px] uppercase tracking-[0.16em] text-white/40">Full-width OS workspace · Apps Browser · File Browser · Core GUI</div></div>
          <div className="flex items-center gap-2 text-[9px] uppercase tracking-[0.14em] text-white/45">
            <button onClick={() => setDock('left')} className={`border px-2 py-1 ${dock === 'left' ? 'border-cyan-300/60 text-cyan-200' : 'border-white/10 hover:border-cyan-300/40'}`}>Dock Left</button>
            <button onClick={() => setDock('center')} className={`border px-2 py-1 ${dock === 'center' ? 'border-cyan-300/60 text-cyan-200' : 'border-white/10 hover:border-cyan-300/40'}`}>Dock Center</button>
            <button onClick={() => setDock('right')} className={`border px-2 py-1 ${dock === 'right' ? 'border-cyan-300/60 text-cyan-200' : 'border-white/10 hover:border-cyan-300/40'}`}>Dock Right</button>
            <button onClick={collapseDesk} className="border border-white/10 px-2 py-1 text-cyan-200 hover:border-cyan-300/60">Hide</button>
          </div>
        </div>}
        {open && <div className="min-h-0 flex-1 overflow-hidden px-4 py-3"><DeskApp view={view} setView={setView} dock={dock} setDock={setDock} height={height} setHeight={setHeight} /></div>}
        <div className={`flex border-t border-cyan-300/15 bg-black/65 px-3 py-2 ${dockClass}`}><div className="flex max-w-full items-end gap-2 overflow-x-auto rounded-2xl border border-cyan-300/20 bg-white/[0.03] px-3 py-2 shadow-[0_0_24px_rgba(34,211,238,0.12)]"><div className="mr-2 hidden min-w-[110px] flex-col items-start border-r border-white/10 pr-3 md:flex"><span className="text-[9px] uppercase tracking-[0.22em] text-cyan-300">Olympus Dock</span><span className="text-[8px] uppercase tracking-[0.16em] text-white/35">Launcher</span></div>{launchers.map((item) => <button key={item.id} type="button" onClick={() => openDockItem(item)} className={`group flex min-w-[58px] flex-col items-center justify-center rounded-xl border px-2 py-1.5 transition-all ${view === item.view ? 'border-cyan-300/60 bg-cyan-400/15 text-cyan-100 shadow-[0_0_18px_rgba(34,211,238,0.25)]' : 'border-white/10 bg-white/[0.03] text-white/55 hover:border-cyan-300/40 hover:bg-cyan-400/10 hover:text-cyan-100'}`} title={item.label}><span className="text-lg leading-none">{item.icon}</span><span className="mt-1 text-[8px] uppercase tracking-[0.1em]">{item.label}</span></button>)}</div></div>
      </div>
    </section>
  );
};

function DeskApp({ view, setView, dock, setDock, height, setHeight }: { view: DeskView; setView: (view: DeskView) => void; dock: DockPlacement; setDock: (dock: DockPlacement) => void; height: number; setHeight: (height: number) => void }) {
  const title = deskItems.find((item) => item.view === view)?.label || view;
  return <div className="grid h-full grid-cols-[270px_1fr] gap-4 text-white/70"><aside className="rounded border border-white/10 bg-black/35 p-3 overflow-auto custom-scrollbar"><div className="text-[10px] uppercase tracking-[0.22em] text-cyan-300">Desk Window</div><div className="mt-2 text-2xl font-bold uppercase tracking-[0.14em] text-white">{title}</div><div className="mt-2 text-xs leading-relaxed text-white/45">Olympus Desk apps run inside this workspace.</div><div className="mt-4 space-y-1 text-[10px] uppercase tracking-[0.12em] text-white/40"><button onClick={() => setView('apps')} className="block w-full border border-white/10 px-2 py-1 text-left hover:border-cyan-300/40 hover:text-cyan-200">Open Apps Browser</button><button onClick={() => setView('files')} className="block w-full border border-white/10 px-2 py-1 text-left hover:border-cyan-300/40 hover:text-cyan-200">Open File Browser</button><button onClick={() => setView('architecture')} className="block w-full border border-white/10 px-2 py-1 text-left hover:border-cyan-300/40 hover:text-cyan-200">Visualize Architecture</button><button onClick={() => setView('terminal')} className="block w-full border border-white/10 px-2 py-1 text-left hover:border-cyan-300/40 hover:text-cyan-200">Open Terminal</button><button onClick={() => setView('settings')} className="block w-full border border-white/10 px-2 py-1 text-left hover:border-cyan-300/40 hover:text-cyan-200">Desk Settings</button></div></aside><main className="min-h-0 overflow-hidden rounded border border-cyan-300/15 bg-[#020617]/70"><div className="flex h-9 items-center justify-between border-b border-white/10 bg-white/[0.03] px-3"><span className="text-[10px] uppercase tracking-[0.2em] text-cyan-300">{title} Window</span><span className="text-[9px] uppercase tracking-[0.14em] text-white/35">GNOME-style Olympus shell</span></div><div className="h-[calc(100%-36px)] overflow-auto custom-scrollbar p-4">{view === 'core' && <CoreView />}{view === 'apps' && <AppsView setView={setView} />}{view === 'files' && <FilesView />}{view === 'architecture' && <ArchitectureView />}{view === 'terminal' && <TerminalView />}{view === 'services' && <ServicesView />}{view === 'packages' && <PackagesView />}{view === 'intelmaps' && <IntelMapsDeskView />}{view === 'monitor' && <MonitorDeskWorkspace />}{view === 'settings' && <SettingsView dock={dock} setDock={setDock} height={height} setHeight={setHeight} />}{['cad', 'admin'].includes(view) && <ModuleView view={view} />}</div></main></div>;
}

function CoreView() { return <Panel title="Core System" text="Olympus Core controls the Debian/GNOME shell layer, tile screens, Desk, Dock, and operational apps." />; }
function IntelMapsDeskView() { return <Panel title="Intel Maps" text="The Intel Maps Dock button deploys the map workspace bar. Flight, Maritime, Monitor, DOT, and Cyber open from that app." />; }
function FilesView() { return <Panel title="File Browser" text="Olympus file areas and system paths will be exposed here as a controlled file surface." />; }
function TerminalView() { return <Panel title="Olympus Terminal" text="Controlled backend command actions will be wired later." />; }
function ServicesView() { return <Panel title="Debian / Olympus Services" text="Service status placeholders for the OS Desk." />; }
function PackagesView() { return <Panel title="Debian Package Controls" text="Package and workflow placeholders for apt publish and reinstall verification." />; }
function SettingsView({ dock, setDock, height, setHeight }: { dock: DockPlacement; setDock: (dock: DockPlacement) => void; height: number; setHeight: (height: number) => void }) { return <div><h3 className="text-cyan-200 uppercase tracking-[0.18em] text-sm">Desk / Dock Settings</h3><div className="mt-4 grid gap-3 md:grid-cols-2"><StatusCard title="Dock Placement" value={dock} status="saved locally" /><StatusCard title="Desk Height" value={`${height}px`} status="saved locally" /><StatusCard title="Collapsed Latch" value="Dock remains anchored above company footer" status="active" /><StatusCard title="GNOME Integration" value="desktop file, autostart, icon package, kiosk mode" status="planned" /></div><div className="mt-4 flex gap-2 text-[10px] uppercase tracking-[0.14em]"><button onClick={() => setDock('left')} className="border border-white/10 px-2 py-1 text-white/55 hover:border-cyan-300/40 hover:text-cyan-200">Dock Left</button><button onClick={() => setDock('center')} className="border border-white/10 px-2 py-1 text-white/55 hover:border-cyan-300/40 hover:text-cyan-200">Dock Center</button><button onClick={() => setDock('right')} className="border border-white/10 px-2 py-1 text-white/55 hover:border-cyan-300/40 hover:text-cyan-200">Dock Right</button><button onClick={() => setHeight(DEFAULT_HEIGHT)} className="border border-white/10 px-2 py-1 text-white/55 hover:border-cyan-300/40 hover:text-cyan-200">Reset Height</button></div></div>; }
function AppsView({ setView }: { setView: (view: DeskView) => void }) { const groups = ['OS', 'Operational', 'System']; return <div><h3 className="text-cyan-200 uppercase tracking-[0.18em] text-sm">Apps Browser</h3>{groups.map((group) => <section key={group} className="mt-4"><div className="text-[10px] uppercase tracking-[0.18em] text-white/35">{group}</div><div className="mt-2 grid grid-cols-2 gap-3 xl:grid-cols-3">{deskItems.filter((item) => item.group === group).map((item) => <article key={item.id} className="border border-white/10 bg-white/[0.03] p-3 hover:border-cyan-300/35"><div className="flex items-center justify-between"><div className="flex items-center gap-2"><span className="text-xl text-cyan-200">{item.icon}</span><span className="font-bold text-white">{item.label}</span></div><span className={`text-[9px] uppercase tracking-[0.12em] ${item.status === 'active' ? 'text-emerald-300' : item.status === 'protected' ? 'text-amber-300' : 'text-white/35'}`}>{item.status}</span></div><p className="mt-2 text-xs text-white/45">{item.description}</p><button onClick={() => setView(item.view)} className="mt-3 border border-cyan-300/25 px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-cyan-200 hover:bg-cyan-300/10">Open</button></article>)}</div></section>)}</div>; }
function ArchitectureView() { return <div><h3 className="text-cyan-200 uppercase tracking-[0.18em] text-sm">Architecture Viewer</h3><div className="mt-4 grid gap-2">{architectureNodes.map(([label, detail], index) => <div key={label} className="flex items-center gap-3"><div className="flex h-8 w-8 items-center justify-center rounded-full border border-cyan-300/30 text-xs text-cyan-200">{index + 1}</div><div className="flex-1 border border-white/10 bg-white/[0.03] p-3"><div className="text-sm font-bold text-white">{label}</div><div className="text-xs text-white/45">{detail}</div></div></div>)}</div></div>; }
function ModuleView({ view }: { view: DeskView }) { return <Panel title={`${view} workspace`} text="Desk workspace placeholder. Tile screens and Intel Maps remain unchanged until a widget is intentionally placed onto them." />; }
function Panel({ title, text }: { title: string; text: string }) { return <div><h3 className="text-cyan-200 uppercase tracking-[0.18em] text-sm">{title}</h3><p className="mt-3 text-sm text-white/60">{text}</p></div>; }
function StatusCard({ title, value, status }: { title: string; value: string; status: string }) { return <div className="border border-white/10 bg-white/[0.03] p-3"><div className="text-[10px] uppercase tracking-[0.18em] text-white/35">{title}</div><div className="mt-1 break-all font-mono text-white">{value}</div><div className="mt-2 text-[9px] uppercase tracking-[0.14em] text-cyan-300">{status}</div></div>; }
