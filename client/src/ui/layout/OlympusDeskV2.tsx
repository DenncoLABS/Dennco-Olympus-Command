import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useRuntimeSettings } from '../../admin/runtimeSettings';
import type { ActiveModule } from '../theme/theme.store';
import { MonitorDeskWorkspace } from '../../modules/monitor/widgets/MonitorDeskWorkspace';

type DeskView = 'core' | 'apps' | 'files' | 'architecture' | 'terminal' | 'flight' | 'maritime' | 'monitor' | 'dot' | 'cad' | 'admin' | 'settings';
type DockPlacement = 'left' | 'center' | 'right';
type DeskItem = { id: string; label: string; icon: string; view: DeskView; module?: ActiveModule };

const HEIGHT_KEY = 'olympus.desk.v2.height';
const DOCK_KEY = 'olympus.desk.v2.dock';
const VIEW_KEY = 'olympus.desk.v2.view';

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

function savedNumber(key: string, fallback: number) {
  const value = Number(localStorage.getItem(key));
  return Number.isFinite(value) ? value : fallback;
}

function clampHeight(value: number) {
  return Math.max(112, Math.min(value, Math.floor(window.innerHeight * 0.72)));
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
  const [height, setHeight] = useState(() => clampHeight(savedNumber(HEIGHT_KEY, 240)));
  const [open, setOpen] = useState(true);
  const [view, setView] = useState<DeskView>(() => savedView());
  const [dock, setDock] = useState<DockPlacement>(() => savedDock());
  const resizeRef = useRef<{ pointerId: number; startY: number; startHeight: number } | null>(null);

  const launchers = useMemo(() => deskItems.filter((item) => !item.module || settings.featureToggles[item.module] !== false), [settings.featureToggles]);

  useEffect(() => { localStorage.setItem(HEIGHT_KEY, String(height)); }, [height]);
  useEffect(() => { localStorage.setItem(VIEW_KEY, view); }, [view]);
  useEffect(() => { localStorage.setItem(DOCK_KEY, dock); }, [dock]);

  useEffect(() => {
    const onResize = () => setHeight((current) => clampHeight(current));
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const startResize = (event: React.PointerEvent<HTMLDivElement>) => {
    resizeRef.current = { pointerId: event.pointerId, startY: event.clientY, startHeight: height };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const moveResize = (event: React.PointerEvent<HTMLDivElement>) => {
    const state = resizeRef.current;
    if (!state || state.pointerId !== event.pointerId) return;
    setHeight(clampHeight(state.startHeight + state.startY - event.clientY));
  };

  const stopResize = (event: React.PointerEvent<HTMLDivElement>) => {
    const state = resizeRef.current;
    if (!state || state.pointerId !== event.pointerId) return;
    resizeRef.current = null;
    try { event.currentTarget.releasePointerCapture(event.pointerId); } catch { /* noop */ }
  };

  const dockClass = dock === 'left' ? 'justify-start' : dock === 'right' ? 'justify-end' : 'justify-center';

  return (
    <section className="relative z-[4200] w-full shrink-0 border-t border-cyan-300/25 bg-black/90 font-mono text-white shadow-[0_-16px_40px_rgba(0,0,0,0.82)]" style={{ height: `${open ? height : 44}px` }}>
      <div
        className="absolute left-1/2 top-0 z-20 h-4 w-48 -translate-x-1/2 cursor-ns-resize rounded-b border-x border-b border-cyan-300/25 bg-cyan-300/10 text-center text-[8px] uppercase tracking-[0.24em] text-cyan-200/65"
        onPointerDown={startResize}
        onPointerMove={moveResize}
        onPointerUp={stopResize}
        onPointerCancel={stopResize}
      >
        Drag Desk
      </div>

      <div className="flex h-full flex-col overflow-hidden">
        <div className="flex h-11 items-center justify-between border-b border-white/10 px-4 pt-2">
          <div>
            <div className="text-[10px] uppercase tracking-[0.26em] text-cyan-300">Olympus Desk</div>
            <div className="text-[9px] uppercase tracking-[0.16em] text-white/40">Full-width OS workspace</div>
          </div>
          <div className="flex items-center gap-2 text-[9px] uppercase tracking-[0.14em] text-white/45">
            <button onClick={() => setDock('left')} className={`border px-2 py-1 ${dock === 'left' ? 'border-cyan-300/60 text-cyan-200' : 'border-white/10 hover:border-cyan-300/40'}`}>Dock Left</button>
            <button onClick={() => setDock('center')} className={`border px-2 py-1 ${dock === 'center' ? 'border-cyan-300/60 text-cyan-200' : 'border-white/10 hover:border-cyan-300/40'}`}>Dock Center</button>
            <button onClick={() => setDock('right')} className={`border px-2 py-1 ${dock === 'right' ? 'border-cyan-300/60 text-cyan-200' : 'border-white/10 hover:border-cyan-300/40'}`}>Dock Right</button>
            <button onClick={() => setOpen((value) => !value)} className="border border-white/10 px-2 py-1 text-cyan-200 hover:border-cyan-300/60">{open ? 'Hide' : 'Show'}</button>
          </div>
        </div>

        {open && (
          <>
            <div className="min-h-0 flex-1 overflow-hidden px-4 py-3">
              <DeskApp view={view} />
            </div>
            <div className={`flex border-t border-cyan-300/15 bg-black/65 px-3 py-2 ${dockClass}`}>
              <div className="flex max-w-full items-end gap-2 overflow-x-auto rounded-2xl border border-cyan-300/20 bg-white/[0.03] px-3 py-2 shadow-[0_0_24px_rgba(34,211,238,0.12)]">
                <div className="mr-2 hidden min-w-[110px] flex-col items-start border-r border-white/10 pr-3 md:flex">
                  <span className="text-[9px] uppercase tracking-[0.22em] text-cyan-300">Olympus Dock</span>
                  <span className="text-[8px] uppercase tracking-[0.16em] text-white/35">Launcher</span>
                </div>
                {launchers.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setView(item.view)}
                    className={`group flex min-w-[58px] flex-col items-center justify-center rounded-xl border px-2 py-1.5 transition-all ${view === item.view ? 'border-cyan-300/60 bg-cyan-400/15 text-cyan-100 shadow-[0_0_18px_rgba(34,211,238,0.25)]' : 'border-white/10 bg-white/[0.03] text-white/55 hover:border-cyan-300/40 hover:bg-cyan-400/10 hover:text-cyan-100'}`}
                    title={item.label}
                  >
                    <span className="text-lg leading-none">{item.icon}</span>
                    <span className="mt-1 text-[8px] uppercase tracking-[0.1em]">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

function DeskApp({ view }: { view: DeskView }) {
  return (
    <div className="grid h-full grid-cols-[250px_1fr] gap-4 text-white/70">
      <div className="rounded border border-white/10 bg-black/35 p-3">
        <div className="text-[10px] uppercase tracking-[0.22em] text-cyan-300">Desk App</div>
        <div className="mt-2 text-2xl font-bold uppercase tracking-[0.14em] text-white">{view}</div>
        <div className="mt-2 text-xs leading-relaxed text-white/45">This opens inside the Olympus Desk.</div>
      </div>
      <div className="min-h-0 overflow-auto rounded border border-cyan-300/15 bg-[#020617]/70 p-4">
        {view === 'monitor' ? <MonitorDeskWorkspace /> : <PlaceholderView view={view} />}
      </div>
    </div>
  );
}

function PlaceholderView({ view }: { view: DeskView }) {
  if (view === 'terminal') return <div className="h-full rounded border border-emerald-400/20 bg-black p-4 font-mono text-sm text-emerald-300 shadow-inner"><div className="text-[10px] uppercase tracking-[0.2em] text-emerald-200/60">Olympus Terminal</div><div className="mt-4">olympus:~$ <span className="animate-pulse">_</span></div></div>;
  if (view === 'files') return <div><h3 className="text-cyan-200 uppercase tracking-[0.18em] text-sm">File Browser</h3><pre className="mt-4 border border-white/10 bg-black/40 p-3 text-xs text-emerald-200">/opt/dennco/olympus-command{`\n`}/etc/dennco/olympus-command{`\n`}/var/lib/dennco</pre></div>;
  if (view === 'architecture') return <div><h3 className="text-cyan-200 uppercase tracking-[0.18em] text-sm">Architecture Viewer</h3><div className="mt-3 text-xs leading-6 text-white/60"><div>Debian → GNOME → Olympus Core GUI → Desk/Dock</div><div>Client modules → Flight / Maritime / Monitor / DOT / CAD / Admin</div><div>Server routes → API providers / local services</div><div>Package layer → systemd service / apt repo / runtime config</div></div></div>;
  return <div><h3 className="text-cyan-200 uppercase tracking-[0.18em] text-sm">{view} workspace</h3><p className="mt-3 text-sm text-white/60">Desk workspace placeholder for {view}. More controls will be added here as the Olympus OS shell grows.</p></div>;
}
