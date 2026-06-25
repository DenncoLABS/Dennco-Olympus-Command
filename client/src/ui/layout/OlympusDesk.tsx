import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useRuntimeSettings } from '../../admin/runtimeSettings';
import type { ActiveModule } from '../theme/theme.store';
import { monitorDeskWidgetManifest, type MonitorDeskWidgetId } from '../../modules/monitor/widgets/monitorDeskWidgetManifest';

type DeskView = 'core' | 'apps' | 'files' | 'architecture' | 'terminal' | 'flight' | 'maritime' | 'monitor' | 'dot' | 'cad' | 'admin' | 'settings';
type DockPlacement = 'left' | 'center' | 'right';

type DeskItem = {
  id: string;
  label: string;
  icon: string;
  module?: ActiveModule;
  view: DeskView;
};

const HEIGHT_KEY = 'olympus.desk.height.v2';
const DOCK_KEY = 'olympus.desk.dockPlacement.v2';
const VIEW_KEY = 'olympus.desk.activeView.v2';
const MONITOR_WIDGET_ORDER_KEY = 'olympus.desk.monitorWidgetOrder.v1';
const EARTH_WIDGETS_KEY = 'olympus.desk.earthStagedWidgets.v1';
const DEFAULT_MONITOR_WIDGET_ORDER = monitorDeskWidgetManifest.map((widget) => widget.id);

const deskItems: DeskItem[] = [
  { id: 'core', label: 'Core', icon: 'Ω', view: 'core' },
  { id: 'apps', label: 'Apps', icon: '▦', view: 'apps' },
  { id: 'files', label: 'Files', icon: '▣', view: 'files' },
  { id: 'architecture', label: 'Architecture', icon: '⌬', view: 'architecture' },
  { id: 'terminal', label: 'Terminal', icon: '⌁', view: 'terminal' },
  { id: 'flights', label: 'Flight', icon: '✈', view: 'flight', module: 'flights' },
  { id: 'maritime', label: 'Maritime', icon: '⛴', view: 'maritime', module: 'maritime' },
  { id: 'monitor', label: 'Monitor', icon: '◉', view: 'monitor', module: 'monitor' },
  { id: 'dot', label: 'DOT', icon: '◆', view: 'dot', module: 'dot' },
  { id: 'cad', label: 'CAD', icon: '☷', view: 'cad', module: 'cad' },
  { id: 'admin', label: 'Admin', icon: '⚙', view: 'admin', module: 'admin' },
  { id: 'settings', label: 'Settings', icon: '◎', view: 'settings' },
];

function readNumber(key: string, fallback: number) {
  const raw = Number(localStorage.getItem(key));
  return Number.isFinite(raw) ? raw : fallback;
}

function clampHeight(height: number) {
  return Math.max(112, Math.min(height, Math.floor(window.innerHeight * 0.72)));
}

function readPlacement(): DockPlacement {
  const raw = localStorage.getItem(DOCK_KEY);
  return raw === 'left' || raw === 'right' || raw === 'center' ? raw : 'center';
}

function readView(): DeskView {
  const raw = localStorage.getItem(VIEW_KEY) as DeskView | null;
  return deskItems.some((item) => item.view === raw) ? raw as DeskView : 'core';
}

function readMonitorWidgetOrder(): MonitorDeskWidgetId[] {
  try {
    const raw = localStorage.getItem(MONITOR_WIDGET_ORDER_KEY);
    const parsed = raw ? JSON.parse(raw) as MonitorDeskWidgetId[] : [];
    const valid = parsed.filter((id) => DEFAULT_MONITOR_WIDGET_ORDER.includes(id));
    return [...valid, ...DEFAULT_MONITOR_WIDGET_ORDER.filter((id) => !valid.includes(id))];
  } catch {
    return DEFAULT_MONITOR_WIDGET_ORDER;
  }
}

function readEarthWidgets(): MonitorDeskWidgetId[] {
  try {
    const raw = localStorage.getItem(EARTH_WIDGETS_KEY);
    const parsed = raw ? JSON.parse(raw) as MonitorDeskWidgetId[] : [];
    return parsed.filter((id) => DEFAULT_MONITOR_WIDGET_ORDER.includes(id));
  } catch {
    return [];
  }
}

const dockPlacementClasses: Record<DockPlacement, string> = {
  left: 'justify-start',
  center: 'justify-center',
  right: 'justify-end',
};

export const OlympusDesk: React.FC = () => {
  const { settings } = useRuntimeSettings();
  const [deskHeight, setDeskHeight] = useState(() => clampHeight(readNumber(HEIGHT_KEY, 214)));
  const [activeView, setActiveView] = useState<DeskView>(() => readView());
  const [isOpen, setIsOpen] = useState(true);
  const [dockPlacement, setDockPlacement] = useState<DockPlacement>(() => readPlacement());
  const dragRef = useRef<{ pointerId: number; startY: number; startHeight: number } | null>(null);

  const enabledItems = useMemo(
    () => deskItems.filter((item) => !item.module || settings.featureToggles[item.module] !== false),
    [settings.featureToggles],
  );

  useEffect(() => {
    localStorage.setItem(HEIGHT_KEY, String(deskHeight));
  }, [deskHeight]);

  useEffect(() => {
    localStorage.setItem(VIEW_KEY, activeView);
  }, [activeView]);

  useEffect(() => {
    localStorage.setItem(DOCK_KEY, dockPlacement);
  }, [dockPlacement]);

  useEffect(() => {
    const handleResize = () => setDeskHeight((height) => clampHeight(height));
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const beginResize = (event: React.PointerEvent<HTMLDivElement>) => {
    dragRef.current = { pointerId: event.pointerId, startY: event.clientY, startHeight: deskHeight };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const moveResize = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    setDeskHeight(clampHeight(drag.startHeight + (drag.startY - event.clientY)));
  };

  const endResize = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    dragRef.current = null;
    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      // Browser may release capture first.
    }
  };

  const visibleHeight = isOpen ? deskHeight : 44;

  return (
    <section className="relative z-[4200] w-full shrink-0 pointer-events-auto font-mono border-t border-cyan-300/25 bg-black/88 shadow-[0_-16px_40px_rgba(0,0,0,0.82)]" style={{ height: `${visibleHeight}px` }}>
      <div
        className="absolute left-1/2 top-0 z-20 h-4 w-48 -translate-x-1/2 cursor-ns-resize rounded-b border-x border-b border-cyan-300/25 bg-cyan-300/10 text-center text-[8px] uppercase tracking-[0.24em] text-cyan-200/65"
        onPointerDown={beginResize}
        onPointerMove={moveResize}
        onPointerUp={endResize}
        onPointerCancel={endResize}
      >
        Drag Desk
      </div>

      <div className="flex h-full flex-col overflow-hidden">
        <div className="flex h-11 items-center justify-between border-b border-white/10 px-4 pt-2">
          <div>
            <div className="text-[10px] uppercase tracking-[0.26em] text-cyan-300">Olympus Desk</div>
            <div className="text-[9px] uppercase tracking-[0.16em] text-white/40">Full-width OS workspace · pushes Earth screen upward</div>
          </div>
          <div className="flex items-center gap-2 text-[9px] uppercase tracking-[0.14em] text-white/45">
            <button onClick={() => setDockPlacement('left')} className={`border px-2 py-1 ${dockPlacement === 'left' ? 'border-cyan-300/60 text-cyan-200' : 'border-white/10 hover:border-cyan-300/40'}`}>Dock Left</button>
            <button onClick={() => setDockPlacement('center')} className={`border px-2 py-1 ${dockPlacement === 'center' ? 'border-cyan-300/60 text-cyan-200' : 'border-white/10 hover:border-cyan-300/40'}`}>Dock Center</button>
            <button onClick={() => setDockPlacement('right')} className={`border px-2 py-1 ${dockPlacement === 'right' ? 'border-cyan-300/60 text-cyan-200' : 'border-white/10 hover:border-cyan-300/40'}`}>Dock Right</button>
            <button onClick={() => setIsOpen((open) => !open)} className="border border-white/10 px-2 py-1 text-cyan-200 hover:border-cyan-300/60">{isOpen ? 'Hide' : 'Show'}</button>
          </div>
        </div>

        {isOpen && (
          <>
            <div className="min-h-0 flex-1 overflow-hidden px-4 py-3">
              <DeskAppView view={activeView} />
            </div>

            <div className={`border-t border-cyan-300/15 bg-black/65 px-3 py-2 ${dockPlacementClasses[dockPlacement]} flex`}>
              <div className="flex max-w-full items-end gap-2 overflow-x-auto rounded-2xl border border-cyan-300/20 bg-white/[0.03] px-3 py-2 shadow-[0_0_24px_rgba(34,211,238,0.12)]">
                <div className="mr-2 hidden min-w-[110px] flex-col items-start border-r border-white/10 pr-3 md:flex">
                  <span className="text-[9px] uppercase tracking-[0.22em] text-cyan-300">Olympus Dock</span>
                  <span className="text-[8px] uppercase tracking-[0.16em] text-white/35">Movable launcher</span>
                </div>
                {enabledItems.map((item) => {
                  const selected = activeView === item.view;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setActiveView(item.view)}
                      className={`group flex min-w-[58px] flex-col items-center justify-center rounded-xl border px-2 py-1.5 transition-all ${
                        selected
                          ? 'border-cyan-300/60 bg-cyan-400/15 text-cyan-100 shadow-[0_0_18px_rgba(34,211,238,0.25)]'
                          : 'border-white/10 bg-white/[0.03] text-white/55 hover:border-cyan-300/40 hover:bg-cyan-400/10 hover:text-cyan-100'
                      }`}
                      title={item.label}
                    >
                      <span className="text-lg leading-none">{item.icon}</span>
                      <span className="mt-1 text-[8px] uppercase tracking-[0.1em]">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

function DeskAppView({ view }: { view: DeskView }) {
  const title = view.toUpperCase();
  return (
    <div className="grid h-full grid-cols-[260px_1fr] gap-4 text-white/70">
      <div className="rounded border border-white/10 bg-black/35 p-3">
        <div className="text-[10px] uppercase tracking-[0.22em] text-cyan-300">Desk App</div>
        <div className="mt-2 text-2xl font-bold uppercase tracking-[0.14em] text-white">{title}</div>
        <div className="mt-2 text-xs leading-relaxed text-white/45">This opens inside the Olympus Desk. It does not change the Earth/map screen until a widget is intentionally placed onto the Earth workspace.</div>
      </div>
      <div className="min-h-0 overflow-auto rounded border border-cyan-300/15 bg-[#020617]/70 p-4">
        {view === 'core' && <CoreView />}
        {view === 'apps' && <AppsView />}
        {view === 'files' && <FilesView />}
        {view === 'architecture' && <ArchitectureView />}
        {view === 'terminal' && <TerminalView />}
        {view === 'settings' && <SettingsView />}
        {view === 'monitor' && <MonitorWidgetLibrary />}
        {['flight', 'maritime', 'dot', 'cad', 'admin'].includes(view) && <ModuleView view={view} />}
      </div>
    </div>
  );
}

function CoreView() {
  return <div><h3 className="text-cyan-200 uppercase tracking-[0.18em] text-sm">Core system</h3><p className="mt-3 text-sm text-white/60">Olympus Core is the local OS control surface for Debian/GNOME services, package state, data folders, modules, and command apps.</p></div>;
}

function AppsView() {
  return <div><h3 className="text-cyan-200 uppercase tracking-[0.18em] text-sm">Olympus apps</h3><div className="mt-3 grid grid-cols-2 gap-3 text-sm">{deskItems.filter((item) => item.module).map((item) => <div key={item.id} className="border border-white/10 bg-white/[0.03] p-3"><span className="mr-2 text-cyan-200">{item.icon}</span>{item.label}<div className="mt-1 text-xs text-white/35">Desk-contained app launcher. Earth integration later.</div></div>)}</div></div>;
}

function FilesView() {
  return <div><h3 className="text-cyan-200 uppercase tracking-[0.18em] text-sm">File browser</h3><p className="mt-3 text-sm text-white/60">Hard-coded file selection surface placeholder. Next we will wire safe server-side browsing for Olympus paths and selected-file actions.</p><pre className="mt-4 border border-white/10 bg-black/40 p-3 text-xs text-emerald-200">/opt/dennco/olympus-command{`\n`}/etc/dennco/olympus-command{`\n`}/var/lib/dennco</pre></div>;
}

function ArchitectureView() {
  return <div><h3 className="text-cyan-200 uppercase tracking-[0.18em] text-sm">Architecture viewer</h3><div className="mt-3 text-xs leading-6 text-white/60"><div>Debian → GNOME → Olympus Core GUI → Desk/Dock → Apps/Files/Architecture</div><div>Client modules → Flight / Maritime / Monitor / DOT / CAD / Admin</div><div>Server routes → API providers / diagnostics / local services</div><div>Package layer → systemd service / apt repo / runtime config</div></div></div>;
}

function TerminalView() {
  return <div className="h-full rounded border border-emerald-400/20 bg-black p-4 font-mono text-sm text-emerald-300 shadow-inner"><div className="text-[10px] uppercase tracking-[0.2em] text-emerald-200/60">Olympus Terminal</div><div className="mt-4">root@olympus:~# <span className="animate-pulse">_</span></div><div className="mt-3 text-xs text-emerald-300/55">Terminal surface placeholder. Commands will be wired through controlled backend actions later.</div></div>;
}

function MonitorWidgetLibrary() {
  const [order, setOrder] = useState<MonitorDeskWidgetId[]>(() => readMonitorWidgetOrder());
  const [draggedId, setDraggedId] = useState<MonitorDeskWidgetId | null>(null);
  const [earthWidgets, setEarthWidgets] = useState<MonitorDeskWidgetId[]>(() => readEarthWidgets());

  const orderedWidgets = order
    .map((id) => monitorDeskWidgetManifest.find((widget) => widget.id === id))
    .filter((widget): widget is (typeof monitorDeskWidgetManifest)[number] => Boolean(widget));

  const persistOrder = (next: MonitorDeskWidgetId[]) => {
    setOrder(next);
    localStorage.setItem(MONITOR_WIDGET_ORDER_KEY, JSON.stringify(next));
  };

  const moveWidget = (id: MonitorDeskWidgetId, direction: -1 | 1) => {
    const index = order.indexOf(id);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= order.length) return;
    const next = [...order];
    [next[index], next[target]] = [next[target], next[index]];
    persistOrder(next);
  };

  const dropWidget = (targetId: MonitorDeskWidgetId) => {
    if (!draggedId || draggedId === targetId) return;
    const next = order.filter((id) => id !== draggedId);
    const targetIndex = next.indexOf(targetId);
    next.splice(targetIndex, 0, draggedId);
    persistOrder(next);
    setDraggedId(null);
  };

  const toggleEarthWidget = (id: MonitorDeskWidgetId) => {
    const next = earthWidgets.includes(id) ? earthWidgets.filter((item) => item !== id) : [...earthWidgets, id];
    setEarthWidgets(next);
    localStorage.setItem(EARTH_WIDGETS_KEY, JSON.stringify(next));
  };

  return (
    <div className="h-full min-h-0 overflow-auto custom-scrollbar">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-cyan-200 uppercase tracking-[0.18em] text-sm">Monitor Widget Library</h3>
          <p className="mt-2 text-sm text-white/55">These are the old Monitor dashboard panels saved as Desk widgets. Drag cards to reorder them. Pin marks them for future Earth workspace placement.</p>
        </div>
        <div className="text-[10px] uppercase tracking-[0.14em] text-white/40">{earthWidgets.length} staged for Earth</div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {orderedWidgets.map((widget, index) => {
          const pinned = earthWidgets.includes(widget.id);
          return (
            <div
              key={widget.id}
              draggable
              onDragStart={() => setDraggedId(widget.id)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => dropWidget(widget.id)}
              className={`rounded border bg-white/[0.035] p-3 transition-all ${pinned ? 'border-cyan-300/50 shadow-[0_0_18px_rgba(34,211,238,0.16)]' : 'border-white/10 hover:border-cyan-300/35'}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.16em] text-white/35">Widget {index + 1}</div>
                  <div className="mt-1 text-sm font-bold text-white">{widget.title}</div>
                </div>
                <div className="cursor-grab text-cyan-300/50 active:cursor-grabbing">⋮⋮</div>
              </div>
              <div className="mt-2 min-h-[52px] text-xs leading-relaxed text-white/45">{widget.description}</div>
              <div className="mt-3 rounded border border-white/10 bg-black/35 p-2 text-[10px] text-white/35">{widget.futureUse}</div>
              <div className="mt-3 flex flex-wrap gap-2 text-[9px] uppercase tracking-[0.12em]">
                <button onClick={() => moveWidget(widget.id, -1)} className="border border-white/10 px-2 py-1 text-white/45 hover:border-cyan-300/45 hover:text-cyan-200">Move Left</button>
                <button onClick={() => moveWidget(widget.id, 1)} className="border border-white/10 px-2 py-1 text-white/45 hover:border-cyan-300/45 hover:text-cyan-200">Move Right</button>
                <button onClick={() => toggleEarthWidget(widget.id)} className={`border px-2 py-1 ${pinned ? 'border-cyan-300/60 text-cyan-200' : 'border-white/10 text-white/45 hover:border-cyan-300/45 hover:text-cyan-200'}`}>{pinned ? 'Earth Staged' : 'Pin to Earth'}</button>
              </div>
            </div>
          );
        })}
      </div>

      {earthWidgets.length > 0 && (
        <div className="mt-4 border border-cyan-300/20 bg-cyan-300/5 p-3">
          <div className="text-[10px] uppercase tracking-[0.18em] text-cyan-200">Earth Workspace Staging</div>
          <div className="mt-2 text-xs text-white/55">Pinned widgets are saved for the next phase, where they will become draggable overlays on the Earth/map screen.</div>
          <div className="mt-2 flex flex-wrap gap-2 text-[10px] text-cyan-200/80">
            {earthWidgets.map((id) => <span key={id} className="border border-cyan-300/25 px-2 py-1">{monitorDeskWidgetManifest.find((widget) => widget.id === id)?.title || id}</span>)}
          </div>
        </div>
      )}
    </div>
  );
}

function SettingsView() {
  return <div><h3 className="text-cyan-200 uppercase tracking-[0.18em] text-sm">Desk settings</h3><p className="mt-3 text-sm text-white/60">Dock placement, Desk height, Monitor widget order, and Earth-staged widget selections are saved locally. More runtime customizations will attach here.</p></div>;
}

function ModuleView({ view }: { view: DeskView }) {
  return <div><h3 className="text-cyan-200 uppercase tracking-[0.18em] text-sm">{view} desk app</h3><p className="mt-3 text-sm text-white/60">This is the Desk-side launcher surface for {view}. The Earth/map screen remains unchanged. Later we can drag windows from here onto the map as widgets.</p></div>;
}
