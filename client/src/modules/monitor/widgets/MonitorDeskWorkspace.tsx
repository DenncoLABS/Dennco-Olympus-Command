import React, { useEffect, useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, Bell, Camera, Grip, Map as MapIcon, Pin, PinOff, Plane, RefreshCcw, Rss, Ship, TrafficCone } from 'lucide-react';
import { getEarthWidgetRegistryEntry } from '../../earth/widgets/earthWidgetRegistry';
import { monitorDeskWidgetManifest, type MonitorDeskWidgetId } from './monitorDeskWidgetManifest';

const ORDER_KEY = 'olympus.desk.monitorWidgets.order.v3';
const LAYOUT_KEY = 'olympus.desk.monitorWidgets.layout.v3';
const EARTH_KEY = 'olympus.desk.monitorWidgets.earthPinned.v3';

type WidgetSize = 'compact' | 'standard' | 'wide' | 'tall';
type WidgetLayout = Record<MonitorDeskWidgetId, { size: WidgetSize; position: number }>;

const sizeLabels: Record<WidgetSize, string> = {
  compact: 'Compact',
  standard: 'Standard',
  wide: 'Wide',
  tall: 'Tall',
};

function defaultOrder(): MonitorDeskWidgetId[] {
  return monitorDeskWidgetManifest.map((widget) => widget.id);
}

function defaultLayout(): WidgetLayout {
  return defaultOrder().reduce((layout, id, index) => {
    layout[id] = { size: index < 3 ? 'standard' : 'compact', position: index };
    return layout;
  }, {} as WidgetLayout);
}

function readOrder(): MonitorDeskWidgetId[] {
  try {
    const raw = JSON.parse(localStorage.getItem(ORDER_KEY) || '[]') as MonitorDeskWidgetId[];
    const validIds = new Set(defaultOrder());
    const filtered = raw.filter((id) => validIds.has(id));
    const missing = defaultOrder().filter((id) => !filtered.includes(id));
    return [...filtered, ...missing];
  } catch {
    return defaultOrder();
  }
}

function readLayout(order: MonitorDeskWidgetId[]): WidgetLayout {
  const fallback = defaultLayout();
  try {
    const raw = JSON.parse(localStorage.getItem(LAYOUT_KEY) || '{}') as Partial<WidgetLayout>;
    return order.reduce((layout, id, index) => {
      const saved = raw[id];
      layout[id] = {
        size: saved?.size && sizeLabels[saved.size] ? saved.size : fallback[id].size,
        position: Number.isFinite(saved?.position) ? Number(saved?.position) : index,
      };
      return layout;
    }, {} as WidgetLayout);
  } catch {
    return fallback;
  }
}

function readEarthPinned(): MonitorDeskWidgetId[] {
  try {
    const raw = JSON.parse(localStorage.getItem(EARTH_KEY) || '[]') as MonitorDeskWidgetId[];
    const validIds = new Set(defaultOrder());
    return raw.filter((id) => validIds.has(id));
  } catch {
    return [];
  }
}

function moveItem(order: MonitorDeskWidgetId[], id: MonitorDeskWidgetId, direction: -1 | 1) {
  const index = order.indexOf(id);
  const nextIndex = index + direction;
  if (index < 0 || nextIndex < 0 || nextIndex >= order.length) return order;
  const next = [...order];
  const [item] = next.splice(index, 1);
  next.splice(nextIndex, 0, item);
  return next;
}

function nextSize(size: WidgetSize): WidgetSize {
  if (size === 'compact') return 'standard';
  if (size === 'standard') return 'wide';
  if (size === 'wide') return 'tall';
  return 'compact';
}

function cardStyle(size: WidgetSize): React.CSSProperties {
  return {
    gridColumn: size === 'wide' ? 'span 2' : 'span 1',
    minHeight: size === 'compact' ? 220 : size === 'tall' ? 420 : 300,
  };
}

function widgetIcon(id: MonitorDeskWidgetId) {
  switch (id) {
    case 'global-notifications':
      return <Bell size={18} />;
    case 'aircraft-database':
    case 'flight-notifications':
      return <Plane size={18} />;
    case 'maritime-notifications':
      return <Ship size={18} />;
    case 'dot-traffic-notifications':
      return <TrafficCone size={18} />;
    case 'dot-cctv':
      return <Camera size={18} />;
    case 'live-intel-feed':
      return <Rss size={18} />;
    default:
      return <MapIcon size={18} />;
  }
}

export const MonitorDeskWorkspace: React.FC = () => {
  const initialOrder = useMemo(() => readOrder(), []);
  const [order, setOrder] = useState<MonitorDeskWidgetId[]>(initialOrder);
  const [layout, setLayout] = useState<WidgetLayout>(() => readLayout(initialOrder));
  const [earthPinned, setEarthPinned] = useState<MonitorDeskWidgetId[]>(() => readEarthPinned());
  const [draggingId, setDraggingId] = useState<MonitorDeskWidgetId | null>(null);
  const manifestById = useMemo(() => new globalThis.Map(monitorDeskWidgetManifest.map((widget) => [widget.id, widget])), []);

  useEffect(() => {
    localStorage.setItem(ORDER_KEY, JSON.stringify(order));
    setLayout((current) => order.reduce((next, id, index) => {
      next[id] = { ...(current[id] || { size: 'standard' as WidgetSize, position: index }), position: index };
      return next;
    }, {} as WidgetLayout));
  }, [order]);

  useEffect(() => { localStorage.setItem(LAYOUT_KEY, JSON.stringify(layout)); }, [layout]);
  useEffect(() => { localStorage.setItem(EARTH_KEY, JSON.stringify(earthPinned)); }, [earthPinned]);

  const toggleEarthPin = (id: MonitorDeskWidgetId) => {
    setEarthPinned((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  };

  const resetLayout = () => {
    const nextOrder = defaultOrder();
    setOrder(nextOrder);
    setLayout(defaultLayout());
    setEarthPinned([]);
  };

  return (
    <div className="h-full min-h-0 flex flex-col">
      <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-3">
        <div>
          <h3 className="text-cyan-200 uppercase tracking-[0.18em] text-sm">Monitor Widget Workspace</h3>
          <p className="mt-1 text-xs text-white/45">Crash-proof Desk staging surface for Monitor widgets. Live widget bodies will be reconnected after this shell is verified stable.</p>
        </div>
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.14em] text-white/35">
          <span>{earthPinned.length} pinned to Earth staging</span>
          <button type="button" onClick={resetLayout} className="flex items-center gap-1 border border-white/10 px-2 py-1 text-white/45 hover:border-cyan-300/50 hover:text-cyan-200"><RefreshCcw size={11} /> Reset</button>
        </div>
      </div>

      {earthPinned.length > 0 && (
        <div className="mt-3 rounded border border-cyan-300/20 bg-cyan-300/5 p-3 text-[10px] uppercase tracking-[0.12em] text-cyan-100/70">
          <div className="mb-2 flex items-center gap-2 text-cyan-200"><MapIcon size={13} /> Earth widget registry staging</div>
          <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
            {earthPinned.map((id) => {
              const entry = getEarthWidgetRegistryEntry(id);
              return <div key={id} className="border border-white/10 bg-black/35 p-2"><span className="text-white/80">{entry?.title || id}</span><div className="mt-1 normal-case tracking-normal text-white/40">{entry?.placeholderAction || 'Earth overlay placement will be wired in a later phase.'}</div></div>;
            })}
          </div>
        </div>
      )}

      <div className="mt-3 grid min-h-0 flex-1 grid-cols-1 gap-3 overflow-y-auto pr-1 xl:grid-cols-2 2xl:grid-cols-3">
        {order.map((id, index) => {
          const definition = manifestById.get(id);
          if (!definition) return null;
          const pinned = earthPinned.includes(id);
          const saved = layout[id] || { size: 'standard' as WidgetSize, position: index };
          const registryEntry = getEarthWidgetRegistryEntry(id);
          return (
            <section
              key={id}
              draggable
              onDragStart={() => setDraggingId(id)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => {
                if (!draggingId || draggingId === id) return;
                setOrder((current) => {
                  const next = current.filter((item) => item !== draggingId);
                  const targetIndex = next.indexOf(id);
                  next.splice(targetIndex, 0, draggingId);
                  return next;
                });
                setDraggingId(null);
              }}
              onDragEnd={() => setDraggingId(null)}
              className={`flex flex-col rounded border bg-black/45 transition-all ${pinned ? 'border-cyan-300/50 shadow-[0_0_18px_rgba(34,211,238,0.14)]' : 'border-white/10 hover:border-cyan-300/35'} ${draggingId === id ? 'opacity-45' : ''}`}
              style={cardStyle(saved.size)}
            >
              <div className="flex items-center justify-between gap-2 border-b border-white/10 px-3 py-2">
                <div>
                  <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-cyan-300"><Grip size={12} className="text-white/30" />{definition.title}</div>
                  <div className="mt-0.5 text-[8px] uppercase tracking-[0.12em] text-white/30">Position {index + 1} saved · {sizeLabels[saved.size]} · drag card to reorder</div>
                </div>
                <div className="flex items-center gap-1">
                  <button type="button" onClick={() => setOrder((current) => moveItem(current, id, -1))} disabled={index === 0} className="border border-white/10 p-1 text-white/45 hover:border-cyan-300/50 hover:text-cyan-200 disabled:opacity-25"><ArrowUp size={12} /></button>
                  <button type="button" onClick={() => setOrder((current) => moveItem(current, id, 1))} disabled={index === order.length - 1} className="border border-white/10 p-1 text-white/45 hover:border-cyan-300/50 hover:text-cyan-200 disabled:opacity-25"><ArrowDown size={12} /></button>
                  <button type="button" onClick={() => setLayout((current) => ({ ...current, [id]: { ...(current[id] || { position: index, size: 'standard' }), size: nextSize(current[id]?.size || 'standard') } }))} className="border border-white/10 px-1.5 py-1 text-[9px] uppercase tracking-[0.1em] text-white/45 hover:border-cyan-300/50 hover:text-cyan-200">Size</button>
                  <button type="button" onClick={() => toggleEarthPin(id)} className={`border p-1 ${pinned ? 'border-cyan-300/60 text-cyan-200' : 'border-white/10 text-white/45 hover:border-cyan-300/50 hover:text-cyan-200'}`} title={pinned ? 'Dock back to Desk staging' : 'Pin to Earth staging'}>{pinned ? <PinOff size={12} /> : <Pin size={12} />}</button>
                </div>
              </div>
              <div className="min-h-0 flex-1 overflow-auto p-3 custom-scrollbar">
                <div className="flex h-full min-h-[150px] flex-col justify-between rounded border border-white/10 bg-white/[0.03] p-3">
                  <div>
                    <div className="flex items-center gap-2 text-cyan-200">{widgetIcon(id)}<span className="text-[10px] uppercase tracking-[0.18em]">{definition.title}</span></div>
                    <p className="mt-3 text-xs leading-relaxed text-white/55">{definition.description}</p>
                    <div className="mt-4 rounded border border-cyan-300/15 bg-cyan-300/5 p-2 text-[10px] leading-relaxed text-cyan-100/65">{registryEntry?.plannedOverlayRole || definition.futureUse}</div>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-2 text-[9px] uppercase tracking-[0.12em] text-white/35">
                    <span className="border border-white/10 px-2 py-1">Source: {definition.savedFrom}</span>
                    <span className="border border-white/10 px-2 py-1">Stage: {registryEntry?.stage || 'desk-only'}</span>
                  </div>
                </div>
              </div>
              <div className="border-t border-white/10 px-3 py-2 text-[9px] uppercase tracking-[0.12em] text-white/35">
                {pinned ? registryEntry?.placeholderAction || 'Earth staging saved · live map placement next phase' : definition.futureUse}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
};
