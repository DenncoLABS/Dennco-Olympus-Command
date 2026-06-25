import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useRuntimeSettings } from '../../admin/runtimeSettings';
import { useThemeStore, type ActiveModule } from '../theme/theme.store';
import { MonitorDeskWidgets } from '../../modules/monitor/widgets/MonitorDeskWidgets';

type DeskView = 'core' | 'apps' | 'files' | 'architecture' | 'terminal' | 'settings';
type DockPlacement = 'full' | 'left' | 'center' | 'right';
type ActiveDeskApp = 'intel-maps' | 'cad' | null;
type DeskItem = { id: string; label: string; icon: string; view: DeskView };

const HEIGHT_KEY = 'olympus.desktop.height.clean.v2';
const DOCK_KEY = 'olympus.desktop.dock.clean.v2';
const VIEW_KEY = 'olympus.desktop.view.clean.v2';
const ACTIVE_APP_KEY = 'olympus.desktop.activeApp.clean.v2';
const HOVER_OPEN_KEY = 'olympus.desktop.hoverOpen.clean.v2';

const dockItems: DeskItem[] = [
  { id: 'core', label: 'Core', icon: 'Ω', view: 'core' },
  { id: 'apps', label: 'Apps', icon: '▦', view: 'apps' },
  { id: 'files', label: 'Files', icon: '▣', view: 'files' },
  { id: 'architecture', label: 'Architecture', icon: '⌬', view: 'architecture' },
  { id: 'terminal', label: 'Terminal', icon: '⌁', view: 'terminal' },
  { id: 'settings', label: 'Settings', icon: '◎', view: 'settings' },
];

const mapApps: Array<{ id: ActiveModule; label: string; detail: string }> = [
  { id: 'flights', label: 'Flight', detail: 'Aircraft, airports, and airspace map.' },
  { id: 'maritime', label: 'Maritime', detail: 'Vessels, ports, and waterway map.' },
  { id: 'monitor', label: 'Monitor', detail: 'Global monitor map and saved widgets.' },
  { id: 'dot', label: 'DOT', detail: 'Traffic, cameras, and road map.' },
];

function readNumber(key: string, fallback: number) {
  const raw = Number(localStorage.getItem(key));
  return Number.isFinite(raw) ? raw : fallback;
}
function clampHeight(value: number) {
  return Math.max(132, Math.min(value, Math.floor(window.innerHeight * 0.74)));
}
function readDock(): DockPlacement {
  const raw = localStorage.getItem(DOCK_KEY);
  return raw === 'full' || raw === 'left' || raw === 'right' || raw === 'center' ? raw : 'center';
}
function readView(): DeskView {
  const raw = localStorage.getItem(VIEW_KEY) as DeskView | null;
  return dockItems.some((item) => item.view === raw) ? raw as DeskView : 'core';
}
function readActiveApp(): ActiveDeskApp {
  const raw = localStorage.getItem(ACTIVE_APP_KEY);
  return raw === 'intel-maps' || raw === 'cad' ? raw : null;
}
function readHoverOpen() {
  return localStorage.getItem(HOVER_OPEN_KEY) === 'true';
}

const dockJustify: Record<DockPlacement, string> = {
  full: 'justify-center',
  left: 'justify-start',
  center: 'justify-center',
  right: 'justify-end',
};

export const OlympusDesktopManagerClean: React.FC = () => {
  const { settings } = useRuntimeSettings();
  const activeModule = useThemeStore((state) => state.activeModule);
  const setActiveModule = useThemeStore((state) => state.setActiveModule);
  const [deskHeight, setDeskHeight] = useState(() => clampHeight(readNumber(HEIGHT_KEY, 300)));
  const [dock, setDock] = useState<DockPlacement>(() => readDock());
  const [open, setOpen] = useState(true);
  const [hoverOpen, setHoverOpen] = useState(() => readHoverOpen());
  const [hovering, setHovering] = useState(false);
  const [activeView, setActiveView] = useState<DeskView>(() => readView());
  const [activeDeskApp, setActiveDeskApp] = useState<ActiveDeskApp>(() => readActiveApp());
  const deskDrag = useRef<{ id: number; y: number; h: number } | null>(null);

  const enabledMapApps = useMemo(() => mapApps.filter((item) => settings.featureToggles[item.id] !== false), [settings.featureToggles]);
  const effectiveOpen = open || (hoverOpen && hovering);
  const visibleHeight = effectiveOpen ? deskHeight : 18;

  useEffect(() => localStorage.setItem(HEIGHT_KEY, String(deskHeight)), [deskHeight]);
  useEffect(() => localStorage.setItem(DOCK_KEY, dock), [dock]);
  useEffect(() => localStorage.setItem(VIEW_KEY, activeView), [activeView]);
  useEffect(() => localStorage.setItem(HOVER_OPEN_KEY, String(hoverOpen)), [hoverOpen]);
  useEffect(() => {
    if (activeDeskApp) localStorage.setItem(ACTIVE_APP_KEY, activeDeskApp);
    else localStorage.removeItem(ACTIVE_APP_KEY);
  }, [activeDeskApp]);

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
    try { event.currentTarget.releasePointerCapture(event.pointerId); } catch { /* capture already released */ }
  };

  const openView = (view: DeskView) => {
    setOpen(true);
    setActiveView(view);
    if (view !== 'apps') setActiveDeskApp(null);
  };
  const openIntelMaps = () => { setOpen(true); setActiveView('apps'); setActiveDeskApp('intel-maps'); };
  const openCad = () => { setOpen(true); setActiveView('apps'); setActiveDeskApp('cad'); setActiveModule('cad'); };
  const closeAppBar = () => setActiveDeskApp(null);

  return (
    <section
      className="relative z-[4200] w-full shrink-0 border-t border-cyan-300/25 bg-black/90 font-mono shadow-[0_-16px_40px_rgba(0,0,0,0.82)] transition-[height] duration-200"
      style={{ height: visibleHeight }}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <div className="absolute left-1/2 top-0 z-40 h-3 w-44 -translate-x-1/2 cursor-ns-resize rounded-b border-x border-b border-cyan-300/25 bg-cyan-300/10 text-center text-[7px] uppercase tracking-[0.22em] text-cyan-200/65" onPointerDown={startDeskResize} onPointerMove={moveDeskResize} onPointerUp={endDeskResize} onPointerCancel={endDeskResize}>Desk</div>
      {!effectiveOpen && <button onClick={() => setOpen(true)} className="absolute inset-x-0 top-0 z-30 h-full text-[8px] uppercase tracking-[0.24em] text-cyan-200/45 hover:text-cyan-200">Olympus Desk {hoverOpen ? '· hover to open' : '· click to open'}</button>}
      {effectiveOpen && <div className="flex h-full flex-col overflow-hidden">
        <div className="flex h-11 items-center justify-between border-b border-white/10 px-4 pt-2">
          <div><div className="text-[10px] uppercase tracking-[0.26em] text-cyan-300">Olympus Desk</div><div className="text-[9px] uppercase tracking-[0.16em] text-white/40">OS workspace · Apps opens Intel Maps and CAD</div></div>
          <div className="flex items-center gap-2 text-[9px] uppercase tracking-[0.14em] text-white/45">
            {activeDeskApp && <span className="text-cyan-200">App Bar: {activeDeskApp === 'intel-maps' ? 'Intel Maps' : 'CAD'}</span>}
            <button onClick={() => setDock('full')} className={`border px-2 py-1 ${dock === 'full' ? 'border-cyan-300/60 text-cyan-200' : 'border-white/10 hover:border-cyan-300/40'}`}>Full</button>
            <button onClick={() => setDock('left')} className={`border px-2 py-1 ${dock === 'left' ? 'border-cyan-300/60 text-cyan-200' : 'border-white/10 hover:border-cyan-300/40'}`}>Dock Left</button>
            <button onClick={() => setDock('center')} className={`border px-2 py-1 ${dock === 'center' ? 'border-cyan-300/60 text-cyan-200' : 'border-white/10 hover:border-cyan-300/40'}`}>Dock Center</button>
            <button onClick={() => setDock('right')} className={`border px-2 py-1 ${dock === 'right' ? 'border-cyan-300/60 text-cyan-200' : 'border-white/10 hover:border-cyan-300/40'}`}>Dock Right</button>
            <button onClick={() => setHoverOpen((value) => !value)} className={`border px-2 py-1 ${hoverOpen ? 'border-emerald-300/60 text-emerald-200' : 'border-white/10 hover:border-emerald-300/40'}`}>Hover Open</button>
            <button onClick={() => { setOpen(false); setHovering(false); }} className="border border-white/10 px-2 py-1 text-cyan-200 hover:border-cyan-300/60">Hide</button>
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-hidden bg-[radial-gradient(rgba(34,211,238,0.08)_1px,transparent_1px)] bg-[size:22px_22px] p-4"><DeskContent view={activeView} activeDeskApp={activeDeskApp} activeModule={activeModule} mapApps={enabledMapApps} onOpenIntelMaps={openIntelMaps} onOpenCad={openCad} onSelectMap={setActiveModule} onCloseAppBar={closeAppBar} /></div>
        <div className={`flex border-t border-cyan-300/15 bg-black/65 px-3 py-2 ${dockJustify[dock]}`}><div className={`flex items-end gap-2 overflow-x-auto rounded-2xl border border-cyan-300/20 bg-white/[0.03] px-3 py-2 shadow-[0_0_24px_rgba(34,211,238,0.12)] ${dock === 'full' ? 'w-full justify-center' : 'max-w-full'}`}><div className="mr-2 hidden min-w-[110px] flex-col items-start border-r border-white/10 pr-3 md:flex"><span className="text-[9px] uppercase tracking-[0.22em] text-cyan-300">Olympus Dock</span><span className="text-[8px] uppercase tracking-[0.16em] text-white/35">Core launcher</span></div>{dockItems.map((item) => <button key={item.id} onClick={() => openView(item.view)} className={`group flex min-w-[58px] flex-col items-center justify-center rounded-xl border px-2 py-1.5 transition-all ${activeView === item.view ? 'border-cyan-300/60 bg-cyan-400/15 text-cyan-100 shadow-[0_0_18px_rgba(34,211,238,0.25)]' : 'border-white/10 bg-white/[0.03] text-white/55 hover:border-cyan-300/40 hover:bg-cyan-400/10 hover:text-cyan-100'}`}><span className="text-lg leading-none">{item.icon}</span><span className="mt-1 text-[8px] uppercase tracking-[0.1em]">{item.label}</span></button>)}</div></div>
      </div>}
    </section>
  );
};

function DeskContent({ view, activeDeskApp, activeModule, mapApps, onOpenIntelMaps, onOpenCad, onSelectMap, onCloseAppBar }: { view: DeskView; activeDeskApp: ActiveDeskApp; activeModule: ActiveModule; mapApps: Array<{ id: ActiveModule; label: string; detail: string }>; onOpenIntelMaps: () => void; onOpenCad: () => void; onSelectMap: (module: ActiveModule) => void; onCloseAppBar: () => void }) {
  if (view === 'apps') return <AppsView activeDeskApp={activeDeskApp} activeModule={activeModule} mapApps={mapApps} onOpenIntelMaps={onOpenIntelMaps} onOpenCad={onOpenCad} onSelectMap={onSelectMap} onCloseAppBar={onCloseAppBar} />;
  if (view === 'terminal') return <TerminalView />;
  if (view === 'files') return <FilesView />;
  if (view === 'architecture') return <ArchitectureView />;
  if (view === 'settings') return <SettingsView />;
  return <CoreView onOpenAdmin={() => onSelectMap('admin')} />;
}

function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return <div><h3 className="text-cyan-200 uppercase tracking-[0.18em] text-sm">{title}</h3>{subtitle && <p className="mt-2 text-sm text-white/55">{subtitle}</p>}</div>;
}

function CoreView({ onOpenAdmin }: { onOpenAdmin: () => void }) {
  return <div className="h-full overflow-auto"><SectionTitle title="Core" subtitle="Utilities, files, packages, services, admin, and system controls live here." /><div className="mt-4 grid grid-cols-2 lg:grid-cols-5 gap-3 text-sm"><CoreCard title="Files" detail="File browser staging." /><CoreCard title="Packages" detail="Apt package and source controls." /><CoreCard title="Services" detail="Service status and controls." /><CoreCard title="Settings" detail="Desk and OS workspace preferences." /><button onClick={onOpenAdmin} className="text-left border border-white/10 bg-white/[0.03] p-3 hover:border-cyan-300/40"><div className="font-bold text-white">Admin</div><div className="mt-1 text-xs text-white/40">Open Admin screen.</div></button></div><div className="mt-5"><MonitorDeskWidgets /></div></div>;
}

function CoreCard({ title, detail }: { title: string; detail: string }) { return <div className="border border-white/10 bg-white/[0.03] p-3"><div className="font-bold text-white">{title}</div><div className="mt-1 text-xs text-white/40">{detail}</div></div>; }
function AppsView({ activeDeskApp, activeModule, mapApps, onOpenIntelMaps, onOpenCad, onSelectMap, onCloseAppBar }: { activeDeskApp: ActiveDeskApp; activeModule: ActiveModule; mapApps: Array<{ id: ActiveModule; label: string; detail: string }>; onOpenIntelMaps: () => void; onOpenCad: () => void; onSelectMap: (module: ActiveModule) => void; onCloseAppBar: () => void }) { return <div className="h-full overflow-auto space-y-4"><SectionTitle title="Apps" subtitle="Application families live here. Core utilities are under Core." /><div className="grid grid-cols-2 gap-3"><button onClick={onOpenIntelMaps} className={`text-left border p-4 ${activeDeskApp === 'intel-maps' ? 'border-cyan-300/70 bg-cyan-400/10' : 'border-white/10 bg-white/[0.03] hover:border-cyan-300/40'}`}><div className="text-xl text-cyan-200">◉ Intel Maps</div><div className="mt-2 text-xs text-white/45">Flight, Maritime, Monitor, and DOT map screens.</div></button><button onClick={onOpenCad} className={`text-left border p-4 ${activeDeskApp === 'cad' ? 'border-cyan-300/70 bg-cyan-400/10' : 'border-white/10 bg-white/[0.03] hover:border-cyan-300/40'}`}><div className="text-xl text-cyan-200">☷ CAD</div><div className="mt-2 text-xs text-white/45">Dispatch, calls, units, personnel, logs, inventory.</div></button></div>{activeDeskApp === 'intel-maps' && <IntelMapsAppBar activeModule={activeModule} modules={mapApps} onSelect={onSelectMap} onClose={onCloseAppBar} />}{activeDeskApp === 'cad' && <CadAppBar onClose={onCloseAppBar} />}</div>; }
function IntelMapsAppBar({ activeModule, modules, onSelect, onClose }: { activeModule: ActiveModule; modules: Array<{ id: ActiveModule; label: string; detail: string }>; onSelect: (module: ActiveModule) => void; onClose: () => void }) { return <div className="border border-cyan-300/20 bg-black/35 p-3"><div className="mb-3 flex items-center justify-between"><div><div className="text-[10px] uppercase tracking-[0.22em] text-cyan-300">Intel Maps App Bar</div><div className="mt-1 text-xs text-white/45">Select the map shown on the Earth screen.</div></div><button onClick={onClose} className="border border-white/10 px-2 py-1 text-[10px] uppercase text-white/50 hover:text-white">Close</button></div><div className="grid grid-cols-2 lg:grid-cols-4 gap-2">{modules.map((module) => <button key={module.id} onClick={() => onSelect(module.id)} className={`text-left border p-3 ${activeModule === module.id ? 'border-cyan-300/70 bg-cyan-400/10 text-cyan-100' : 'border-white/10 bg-white/[0.03] text-white/65 hover:border-cyan-300/40'}`}><div className="font-bold uppercase tracking-[0.1em] text-xs">{module.label}</div><div className="mt-1 text-[10px] text-white/40">{module.detail}</div></button>)}</div></div>; }
function CadAppBar({ onClose }: { onClose: () => void }) { return <div className="border border-cyan-300/20 bg-black/35 p-3"><div className="flex items-center justify-between"><span className="text-cyan-200 uppercase tracking-[0.16em] text-xs">CAD App Bar</span><button onClick={onClose} className="border border-white/10 px-2 py-1 text-[10px] uppercase text-white/50 hover:text-white">Close</button></div><div className="mt-2 text-white/55">CAD is active on the Earth screen. CAD sub-apps will open here as the OS GUI grows.</div></div>; }
function TerminalView() { return <div className="h-full rounded border border-emerald-400/20 bg-black p-4 text-sm text-emerald-300"><div className="text-[10px] uppercase tracking-[0.2em] text-emerald-200/60">Olympus Terminal</div><div className="mt-4">olympus-shell$ <span className="animate-pulse">_</span></div></div>; }
function FilesView() { return <div><SectionTitle title="Files" subtitle="File selector placeholder for Olympus paths and future selected-file actions." /><pre className="mt-4 border border-white/10 bg-black/40 p-3 text-xs text-emerald-200">/opt/dennco/olympus-command{`\n`}/etc/dennco/olympus-command{`\n`}/var/lib/dennco</pre></div>; }
function ArchitectureView() { return <div><SectionTitle title="Architecture" subtitle="Debian → GNOME → Olympus Core → Earth screen → Desk → Dock → Apps." /><div className="mt-3 text-xs leading-6 text-white/60"><div>Apps → Intel Maps / CAD</div><div>Intel Maps → Flight / Maritime / Monitor / DOT</div><div>Core → Files / Packages / Services / Admin</div></div></div>; }
function SettingsView() { return <div><SectionTitle title="Settings" subtitle="Desk height, full Dock mode, compact close, hover-open behavior, app bar behavior, and future OS preferences." /></div>; }
