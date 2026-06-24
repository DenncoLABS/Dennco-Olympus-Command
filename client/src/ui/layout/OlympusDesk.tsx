import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useRuntimeSettings } from '../../admin/runtimeSettings';
import type { ActiveModule } from '../theme/theme.store';

type DeskView = 'core' | 'apps' | 'files' | 'architecture' | 'terminal' | 'flight' | 'maritime' | 'monitor' | 'dot' | 'cad' | 'admin' | 'settings';
type DockPlacement = 'left' | 'center' | 'right';

type DeskItem = {
  id: string;
  label: string;
  icon: string;
  module?: ActiveModule;
  view: DeskView;
};

const HEIGHT_KEY = 'olympus.desk.height.v1';
const DOCK_KEY = 'olympus.desk.dockPlacement.v1';
const VIEW_KEY = 'olympus.desk.activeView.v1';

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
  return Math.max(108, Math.min(height, Math.floor(window.innerHeight * 0.72)));
}

function readPlacement(): DockPlacement {
  const raw = localStorage.getItem(DOCK_KEY);
  return raw === 'left' || raw === 'right' || raw === 'center' ? raw : 'center';
}

function readView(): DeskView {
  const raw = localStorage.getItem(VIEW_KEY) as DeskView | null;
  return deskItems.some((item) => item.view === raw) ? raw as DeskView : 'core';
}

const dockPlacementClasses: Record<DockPlacement, string> = {
  left: 'justify-start',
  center: 'justify-center',
  right: 'justify-end',
};

export const OlympusDesk: React.FC = () => {
  const { settings } = useRuntimeSettings();
  const [deskHeight, setDeskHeight] = useState(() => clampHeight(readNumber(HEIGHT_KEY, 168)));
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

  return (
    <div className="fixed left-0 right-0 bottom-6 z-[4200] pointer-events-none font-mono">
      <div
        className={`mx-auto w-[calc(100vw-48px)] max-w-[1500px] pointer-events-auto transition-transform duration-300 ${isOpen ? 'translate-y-0' : 'translate-y-[calc(100%-44px)]'}`}
        style={{ height: `${deskHeight}px` }}
      >
        <div className="relative h-full rounded-t-2xl border border-cyan-300/25 bg-black/82 shadow-[0_0_38px_rgba(34,211,238,0.22)] backdrop-blur-xl overflow-hidden">
          <div
            className="absolute left-1/2 top-0 z-20 h-4 w-40 -translate-x-1/2 cursor-ns-resize rounded-b border-x border-b border-cyan-300/25 bg-cyan-300/10 text-center text-[8px] uppercase tracking-[0.24em] text-cyan-200/65"
            onPointerDown={beginResize}
            onPointerMove={moveResize}
            onPointerUp={endResize}
            onPointerCancel={endResize}
          >
            Drag Desk
          </div>

          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 pt-5">
              <div>
                <div className="text-[10px] uppercase tracking-[0.26em] text-cyan-300">Olympus Desk</div>
                <div className="mt-1 text-xs uppercase tracking-[0.16em] text-white/40">Core OS workspace · Debian/GNOME shell concept</div>
              </div>
              <div className="flex items-center gap-2 text-[9px] uppercase tracking-[0.14em] text-white/45">
                <button onClick={() => setDockPlacement('left')} className={`border px-2 py-1 ${dockPlacement === 'left' ? 'border-cyan-300/60 text-cyan-200' : 'border-white/10 hover:border-cyan-300/40'}`}>Dock Left</button>
                <button onClick={() => setDockPlacement('center')} className={`border px-2 py-1 ${dockPlacement === 'center' ? 'border-cyan-300/60 text-cyan-200' : 'border-white/10 hover:border-cyan-300/40'}`}>Dock Center</button>
                <button onClick={() => setDockPlacement('right')} className={`border px-2 py-1 ${dockPlacement === 'right' ? 'border-cyan-300/60 text-cyan-200' : 'border-white/10 hover:border-cyan-300/40'}`}>Dock Right</button>
                <button onClick={() => setIsOpen((open) => !open)} className="border border-white/10 px-2 py-1 text-cyan-200 hover:border-cyan-300/60">{isOpen ? 'Hide' : 'Show'}</button>
              </div>
            </div>

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
          </div>
        </div>
      </div>
    </div>
  );
};

function DeskAppView({ view }: { view: DeskView }) {
  const title = view.toUpperCase();
  return (
    <div className="grid h-full grid-cols-[260px_1fr] gap-4 text-white/70">
      <div className="rounded border border-white/10 bg-black/35 p-3">
        <div className="text-[10px] uppercase tracking-[0.22em] text-cyan-300">Desk App</div>
        <div className="mt-2 text-2xl font-bold uppercase tracking-[0.14em] text-white">{title}</div>
        <div className="mt-2 text-xs leading-relaxed text-white/45">This opens inside the Olympus Desk. It does not change the Earth/map screen until we intentionally drag or publish a widget onto the map workspace.</div>
      </div>
      <div className="min-h-0 overflow-auto rounded border border-cyan-300/15 bg-[#020617]/70 p-4">
        {view === 'core' && <CoreView />}
        {view === 'apps' && <AppsView />}
        {view === 'files' && <FilesView />}
        {view === 'architecture' && <ArchitectureView />}
        {view === 'terminal' && <TerminalView />}
        {view === 'settings' && <SettingsView />}
        {['flight', 'maritime', 'monitor', 'dot', 'cad', 'admin'].includes(view) && <ModuleView view={view} />}
      </div>
    </div>
  );
}

function CoreView() {
  return <div><h3 className="text-cyan-200 uppercase tracking-[0.18em] text-sm">Core system</h3><p className="mt-3 text-sm text-white/60">Olympus Core will become the local OS control surface for Debian/GNOME services, package state, data folders, modules, and command apps.</p></div>;
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

function SettingsView() {
  return <div><h3 className="text-cyan-200 uppercase tracking-[0.18em] text-sm">Desk settings</h3><p className="mt-3 text-sm text-white/60">Dock placement and Desk height are already saved locally. More runtime customizations will attach here.</p></div>;
}

function ModuleView({ view }: { view: DeskView }) {
  return <div><h3 className="text-cyan-200 uppercase tracking-[0.18em] text-sm">{view} desk app</h3><p className="mt-3 text-sm text-white/60">This is the Desk-side launcher surface for {view}. The Earth/map screen remains unchanged. Later we can drag windows from here onto the map as widgets.</p></div>;
}
