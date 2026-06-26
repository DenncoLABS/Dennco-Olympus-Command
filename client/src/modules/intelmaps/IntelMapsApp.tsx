import React, { Suspense, lazy, useEffect, useMemo, useRef, useState } from 'react';
import { useThemeStore, type ActiveModule, type MapLayer, type MapProjection, type WeatherRadarState } from '../../ui/theme/theme.store';
import { MapInstanceProvider, type MapAppearance } from './MapInstanceContext';

const FlightsPage = lazy(() => import('../flights/FlightsPage').then((m) => ({ default: m.FlightsPage })));
const MaritimePage = lazy(() => import('../maritime/MaritimePage').then((m) => ({ default: m.MaritimePage })));
const MonitorPage = lazy(() => import('../monitor/MonitorPage').then((m) => ({ default: m.MonitorPage })));
const DotPage = lazy(() => import('../dot/DotPage').then((m) => ({ default: m.DotPage })));
const CyberPage = lazy(() => import('../cyber/CyberPage').then((m) => ({ default: m.CyberPage })));

type IntelMapView = 'flights' | 'maritime' | 'monitor' | 'dot' | 'cyber';
type IntelWindowKind = IntelMapView | 'custom';

type CustomMapTools = { title: string; baseLayer: string; overlay: string; drawingMode: string; symbology: string; notes: string };
type MapInstanceState = { mapLayer: MapLayer; mapProjection: MapProjection; weatherRadar: WeatherRadarState };
type WorkspaceWindow = { id: string; kind: IntelWindowKind; title: string; x: number; y: number; width: number; height: number; z: number; minimized: boolean; tools?: CustomMapTools; savedPath?: string; instance: MapInstanceState };

const STORAGE_KEY = 'olympus.intelMaps.windows.v4';
const CUSTOM_MAP_COUNTER_KEY = 'olympus.intelMaps.customCounter';
const INTEL_MAPS_FOLDER = '/var/lib/dennco/olympus-command/intel-maps';
const DEFAULT_WEATHER_RADAR: WeatherRadarState = { enabled: false, product: 'base-reflectivity', opacity: 0.72, contrast: 0.15, brightnessMin: 0, brightnessMax: 1, customTileUrl: '' };

const mapApps: Array<{ id: IntelMapView; title: string; icon: string; description: string }> = [
  { id: 'flights', title: 'Flight Map', icon: '✈', description: 'Aircraft, emergencies, aviation infrastructure.' },
  { id: 'maritime', title: 'Maritime Map', icon: '⛴', description: 'AIS vessels, incidents, ports, waterway context.' },
  { id: 'monitor', title: 'Monitor Map', icon: '◉', description: 'Global monitor, alerts, Gulf watch, regional intelligence.' },
  { id: 'dot', title: 'DOT Map', icon: '◆', description: 'Traffic, cameras, road events, flow visualization.' },
  { id: 'cyber', title: 'Cyber Map', icon: '⬡', description: 'Cyber operations and internet intelligence surface.' },
];

function defaultInstance(kind: IntelWindowKind): MapInstanceState {
  return { mapLayer: kind === 'dot' ? 'street' : 'dark', mapProjection: kind === 'monitor' || kind === 'cyber' ? 'globe' : 'mercator', weatherRadar: { ...DEFAULT_WEATHER_RADAR } };
}
function clampWindow(win: WorkspaceWindow): WorkspaceWindow {
  const maxX = Math.max(0, window.innerWidth - win.width - 32);
  const maxY = Math.max(0, window.innerHeight - win.height - 140);
  return { ...win, x: Math.max(8, Math.min(win.x, maxX)), y: Math.max(56, Math.min(win.y, maxY)), width: Math.max(420, Math.min(win.width, window.innerWidth - 32)), height: Math.max(260, Math.min(win.height, window.innerHeight - 180)), instance: win.instance || defaultInstance(win.kind) };
}
function normalizeWindow(win: WorkspaceWindow): WorkspaceWindow | null {
  const legacyId = win.id as IntelMapView;
  const kind = win.kind || (mapApps.some((app) => app.id === legacyId) ? legacyId : 'custom');
  if (kind !== 'custom' && !mapApps.some((app) => app.id === kind)) return null;
  return clampWindow({ ...win, kind, id: win.id || `${kind}-${Date.now()}`, instance: win.instance || defaultInstance(kind) });
}
function readWindows(): WorkspaceWindow[] {
  try { const raw = localStorage.getItem(STORAGE_KEY); if (!raw) return []; const parsed = JSON.parse(raw) as WorkspaceWindow[]; if (!Array.isArray(parsed)) return []; return parsed.map(normalizeWindow).filter((win): win is WorkspaceWindow => Boolean(win)); } catch { return []; }
}
function writeWindows(windows: WorkspaceWindow[]) { localStorage.setItem(STORAGE_KEY, JSON.stringify(windows)); }
function mapModuleToView(module: ActiveModule): IntelMapView | null { if (module === 'flights' || module === 'maritime' || module === 'monitor' || module === 'dot' || module === 'cyber') return module; return null; }
function appFor(id: IntelMapView) { return mapApps.find((app) => app.id === id) || mapApps[0]; }
function nextCustomMapId() { const current = Number(localStorage.getItem(CUSTOM_MAP_COUNTER_KEY)); const next = Number.isFinite(current) ? current + 1 : 1; localStorage.setItem(CUSTOM_MAP_COUNTER_KEY, String(next)); return next; }
function defaultCustomMapTools(index: number): CustomMapTools { return { title: `New Intel Map ${index}`, baseLayer: 'Dark tactical base', overlay: 'None', drawingMode: 'Point markers', symbology: 'Cyan operational', notes: '' }; }

export const IntelMapsApp: React.FC = () => {
  const activeModule = useThemeStore((state) => state.activeModule);
  const setActiveModule = useThemeStore((state) => state.setActiveModule);
  const [windows, setWindows] = useState<WorkspaceWindow[]>(() => readWindows());
  const [nextZ, setNextZ] = useState(() => Math.max(2, ...readWindows().map((win) => win.z + 1)));
  const [mapsMenuOpen, setMapsMenuOpen] = useState(false);

  const openWindow = (kind: IntelMapView) => {
    const app = appFor(kind);
    setMapsMenuOpen(false);
    setWindows((current) => {
      const z = nextZ + 1;
      const existingOfKind = current.filter((win) => win.kind === kind).length + 1;
      setNextZ(z + 1);
      const id = `${kind}-${Date.now()}-${existingOfKind}`;
      const next = [...current, clampWindow({ id, kind, title: existingOfKind > 1 ? `${app.title} ${existingOfKind}` : app.title, x: 32 + current.length * 26, y: 82 + current.length * 22, width: kind === 'monitor' ? 900 : 780, height: kind === 'dot' ? 520 : 470, z, minimized: false, instance: defaultInstance(kind) })];
      writeWindows(next);
      return next;
    });
  };

  const openNewMapBuilder = () => {
    const index = nextCustomMapId();
    const id = `custom-${Date.now()}-${index}`;
    const tools = defaultCustomMapTools(index);
    const z = nextZ + 1;
    setNextZ(z + 1);
    setMapsMenuOpen(false);
    setWindows((current) => { const next = [...current, clampWindow({ id, kind: 'custom', title: tools.title, x: 46 + current.length * 24, y: 96 + current.length * 20, width: 820, height: 520, z, minimized: false, tools, instance: defaultInstance('custom') })]; writeWindows(next); return next; });
  };

  useEffect(() => { const view = mapModuleToView(activeModule); if (view) openWindow(view); }, [activeModule]);
  useEffect(() => { const handleResize = () => setWindows((current) => { const next = current.map(clampWindow); writeWindows(next); return next; }); window.addEventListener('resize', handleResize); return () => window.removeEventListener('resize', handleResize); }, []);

  const updateWindow = (id: string, patch: Partial<WorkspaceWindow>) => setWindows((current) => { const next = current.map((win) => (win.id === id ? clampWindow({ ...win, ...patch }) : win)); writeWindows(next); return next; });
  const focusWindow = (id: string) => { const z = nextZ + 1; setNextZ(z + 1); updateWindow(id, { z }); };
  const closeWindow = (id: string) => setWindows((current) => { const next = current.filter((win) => win.id !== id); writeWindows(next); return next; });
  const closeIntelMapsApp = () => { setWindows([]); writeWindows([]); setMapsMenuOpen(false); setActiveModule('core'); };
  const tileAll = () => { const visible = windows.filter((win) => !win.minimized); const cols = Math.ceil(Math.sqrt(visible.length || 1)); const rows = Math.ceil((visible.length || 1) / cols); const areaWidth = window.innerWidth - 48; const areaHeight = window.innerHeight - 220; const cellW = Math.max(420, Math.floor(areaWidth / cols) - 10); const cellH = Math.max(280, Math.floor(areaHeight / rows) - 10); let index = 0; const next = windows.map((win) => { if (win.minimized) return win; const col = index % cols; const row = Math.floor(index / cols); index += 1; return clampWindow({ ...win, x: 16 + col * (cellW + 10), y: 72 + row * (cellH + 10), width: cellW, height: cellH }); }); setWindows(next); writeWindows(next); };

  const saveCustomMap = async (id: string, tools: CustomMapTools) => {
    const payload = { name: tools.title, title: tools.title, tools, layers: [tools.baseLayer, tools.overlay].filter((item) => item !== 'None'), notes: tools.notes };
    let savedPath = `${INTEL_MAPS_FOLDER}/${tools.title.toLowerCase().replace(/[^a-z0-9_-]+/g, '-')}.json`;
    try { const response = await fetch('/api/intel-maps/custom-maps', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }); if (response.ok) { const data = await response.json(); if (typeof data.path === 'string') savedPath = data.path; } else localStorage.setItem(`olympus.intelMaps.saved.${id}`, JSON.stringify(payload)); } catch { localStorage.setItem(`olympus.intelMaps.saved.${id}`, JSON.stringify(payload)); }
    updateWindow(id, { title: tools.title, tools, savedPath });
  };

  const visibleWindows = useMemo(() => windows.filter((win) => !win.minimized), [windows]);
  const minimizedWindows = useMemo(() => windows.filter((win) => win.minimized), [windows]);

  return <div className="absolute inset-0 overflow-hidden bg-[#020617] font-mono text-white"><div className="absolute inset-0 opacity-30 bg-[radial-gradient(rgba(34,211,238,0.12)_1px,transparent_1px)] bg-[size:28px_28px]" /><div className="absolute left-4 top-4 right-4 z-[20] flex items-center justify-between gap-3 rounded border border-cyan-300/20 bg-black/70 px-3 py-2 backdrop-blur"><div><div className="text-[10px] uppercase tracking-[0.28em] text-cyan-300">MULTI-PURPOSE EARTH WORKSPACE</div><div className="text-[9px] uppercase tracking-[0.16em] text-white/40">Intel Maps app workspace · independent map instances with shared overlay feeds</div></div><div className="flex flex-wrap items-center justify-end gap-2"><button onClick={tileAll} className="rounded border border-cyan-300/30 bg-cyan-300/10 px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-cyan-200">Tile</button><div className="relative"><button onClick={() => setMapsMenuOpen((open) => !open)} className="rounded border border-cyan-300/35 bg-cyan-300/10 px-3 py-1 text-[10px] uppercase tracking-[0.14em] text-cyan-100 hover:bg-cyan-300/15">Intel Maps ▾</button>{mapsMenuOpen && <div className="absolute right-0 top-8 z-[40] w-64 overflow-hidden rounded border border-cyan-300/25 bg-black/95 shadow-[0_24px_80px_rgba(0,0,0,0.8)]">{mapApps.map((app) => <button key={app.id} onClick={() => openWindow(app.id)} className="block w-full border-b border-white/5 px-3 py-2 text-left hover:bg-cyan-300/10"><div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.14em] text-cyan-200"><span>{app.icon}</span>{app.title}</div><div className="mt-1 text-[9px] leading-relaxed text-white/40">{app.description}</div></button>)}</div>}</div><button onClick={openNewMapBuilder} className="rounded border border-emerald-300/35 bg-emerald-300/10 px-3 py-1 text-[10px] uppercase tracking-[0.14em] text-emerald-100 hover:bg-emerald-300/15">New Map</button><button onClick={closeIntelMapsApp} className="rounded border border-red-400/40 bg-red-500/10 px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-red-200 hover:bg-red-500/20">× Close App</button></div></div><div className="absolute inset-0 z-[10] pt-16">{visibleWindows.length === 0 && <div className="absolute inset-0 flex items-center justify-center pointer-events-none"><div className="text-center text-white/35 font-mono"><div className="text-[10px] uppercase tracking-[0.28em] text-cyan-300/70">Intel Maps Workspace</div><div className="mt-2 text-sm uppercase tracking-[0.16em]">No map window open</div><div className="mt-2 text-[10px] uppercase tracking-[0.12em] text-white/25">Use the Intel Maps dropdown or New Map to open isolated map widgets.</div></div></div>}{visibleWindows.map((win) => <IntelMapWindow key={win.id} win={win} onFocus={() => focusWindow(win.id)} onUpdate={(patch) => updateWindow(win.id, patch)} onClose={() => closeWindow(win.id)} onSaveCustomMap={saveCustomMap} />)}</div>{minimizedWindows.length > 0 && <div className="absolute bottom-4 left-4 z-[30] flex gap-2">{minimizedWindows.map((win) => <button key={win.id} onClick={() => updateWindow(win.id, { minimized: false, z: nextZ + 1 })} className="border border-white/15 bg-black/70 px-3 py-2 text-[10px] uppercase tracking-[0.16em] text-cyan-200">{win.title}</button>)}</div>}</div>;
};

function IntelMapWindow({ win, onFocus, onUpdate, onClose, onSaveCustomMap }: { win: WorkspaceWindow; onFocus: () => void; onUpdate: (patch: Partial<WorkspaceWindow>) => void; onClose: () => void; onSaveCustomMap: (id: string, tools: CustomMapTools) => void }) {
  const dragRef = useRef<{ pointerId: number; dx: number; dy: number } | null>(null);
  const resizeRef = useRef<{ pointerId: number; startX: number; startY: number; width: number; height: number } | null>(null);
  const patchInstance = (patch: Partial<MapInstanceState>) => onUpdate({ instance: { ...win.instance, ...patch, weatherRadar: patch.weatherRadar || win.instance.weatherRadar } });
  const appearance: MapAppearance = { mapLayer: win.instance.mapLayer, setMapLayer: (mapLayer) => patchInstance({ mapLayer }), mapProjection: win.instance.mapProjection, setMapProjection: (mapProjection) => patchInstance({ mapProjection }), weatherRadar: win.instance.weatherRadar, setWeatherRadarEnabled: (enabled) => patchInstance({ weatherRadar: { ...win.instance.weatherRadar, enabled } }), setWeatherRadarProduct: (product) => patchInstance({ weatherRadar: { ...win.instance.weatherRadar, product } }), setWeatherRadarOpacity: (opacity) => patchInstance({ weatherRadar: { ...win.instance.weatherRadar, opacity } }), setWeatherRadarContrast: (contrast) => patchInstance({ weatherRadar: { ...win.instance.weatherRadar, contrast } }), setWeatherRadarBrightness: (brightnessMin, brightnessMax) => patchInstance({ weatherRadar: { ...win.instance.weatherRadar, brightnessMin, brightnessMax } }), setWeatherRadarCustomTileUrl: (customTileUrl) => patchInstance({ weatherRadar: { ...win.instance.weatherRadar, customTileUrl } }) };
  const startDrag = (event: React.PointerEvent<HTMLDivElement>) => { const target = event.target as HTMLElement; if (target.closest('button, input, textarea, select')) return; onFocus(); dragRef.current = { pointerId: event.pointerId, dx: event.clientX - win.x, dy: event.clientY - win.y }; event.currentTarget.setPointerCapture(event.pointerId); };
  const moveDrag = (event: React.PointerEvent<HTMLDivElement>) => { const drag = dragRef.current; if (!drag || drag.pointerId !== event.pointerId) return; onUpdate({ x: event.clientX - drag.dx, y: event.clientY - drag.dy }); };
  const endDrag = (event: React.PointerEvent<HTMLDivElement>) => { const drag = dragRef.current; if (!drag || drag.pointerId !== event.pointerId) return; dragRef.current = null; try { event.currentTarget.releasePointerCapture(event.pointerId); } catch { /* ignore */ } };
  const startResize = (event: React.PointerEvent<HTMLDivElement>) => { event.stopPropagation(); onFocus(); resizeRef.current = { pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, width: win.width, height: win.height }; event.currentTarget.setPointerCapture(event.pointerId); };
  const moveResize = (event: React.PointerEvent<HTMLDivElement>) => { const resize = resizeRef.current; if (!resize || resize.pointerId !== event.pointerId) return; onUpdate({ width: resize.width + event.clientX - resize.startX, height: resize.height + event.clientY - resize.startY }); };
  const endResize = (event: React.PointerEvent<HTMLDivElement>) => { const resize = resizeRef.current; if (!resize || resize.pointerId !== event.pointerId) return; resizeRef.current = null; try { event.currentTarget.releasePointerCapture(event.pointerId); } catch { /* ignore */ } };
  return <section className="absolute overflow-hidden rounded border border-cyan-300/20 bg-black shadow-[0_24px_60px_rgba(0,0,0,0.86)]" style={{ left: win.x, top: win.y, width: win.width, height: win.height, zIndex: win.z }} onMouseDown={onFocus}><div className="flex h-9 cursor-move items-center justify-between border-b border-cyan-300/15 bg-[#05070b]/95 px-3" onPointerDown={startDrag} onPointerMove={moveDrag} onPointerUp={endDrag} onPointerCancel={endDrag}><div><div className="text-[10px] uppercase tracking-[0.2em] text-cyan-300">{win.title}</div><div className="text-[8px] uppercase tracking-[0.14em] text-white/35">{win.kind === 'custom' ? 'NEW MAP BUILDER' : `ISOLATED ${win.kind.toUpperCase()} MAP INSTANCE`}</div></div><div className="flex items-center gap-1 text-[10px]">{win.kind === 'custom' && <button onClick={() => onSaveCustomMap(win.id, win.tools || defaultCustomMapTools(1))} className="border border-emerald-300/30 px-2 py-0.5 text-emerald-200 hover:bg-emerald-300/10">Save</button>}<button onClick={() => onUpdate({ minimized: true })} className="border border-white/10 px-2 py-0.5 text-white/55 hover:text-cyan-200">_</button><button onClick={onClose} className="border border-white/10 px-2 py-0.5 text-white/55 hover:text-red-200">×</button></div></div><div className="relative h-[calc(100%-36px)] w-full overflow-hidden bg-black"><MapInstanceProvider value={appearance}>{win.kind === 'custom' ? <CustomMapBuilder win={win} onUpdate={onUpdate} onSave={onSaveCustomMap} /> : <Suspense fallback={<WindowLoader />}><WindowContent id={win.kind} /></Suspense>}</MapInstanceProvider></div><div className="absolute bottom-0 right-0 h-5 w-5 cursor-nwse-resize border-l border-t border-cyan-300/25 bg-cyan-300/10" onPointerDown={startResize} onPointerMove={moveResize} onPointerUp={endResize} onPointerCancel={endResize} /></section>;
}

function CustomMapBuilder({ win, onUpdate, onSave }: { win: WorkspaceWindow; onUpdate: (patch: Partial<WorkspaceWindow>) => void; onSave: (id: string, tools: CustomMapTools) => void }) {
  const tools = win.tools || defaultCustomMapTools(1);
  const setTool = (patch: Partial<CustomMapTools>) => onUpdate({ title: patch.title || win.title, tools: { ...tools, ...patch } });
  return <div className="grid h-full grid-cols-[300px_1fr] text-white/70"><aside className="border-r border-cyan-300/15 bg-[#030812] p-3 text-xs"><div className="text-[10px] uppercase tracking-[0.2em] text-emerald-300">Map Building Tools</div><label className="mt-3 block text-[9px] uppercase tracking-[0.14em] text-white/35">Map Name</label><input value={tools.title} onChange={(event) => setTool({ title: event.target.value })} className="mt-1 w-full border border-white/10 bg-black/60 px-2 py-1 text-cyan-100 outline-none focus:border-cyan-300/50" /><label className="mt-3 block text-[9px] uppercase tracking-[0.14em] text-white/35">Base Layer</label><select value={tools.baseLayer} onChange={(event) => setTool({ baseLayer: event.target.value })} className="mt-1 w-full border border-white/10 bg-black/60 px-2 py-1 text-cyan-100"><option>Dark tactical base</option><option>Street operations base</option><option>Satellite planning base</option><option>Maritime chart base</option></select><label className="mt-3 block text-[9px] uppercase tracking-[0.14em] text-white/35">Overlay</label><select value={tools.overlay} onChange={(event) => setTool({ overlay: event.target.value })} className="mt-1 w-full border border-white/10 bg-black/60 px-2 py-1 text-cyan-100"><option>None</option><option>Flight corridors</option><option>Ports and waterways</option><option>DOT traffic layer</option><option>Cyber network layer</option></select><label className="mt-3 block text-[9px] uppercase tracking-[0.14em] text-white/35">Drawing Tool</label><select value={tools.drawingMode} onChange={(event) => setTool({ drawingMode: event.target.value })} className="mt-1 w-full border border-white/10 bg-black/60 px-2 py-1 text-cyan-100"><option>Point markers</option><option>Line routes</option><option>Polygon zones</option><option>Radius rings</option><option>Text labels</option></select><label className="mt-3 block text-[9px] uppercase tracking-[0.14em] text-white/35">Symbology</label><select value={tools.symbology} onChange={(event) => setTool({ symbology: event.target.value })} className="mt-1 w-full border border-white/10 bg-black/60 px-2 py-1 text-cyan-100"><option>Cyan operational</option><option>Amber caution</option><option>Red emergency</option><option>Green logistics</option></select><label className="mt-3 block text-[9px] uppercase tracking-[0.14em] text-white/35">Notes</label><textarea value={tools.notes} onChange={(event) => setTool({ notes: event.target.value })} className="mt-1 h-20 w-full resize-none border border-white/10 bg-black/60 px-2 py-1 text-cyan-100 outline-none focus:border-cyan-300/50" /><button onClick={() => onSave(win.id, tools)} className="mt-3 w-full rounded border border-emerald-300/35 bg-emerald-300/10 px-3 py-2 text-[10px] uppercase tracking-[0.16em] text-emerald-100 hover:bg-emerald-300/15">Save to Intel Maps Folder</button><div className="mt-2 break-all text-[9px] leading-relaxed text-white/35">{win.savedPath || INTEL_MAPS_FOLDER}</div></aside><main className="relative overflow-hidden bg-[#020617]"><div className="absolute inset-0 opacity-30 bg-[linear-gradient(rgba(34,211,238,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,.08)_1px,transparent_1px)] bg-[size:34px_34px]" /><div className="absolute left-6 top-5 rounded border border-cyan-300/20 bg-black/65 px-3 py-2 text-[10px] uppercase tracking-[0.16em] text-cyan-200">{tools.title}</div><div className="absolute bottom-5 left-6 right-6 grid grid-cols-4 gap-2 text-[9px] uppercase tracking-[0.12em] text-white/45"><div className="border border-white/10 bg-black/55 p-2"><div className="text-cyan-300">Base</div>{tools.baseLayer}</div><div className="border border-white/10 bg-black/55 p-2"><div className="text-cyan-300">Overlay</div>{tools.overlay}</div><div className="border border-white/10 bg-black/55 p-2"><div className="text-cyan-300">Tool</div>{tools.drawingMode}</div><div className="border border-white/10 bg-black/55 p-2"><div className="text-cyan-300">Style</div>{tools.symbology}</div></div></main></div>;
}
function WindowContent({ id }: { id: IntelMapView }) { if (id === 'maritime') return <MaritimePage />; if (id === 'monitor') return <MonitorPage />; if (id === 'dot') return <DotPage />; if (id === 'cyber') return <CyberPage />; return <FlightsPage />; }
function WindowLoader() { return <div className="flex h-full items-center justify-center text-[10px] uppercase tracking-[0.2em] text-cyan-300/45">Loading Intel Map…</div>; }
