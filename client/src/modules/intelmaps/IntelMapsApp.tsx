import React, { Suspense, lazy, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useThemeStore, type ActiveModule } from '../../ui/theme/theme.store';

const FlightsPage = lazy(() => import('../flights/FlightsPage').then((m) => ({ default: m.FlightsPage })));
const MaritimePage = lazy(() => import('../maritime/MaritimePage').then((m) => ({ default: m.MaritimePage })));
const MonitorPage = lazy(() => import('../monitor/MonitorPage').then((m) => ({ default: m.MonitorPage })));
const DotPage = lazy(() => import('../dot/DotPage').then((m) => ({ default: m.DotPage })));
const CyberPage = lazy(() => import('../cyber/CyberPage').then((m) => ({ default: m.CyberPage })));

type IntelMapView = 'flights' | 'maritime' | 'monitor' | 'dot' | 'cyber';

type WorkspaceWindow = {
  id: IntelMapView;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  z: number;
  minimized: boolean;
};

const STORAGE_KEY = 'olympus.intelMaps.windows.v1';

const mapApps: Array<{ id: IntelMapView; title: string; icon: string; description: string }> = [
  { id: 'flights', title: 'Flight Map', icon: '✈', description: 'Aircraft, emergencies, aviation infrastructure.' },
  { id: 'maritime', title: 'Maritime Map', icon: '⛴', description: 'AIS vessels, incidents, ports, waterway context.' },
  { id: 'monitor', title: 'Monitor Map', icon: '◉', description: 'Global monitor, alerts, Gulf watch, regional intelligence.' },
  { id: 'dot', title: 'DOT Map', icon: '◆', description: 'Traffic, cameras, road events, flow visualization.' },
  { id: 'cyber', title: 'Cyber Map', icon: '⬡', description: 'Cyber operations and internet intelligence surface.' },
];

const defaultWindows: WorkspaceWindow[] = [];

function clampWindow(win: WorkspaceWindow): WorkspaceWindow {
  const maxX = Math.max(0, window.innerWidth - win.width - 32);
  const maxY = Math.max(0, window.innerHeight - win.height - 140);
  return {
    ...win,
    x: Math.max(8, Math.min(win.x, maxX)),
    y: Math.max(56, Math.min(win.y, maxY)),
    width: Math.max(420, Math.min(win.width, window.innerWidth - 32)),
    height: Math.max(260, Math.min(win.height, window.innerHeight - 180)),
  };
}

function readWindows(): WorkspaceWindow[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultWindows;
    const parsed = JSON.parse(raw) as WorkspaceWindow[];
    if (!Array.isArray(parsed)) return defaultWindows;
    return parsed.filter((win) => mapApps.some((app) => app.id === win.id)).map(clampWindow);
  } catch {
    return defaultWindows;
  }
}

function writeWindows(windows: WorkspaceWindow[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(windows));
}

function mapModuleToView(module: ActiveModule): IntelMapView | null {
  if (module === 'flights' || module === 'maritime' || module === 'monitor' || module === 'dot' || module === 'cyber') return module;
  return null;
}

function appFor(id: IntelMapView) {
  return mapApps.find((app) => app.id === id) || mapApps[0];
}

export const IntelMapsApp: React.FC = () => {
  const activeModule = useThemeStore((state) => state.activeModule);
  const setActiveModule = useThemeStore((state) => state.setActiveModule);
  const [windows, setWindows] = useState<WorkspaceWindow[]>(() => readWindows());
  const [nextZ, setNextZ] = useState(() => Math.max(2, ...readWindows().map((win) => win.z + 1)));

  const openWindow = (id: IntelMapView) => {
    const app = appFor(id);
    setWindows((current) => {
      const existing = current.find((win) => win.id === id);
      const z = nextZ + 1;
      setNextZ(z + 1);
      const updated = existing
        ? current.map((win) => (win.id === id ? { ...win, minimized: false, z } : win))
        : [
            ...current,
            clampWindow({
              id,
              title: app.title,
              x: 32 + current.length * 26,
              y: 82 + current.length * 22,
              width: id === 'monitor' ? 900 : 780,
              height: id === 'dot' ? 520 : 470,
              z,
              minimized: false,
            }),
          ];
      writeWindows(updated);
      return updated;
    });
  };

  useEffect(() => {
    const view = mapModuleToView(activeModule);
    if (view) openWindow(view);
    if (activeModule === 'core') {
      setWindows([]);
      writeWindows([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeModule]);

  useEffect(() => {
    const handleResize = () => setWindows((current) => {
      const next = current.map(clampWindow);
      writeWindows(next);
      return next;
    });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const updateWindow = (id: IntelMapView, patch: Partial<WorkspaceWindow>) => {
    setWindows((current) => {
      const next = current.map((win) => (win.id === id ? clampWindow({ ...win, ...patch }) : win));
      writeWindows(next);
      return next;
    });
  };

  const focusWindow = (id: IntelMapView) => {
    const z = nextZ + 1;
    setNextZ(z + 1);
    updateWindow(id, { z });
  };

  const closeWindow = (id: IntelMapView) => {
    setWindows((current) => {
      const next = current.filter((win) => win.id !== id);
      writeWindows(next);
      return next;
    });
  };

  const closeIntelMapsApp = () => {
    setWindows([]);
    writeWindows([]);
    setActiveModule('core');
  };

  const tileAll = () => {
    const visible = windows.filter((win) => !win.minimized);
    const cols = Math.ceil(Math.sqrt(visible.length || 1));
    const rows = Math.ceil((visible.length || 1) / cols);
    const areaWidth = window.innerWidth - 48;
    const areaHeight = window.innerHeight - 220;
    const cellW = Math.max(420, Math.floor(areaWidth / cols) - 10);
    const cellH = Math.max(280, Math.floor(areaHeight / rows) - 10);
    let index = 0;
    const next = windows.map((win) => {
      if (win.minimized) return win;
      const col = index % cols;
      const row = Math.floor(index / cols);
      index += 1;
      return clampWindow({ ...win, x: 16 + col * (cellW + 10), y: 72 + row * (cellH + 10), width: cellW, height: cellH });
    });
    setWindows(next);
    writeWindows(next);
  };

  const visibleWindows = useMemo(() => windows.filter((win) => !win.minimized), [windows]);
  const minimizedWindows = useMemo(() => windows.filter((win) => win.minimized), [windows]);

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#020617] font-mono text-white">
      <div className="absolute inset-0 opacity-30 bg-[radial-gradient(rgba(34,211,238,0.12)_1px,transparent_1px)] bg-[size:28px_28px]" />
      <div className="absolute left-4 top-4 right-4 z-[20] flex items-center justify-between gap-3 rounded border border-cyan-300/20 bg-black/70 px-3 py-2 backdrop-blur">
        <div>
          <div className="text-[10px] uppercase tracking-[0.28em] text-cyan-300">INTEL MAPS</div>
          <div className="text-[9px] uppercase tracking-[0.16em] text-white/40">Multi-purpose Earth workspace · map windows operate as widgets</div>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          {mapApps.map((app) => (
            <button key={app.id} onClick={() => openWindow(app.id)} className="rounded border border-white/10 bg-white/[0.03] px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-white/55 hover:border-cyan-300/50 hover:text-cyan-200">
              <span className="mr-1 text-cyan-300">{app.icon}</span>{app.title.replace(' Map', '')}
            </button>
          ))}
          <button onClick={tileAll} className="rounded border border-cyan-300/30 bg-cyan-300/10 px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-cyan-200">Tile</button>
          <button onClick={closeIntelMapsApp} className="rounded border border-red-400/40 bg-red-500/10 px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-red-200 hover:bg-red-500/20">× Close App</button>
        </div>
      </div>

      <div className="absolute inset-0 z-[10] pt-16">
        {visibleWindows.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center text-white/35 font-mono">
              <div className="text-[10px] uppercase tracking-[0.28em] text-cyan-300/70">Earth Workspace</div>
              <div className="mt-2 text-sm uppercase tracking-[0.16em]">No map app open</div>
              <div className="mt-2 text-[10px] uppercase tracking-[0.12em] text-white/25">Use the Desk or Intel Maps bar to open a map widget.</div>
            </div>
          </div>
        )}
        {visibleWindows.map((win) => (
          <IntelMapWindow
            key={win.id}
            win={win}
            onFocus={() => focusWindow(win.id)}
            onUpdate={(patch) => updateWindow(win.id, patch)}
            onClose={() => closeWindow(win.id)}
          />
        ))}
      </div>

      {minimizedWindows.length > 0 && (
        <div className="absolute bottom-4 left-4 z-[30] flex gap-2">
          {minimizedWindows.map((win) => (
            <button key={win.id} onClick={() => updateWindow(win.id, { minimized: false, z: nextZ + 1 })} className="border border-white/15 bg-black/70 px-3 py-2 text-[10px] uppercase tracking-[0.16em] text-cyan-200">
              {win.title}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

function IntelMapWindow({ win, onFocus, onUpdate, onClose }: { win: WorkspaceWindow; onFocus: () => void; onUpdate: (patch: Partial<WorkspaceWindow>) => void; onClose: () => void }) {
  const dragRef = useRef<{ pointerId: number; dx: number; dy: number } | null>(null);
  const resizeRef = useRef<{ pointerId: number; startX: number; startY: number; width: number; height: number } | null>(null);

  const startDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    if (target.closest('button')) return;
    onFocus();
    dragRef.current = { pointerId: event.pointerId, dx: event.clientX - win.x, dy: event.clientY - win.y };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const moveDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    onUpdate({ x: event.clientX - drag.dx, y: event.clientY - drag.dy });
  };

  const endDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    dragRef.current = null;
    try { event.currentTarget.releasePointerCapture(event.pointerId); } catch { /* ignore */ }
  };

  const startResize = (event: React.PointerEvent<HTMLDivElement>) => {
    event.stopPropagation();
    onFocus();
    resizeRef.current = { pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, width: win.width, height: win.height };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const moveResize = (event: React.PointerEvent<HTMLDivElement>) => {
    const resize = resizeRef.current;
    if (!resize || resize.pointerId !== event.pointerId) return;
    onUpdate({ width: resize.width + event.clientX - resize.startX, height: resize.height + event.clientY - resize.startY });
  };

  const endResize = (event: React.PointerEvent<HTMLDivElement>) => {
    const resize = resizeRef.current;
    if (!resize || resize.pointerId !== event.pointerId) return;
    resizeRef.current = null;
    try { event.currentTarget.releasePointerCapture(event.pointerId); } catch { /* ignore */ }
  };

  return (
    <section
      className="absolute overflow-hidden rounded border border-cyan-300/20 bg-black shadow-[0_24px_60px_rgba(0,0,0,0.86)]"
      style={{ left: win.x, top: win.y, width: win.width, height: win.height, zIndex: win.z }}
      onMouseDown={onFocus}
    >
      <div className="flex h-9 cursor-move items-center justify-between border-b border-cyan-300/15 bg-[#05070b]/95 px-3" onPointerDown={startDrag} onPointerMove={moveDrag} onPointerUp={endDrag} onPointerCancel={endDrag}>
        <div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-cyan-300">{win.title}</div>
          <div className="text-[8px] uppercase tracking-[0.14em] text-white/35">INTEL MAPS WINDOW</div>
        </div>
        <div className="flex items-center gap-1 text-[10px]">
          <button onClick={() => onUpdate({ minimized: true })} className="border border-white/10 px-2 py-0.5 text-white/55 hover:text-cyan-200">_</button>
          <button onClick={onClose} className="border border-white/10 px-2 py-0.5 text-white/55 hover:text-red-200">×</button>
        </div>
      </div>
      <div className="relative h-[calc(100%-36px)] w-full overflow-hidden bg-black">
        <Suspense fallback={<WindowLoader />}>
          <WindowContent id={win.id} />
        </Suspense>
      </div>
      <div className="absolute bottom-0 right-0 h-5 w-5 cursor-nwse-resize border-l border-t border-cyan-300/25 bg-cyan-300/10" onPointerDown={startResize} onPointerMove={moveResize} onPointerUp={endResize} onPointerCancel={endResize} />
    </section>
  );
}

function WindowContent({ id }: { id: IntelMapView }) {
  if (id === 'maritime') return <MaritimePage />;
  if (id === 'monitor') return <MonitorPage />;
  if (id === 'dot') return <DotPage />;
  if (id === 'cyber') return <CyberPage />;
  return <FlightsPage />;
}

function WindowLoader() {
  return <div className="flex h-full items-center justify-center text-[10px] uppercase tracking-[0.2em] text-cyan-300/45">Loading Intel Map…</div>;
}
