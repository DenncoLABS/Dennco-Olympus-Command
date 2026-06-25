import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Pin, PinOff } from 'lucide-react';
import { MapLayersWidget } from '../../modules/monitor/components/widgets/MapLayersWidget';
import { RocketAlertWidget } from '../../modules/monitor/components/widgets/RocketAlertWidget';
import { GulfWatchCombinedWidget } from '../../modules/monitor/components/widgets/GulfWatchCombinedWidget';
import { monitorDeskWidgetManifest, type MonitorDeskWidgetId } from '../../modules/monitor/widgets/monitorDeskWidgetManifest';
import { OlympusDeskAiSynthesisWidget, OlympusDeskLiveIntelFeedWidget } from './OlympusDeskOsintWidgets';

const ORDER_KEY = 'olympus.desk.monitorWidgetOrder.v1';
const PINNED_KEY = 'olympus.earth.pinnedMonitorWidgets.v1';

function readOrder(): MonitorDeskWidgetId[] {
  const fallback = monitorDeskWidgetManifest.map((widget) => widget.id);
  try {
    const parsed = JSON.parse(localStorage.getItem(ORDER_KEY) || '[]') as MonitorDeskWidgetId[];
    const valid = parsed.filter((id) => fallback.includes(id));
    const missing = fallback.filter((id) => !valid.includes(id));
    return [...valid, ...missing];
  } catch {
    return fallback;
  }
}

function readPinned(): MonitorDeskWidgetId[] {
  try {
    const ids = monitorDeskWidgetManifest.map((widget) => widget.id);
    return (JSON.parse(localStorage.getItem(PINNED_KEY) || '[]') as MonitorDeskWidgetId[]).filter((id) => ids.includes(id));
  } catch {
    return [];
  }
}

function saveOrder(order: MonitorDeskWidgetId[]) {
  localStorage.setItem(ORDER_KEY, JSON.stringify(order));
}

function savePinned(ids: MonitorDeskWidgetId[]) {
  localStorage.setItem(PINNED_KEY, JSON.stringify(ids));
}

export const OlympusDeskMonitorWidgets: React.FC = () => {
  const [order, setOrder] = useState<MonitorDeskWidgetId[]>(() => readOrder());
  const [pinned, setPinned] = useState<MonitorDeskWidgetId[]>(() => readPinned());
  const widgetsById = useMemo(() => new Map(monitorDeskWidgetManifest.map((widget) => [widget.id, widget])), []);

  const move = (id: MonitorDeskWidgetId, direction: -1 | 1) => {
    setOrder((current) => {
      const index = current.indexOf(id);
      const nextIndex = index + direction;
      if (index < 0 || nextIndex < 0 || nextIndex >= current.length) return current;
      const next = [...current];
      [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
      saveOrder(next);
      return next;
    });
  };

  const togglePinned = (id: MonitorDeskWidgetId) => {
    setPinned((current) => {
      const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
      savePinned(next);
      return next;
    });
  };

  return (
    <div className="h-full min-h-0 overflow-auto custom-scrollbar">
      <div className="mb-3 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-cyan-200 uppercase tracking-[0.18em] text-sm">Monitor Widgets</h3>
          <p className="mt-2 text-xs text-white/45">Saved Monitor cards are live Desk widgets. Move them left/right to reorder. Pin marks them for the future Earth workspace overlay layer.</p>
        </div>
        <div className="rounded border border-cyan-300/20 bg-cyan-300/5 px-3 py-2 text-[10px] uppercase tracking-[0.16em] text-cyan-200/70">
          {pinned.length} pinned to Earth staging
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-5 lg:grid-cols-3 md:grid-cols-2">
        {order.map((id) => {
          const widget = widgetsById.get(id);
          if (!widget) return null;
          const isPinned = pinned.includes(id);
          return (
            <section key={id} className="flex min-h-[260px] flex-col overflow-hidden rounded border border-white/10 bg-black/50 shadow-[0_0_20px_rgba(0,0,0,0.35)]">
              <div className="flex items-center justify-between gap-2 border-b border-white/10 bg-white/[0.03] px-2 py-2">
                <div className="min-w-0">
                  <div className="truncate text-[10px] font-bold uppercase tracking-[0.16em] text-cyan-200">{widget.title}</div>
                  <div className="truncate text-[8px] uppercase tracking-[0.12em] text-white/30">Desk widget</div>
                </div>
                <div className="flex shrink-0 items-center gap-1 text-white/45">
                  <button type="button" onClick={() => move(id, -1)} className="rounded border border-white/10 p-1 hover:border-cyan-300/50 hover:text-cyan-200" title="Move left"><ChevronLeft size={12} /></button>
                  <button type="button" onClick={() => move(id, 1)} className="rounded border border-white/10 p-1 hover:border-cyan-300/50 hover:text-cyan-200" title="Move right"><ChevronRight size={12} /></button>
                  <button type="button" onClick={() => togglePinned(id)} className={`rounded border p-1 ${isPinned ? 'border-cyan-300/60 text-cyan-200' : 'border-white/10 hover:border-cyan-300/50 hover:text-cyan-200'}`} title={isPinned ? 'Unpin from Earth staging' : 'Pin to Earth staging'}>{isPinned ? <PinOff size={12} /> : <Pin size={12} />}</button>
                </div>
              </div>
              <div className="min-h-0 flex-1 overflow-auto custom-scrollbar p-3">
                <MonitorWidgetBody id={id} />
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
};

function MonitorWidgetBody({ id }: { id: MonitorDeskWidgetId }) {
  switch (id) {
    case 'map-layers':
      return <MapLayersWidget />;
    case 'rocket-alerts':
      return <RocketAlertWidget />;
    case 'gulf-watch':
      return <GulfWatchCombinedWidget />;
    case 'ai-synthesis':
      return <OlympusDeskAiSynthesisWidget />;
    case 'live-intel-feed':
      return <OlympusDeskLiveIntelFeedWidget />;
    default:
      return null;
  }
}
