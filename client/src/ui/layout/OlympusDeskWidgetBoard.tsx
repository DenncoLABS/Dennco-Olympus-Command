import React, { useEffect, useMemo, useState } from 'react';
import { monitorDeskWidgetManifest, type MonitorDeskWidgetId } from '../../modules/monitor/widgets/monitorDeskWidgetManifest';

const ORDER_KEY = 'olympus.desk.monitorWidgetOrder.v1';
const PINNED_KEY = 'olympus.desk.monitorWidgetPinnedToEarth.v1';

function readOrder(): MonitorDeskWidgetId[] {
  try {
    const raw = localStorage.getItem(ORDER_KEY);
    if (!raw) return monitorDeskWidgetManifest.map((widget) => widget.id);
    const parsed = JSON.parse(raw) as MonitorDeskWidgetId[];
    const known = new Set(monitorDeskWidgetManifest.map((widget) => widget.id));
    const filtered = parsed.filter((id) => known.has(id));
    const missing = monitorDeskWidgetManifest.map((widget) => widget.id).filter((id) => !filtered.includes(id));
    return [...filtered, ...missing];
  } catch {
    return monitorDeskWidgetManifest.map((widget) => widget.id);
  }
}

function readPinned(): MonitorDeskWidgetId[] {
  try {
    const raw = localStorage.getItem(PINNED_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as MonitorDeskWidgetId[];
    const known = new Set(monitorDeskWidgetManifest.map((widget) => widget.id));
    return parsed.filter((id) => known.has(id));
  } catch {
    return [];
  }
}

export const OlympusDeskWidgetBoard: React.FC = () => {
  const [order, setOrder] = useState<MonitorDeskWidgetId[]>(() => readOrder());
  const [pinnedToEarth, setPinnedToEarth] = useState<MonitorDeskWidgetId[]>(() => readPinned());

  useEffect(() => {
    localStorage.setItem(ORDER_KEY, JSON.stringify(order));
  }, [order]);

  useEffect(() => {
    localStorage.setItem(PINNED_KEY, JSON.stringify(pinnedToEarth));
  }, [pinnedToEarth]);

  const widgets = useMemo(() => {
    const byId = new Map(monitorDeskWidgetManifest.map((widget) => [widget.id, widget]));
    return order.map((id) => byId.get(id)).filter(Boolean) as typeof monitorDeskWidgetManifest;
  }, [order]);

  const moveWidget = (id: MonitorDeskWidgetId, direction: -1 | 1) => {
    setOrder((current) => {
      const index = current.indexOf(id);
      const nextIndex = index + direction;
      if (index < 0 || nextIndex < 0 || nextIndex >= current.length) return current;
      const next = [...current];
      [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
      return next;
    });
  };

  const togglePinned = (id: MonitorDeskWidgetId) => {
    setPinnedToEarth((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  };

  return (
    <div className="h-full min-h-0 overflow-auto custom-scrollbar">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-cyan-200 uppercase tracking-[0.18em] text-sm">Saved Monitor Widgets</h3>
          <p className="mt-1 text-xs text-white/45">These are Desk widgets saved from the old Monitor dashboard. Move them, stage them for Earth placement, and customize them later.</p>
        </div>
        <div className="text-[10px] uppercase tracking-[0.14em] text-white/35">
          {pinnedToEarth.length} staged for Earth
        </div>
      </div>

      {pinnedToEarth.length > 0 && (
        <div className="mb-3 border border-cyan-300/20 bg-cyan-300/8 p-3 text-xs text-cyan-100/70">
          Earth staging queue: {pinnedToEarth.map((id) => monitorDeskWidgetManifest.find((widget) => widget.id === id)?.title || id).join(' · ')}
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-2 2xl:grid-cols-3">
        {widgets.map((widget, index) => {
          const pinned = pinnedToEarth.includes(widget.id);
          return (
            <div key={widget.id} className="rounded-sm border border-white/10 bg-black/45 shadow-[0_0_18px_rgba(0,0,0,0.35)] overflow-hidden">
              <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-white/[0.03] px-3 py-2">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.18em] text-cyan-300">Desk Widget</div>
                  <div className="mt-1 text-sm font-bold text-white">{widget.title}</div>
                </div>
                <div className="flex items-center gap-1 text-[9px] uppercase tracking-[0.12em]">
                  <button type="button" disabled={index === 0} onClick={() => moveWidget(widget.id, -1)} className="border border-white/10 px-2 py-1 text-white/45 hover:border-cyan-300/40 hover:text-cyan-200 disabled:opacity-20">◀</button>
                  <button type="button" disabled={index === widgets.length - 1} onClick={() => moveWidget(widget.id, 1)} className="border border-white/10 px-2 py-1 text-white/45 hover:border-cyan-300/40 hover:text-cyan-200 disabled:opacity-20">▶</button>
                </div>
              </div>
              <div className="p-3">
                <p className="text-xs leading-5 text-white/55">{widget.description}</p>
                <div className="mt-3 rounded border border-white/10 bg-[#020617]/65 p-3 text-[11px] text-white/45">
                  {widget.futureUse}
                </div>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <span className="text-[10px] uppercase tracking-[0.14em] text-white/30">Saved from {widget.savedFrom}</span>
                  <button type="button" onClick={() => togglePinned(widget.id)} className={`border px-3 py-1 text-[10px] uppercase tracking-[0.14em] ${pinned ? 'border-emerald-300/50 bg-emerald-300/10 text-emerald-200' : 'border-cyan-300/30 text-cyan-200 hover:bg-cyan-300/10'}`}>
                    {pinned ? 'Staged' : 'Pin to Earth'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
