import React, { useEffect, useMemo, useState } from 'react';

export interface DeskWidgetDefinition {
  id: string;
  title: string;
  description: string;
  futureUse?: string;
}

interface DeskWidgetBoardProps {
  storagePrefix: string;
  widgets: DeskWidgetDefinition[];
}

function readList(key: string, fallback: string[]) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === 'string') : fallback;
  } catch {
    return fallback;
  }
}

function normalizeOrder(saved: string[], available: string[]) {
  const seen = new Set<string>();
  const result = saved.filter((id) => available.includes(id) && !seen.has(id) && seen.add(id));
  available.forEach((id) => {
    if (!seen.has(id)) result.push(id);
  });
  return result;
}

export const DeskWidgetBoard: React.FC<DeskWidgetBoardProps> = ({ storagePrefix, widgets }) => {
  const orderKey = `${storagePrefix}.order`;
  const stagedKey = `${storagePrefix}.stagedForMap`;
  const availableIds = useMemo(() => widgets.map((widget) => widget.id), [widgets]);
  const widgetById = useMemo(() => new Map(widgets.map((widget) => [widget.id, widget])), [widgets]);
  const [order, setOrder] = useState(() => normalizeOrder(readList(orderKey, availableIds), availableIds));
  const [staged, setStaged] = useState(() => new Set(readList(stagedKey, [])));

  useEffect(() => {
    setOrder((current) => normalizeOrder(current, availableIds));
  }, [availableIds]);

  useEffect(() => {
    localStorage.setItem(orderKey, JSON.stringify(order));
  }, [order, orderKey]);

  useEffect(() => {
    localStorage.setItem(stagedKey, JSON.stringify(Array.from(staged)));
  }, [staged, stagedKey]);

  const move = (id: string, direction: -1 | 1) => {
    setOrder((current) => {
      const next = [...current];
      const index = next.indexOf(id);
      const swap = index + direction;
      if (index < 0 || swap < 0 || swap >= next.length) return current;
      [next[index], next[swap]] = [next[swap], next[index]];
      return next;
    });
  };

  const toggleStage = (id: string) => {
    setStaged((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const reset = () => {
    setOrder(availableIds);
    setStaged(new Set());
  };

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex items-center justify-between border-b border-cyan-300/15 pb-3">
        <div>
          <div className="text-[10px] uppercase tracking-[0.22em] text-cyan-300">Desk Widget Board</div>
          <div className="mt-1 text-xs text-white/45">Move widgets, save their order, and stage them for the map workspace later.</div>
        </div>
        <button onClick={reset} className="border border-white/10 px-3 py-1 text-[9px] uppercase tracking-[0.16em] text-white/45 hover:border-cyan-300/50 hover:text-cyan-200">Reset</button>
      </div>

      <div className="min-h-0 flex-1 overflow-auto pr-1">
        <div className="grid grid-cols-1 gap-3 xl:grid-cols-2 2xl:grid-cols-3">
          {order.map((id) => {
            const widget = widgetById.get(id);
            if (!widget) return null;
            const isStaged = staged.has(id);
            return (
              <div key={id} className={`rounded border bg-black/45 p-3 transition-all ${isStaged ? 'border-emerald-400/45 shadow-[0_0_18px_rgba(52,211,153,0.12)]' : 'border-white/10 hover:border-cyan-300/45'}`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-[9px] uppercase tracking-[0.2em] text-white/35">{widget.id}</div>
                    <div className="mt-1 text-sm font-bold uppercase tracking-[0.12em] text-white">{widget.title}</div>
                  </div>
                  <div className="text-cyan-300/50">☷</div>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-white/55">{widget.description}</p>
                {widget.futureUse && <p className="mt-2 border-l border-cyan-300/20 pl-2 text-[10px] leading-relaxed text-cyan-100/45">{widget.futureUse}</p>}
                <div className="mt-3 flex flex-wrap gap-2 text-[9px] uppercase tracking-[0.14em]">
                  <button onClick={() => move(id, -1)} className="border border-white/10 px-2 py-1 text-white/45 hover:border-cyan-300/40 hover:text-cyan-200">Move Left</button>
                  <button onClick={() => move(id, 1)} className="border border-white/10 px-2 py-1 text-white/45 hover:border-cyan-300/40 hover:text-cyan-200">Move Right</button>
                  <button onClick={() => toggleStage(id)} className={`border px-2 py-1 ${isStaged ? 'border-emerald-400/50 text-emerald-200' : 'border-white/10 text-white/45 hover:border-emerald-400/40 hover:text-emerald-200'}`}>{isStaged ? 'Staged' : 'Stage for Map'}</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
