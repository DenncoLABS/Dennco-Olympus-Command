import React, { useMemo, useState } from 'react';
import { BrainCircuit, Pin, PinOff, Rss, Sparkles } from 'lucide-react';
import { MapLayersWidget } from '../components/widgets/MapLayersWidget';
import { RocketAlertWidget } from '../components/widgets/RocketAlertWidget';
import { GulfWatchCombinedWidget } from '../components/widgets/GulfWatchCombinedWidget';
import { useOsintStore } from '../../osint/osint.store';
import { useOsintNews } from '../../osint/hooks/useOsintNews';
import { useIntelBrief } from '../../osint/hooks/useIntelBrief';
import { monitorDeskWidgetManifest, type MonitorDeskWidgetId } from './monitorDeskWidgetManifest';

const ORDER_KEY = 'olympus.monitorDeskWidgets.order.v1';
const PINNED_KEY = 'olympus.monitorDeskWidgets.pinnedEarth.v1';

const CATEGORIES = ['All', 'Politics & Society', 'Business & Economy', 'Science & Technology', 'Local News'] as const;
const DATE_FORMATTER = new Intl.DateTimeFormat(undefined, { dateStyle: 'short' });
const TIME_FORMATTER = new Intl.DateTimeFormat(undefined, { timeStyle: 'short' });

const INTERCEPT_COLORS = [
  { border: 'border-l-blue-500', bg: 'bg-blue-500/8', tag: 'text-blue-400', dot: 'bg-blue-500' },
  { border: 'border-l-amber-500', bg: 'bg-amber-500/8', tag: 'text-amber-400', dot: 'bg-amber-500' },
  { border: 'border-l-teal-500', bg: 'bg-teal-500/8', tag: 'text-teal-400', dot: 'bg-teal-500' },
  { border: 'border-l-purple-500', bg: 'bg-purple-500/8', tag: 'text-purple-400', dot: 'bg-purple-500' },
  { border: 'border-l-rose-500', bg: 'bg-rose-500/8', tag: 'text-rose-400', dot: 'bg-rose-500' },
];

function safeFmt(dateStr: string, fmt: Intl.DateTimeFormat): string {
  try {
    const d = new Date(dateStr);
    return Number.isNaN(d.getTime()) ? '' : fmt.format(d);
  } catch {
    return '';
  }
}

function shortSource(src: string): string {
  return src
    .replace(/\s*[-|–]\s*.+$/, '')
    .replace(/^The\s+/i, '')
    .trim()
    .toUpperCase()
    .slice(0, 22);
}

function readOrder(): MonitorDeskWidgetId[] {
  try {
    const raw = localStorage.getItem(ORDER_KEY);
    if (!raw) return monitorDeskWidgetManifest.map((widget) => widget.id);
    const parsed = JSON.parse(raw) as MonitorDeskWidgetId[];
    const valid = parsed.filter((id) => monitorDeskWidgetManifest.some((widget) => widget.id === id));
    const missing = monitorDeskWidgetManifest.map((widget) => widget.id).filter((id) => !valid.includes(id));
    return [...valid, ...missing];
  } catch {
    return monitorDeskWidgetManifest.map((widget) => widget.id);
  }
}

function readPinned(): MonitorDeskWidgetId[] {
  try {
    const raw = localStorage.getItem(PINNED_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as MonitorDeskWidgetId[];
    return parsed.filter((id) => monitorDeskWidgetManifest.some((widget) => widget.id === id));
  } catch {
    return [];
  }
}

function persistOrder(order: MonitorDeskWidgetId[]) {
  localStorage.setItem(ORDER_KEY, JSON.stringify(order));
}

function persistPinned(pinned: MonitorDeskWidgetId[]) {
  localStorage.setItem(PINNED_KEY, JSON.stringify(pinned));
}

export const MonitorDeskWidgets: React.FC = () => {
  const [order, setOrder] = useState<MonitorDeskWidgetId[]>(() => readOrder());
  const [draggingId, setDraggingId] = useState<MonitorDeskWidgetId | null>(null);
  const [pinned, setPinned] = useState<MonitorDeskWidgetId[]>(() => readPinned());

  const widgets = useMemo(
    () => order.map((id) => monitorDeskWidgetManifest.find((widget) => widget.id === id)).filter(Boolean) as typeof monitorDeskWidgetManifest,
    [order],
  );

  const moveWidget = (id: MonitorDeskWidgetId, direction: -1 | 1) => {
    setOrder((current) => {
      const index = current.indexOf(id);
      const nextIndex = index + direction;
      if (index < 0 || nextIndex < 0 || nextIndex >= current.length) return current;
      const next = [...current];
      const [item] = next.splice(index, 1);
      next.splice(nextIndex, 0, item);
      persistOrder(next);
      return next;
    });
  };

  const reorderByDrop = (targetId: MonitorDeskWidgetId) => {
    if (!draggingId || draggingId === targetId) return;
    setOrder((current) => {
      const sourceIndex = current.indexOf(draggingId);
      const targetIndex = current.indexOf(targetId);
      if (sourceIndex < 0 || targetIndex < 0) return current;
      const next = [...current];
      const [item] = next.splice(sourceIndex, 1);
      next.splice(targetIndex, 0, item);
      persistOrder(next);
      return next;
    });
    setDraggingId(null);
  };

  const togglePinned = (id: MonitorDeskWidgetId) => {
    setPinned((current) => {
      const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
      persistPinned(next);
      return next;
    });
  };

  const reset = () => {
    const next = monitorDeskWidgetManifest.map((widget) => widget.id);
    setOrder(next);
    setPinned([]);
    persistOrder(next);
    persistPinned([]);
  };

  return (
    <div className="h-full min-h-0 overflow-auto custom-scrollbar">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-cyan-200 uppercase tracking-[0.18em] text-sm">Monitor Desk Widgets</h3>
          <p className="mt-2 text-sm text-white/55">These are the Monitor widgets saved from the old bottom dashboard. Reorder them here now; pinned widgets are staged for the future Earth workspace layer.</p>
        </div>
        <button type="button" onClick={reset} className="shrink-0 border border-white/10 px-2 py-1 text-[9px] uppercase tracking-[0.14em] text-white/45 hover:border-cyan-300/50 hover:text-cyan-200">Reset</button>
      </div>

      {pinned.length > 0 && (
        <div className="mt-3 border border-cyan-300/20 bg-cyan-400/5 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-cyan-200/70">
          Earth-staged widgets: {pinned.map((id) => monitorDeskWidgetManifest.find((widget) => widget.id === id)?.title || id).join(' · ')}
        </div>
      )}

      <div className="mt-4 grid grid-cols-1 gap-3 xl:grid-cols-2 2xl:grid-cols-3">
        {widgets.map((widget, index) => {
          const isPinned = pinned.includes(widget.id);
          return (
            <section
              key={widget.id}
              draggable
              onDragStart={() => setDraggingId(widget.id)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => reorderByDrop(widget.id)}
              className={`flex min-h-[240px] flex-col overflow-hidden rounded border bg-black/45 shadow-[0_10px_22px_rgba(0,0,0,0.42)] transition-all ${draggingId === widget.id ? 'border-cyan-300/70 opacity-70' : isPinned ? 'border-cyan-300/45' : 'border-white/10 hover:border-cyan-300/30'}`}
            >
              <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.03] px-3 py-2">
                <div className="min-w-0">
                  <div className="text-[10px] uppercase tracking-[0.18em] text-cyan-200">{widget.title}</div>
                  <div className="mt-0.5 truncate text-[9px] uppercase tracking-[0.1em] text-white/35">Drag card to reorder · Desk widget {index + 1}</div>
                </div>
                <div className="flex shrink-0 items-center gap-1 text-[9px] uppercase tracking-[0.1em]">
                  <button type="button" onClick={() => moveWidget(widget.id, -1)} className="border border-white/10 px-1.5 py-1 text-white/45 hover:border-cyan-300/50 hover:text-cyan-200">←</button>
                  <button type="button" onClick={() => moveWidget(widget.id, 1)} className="border border-white/10 px-1.5 py-1 text-white/45 hover:border-cyan-300/50 hover:text-cyan-200">→</button>
                  <button type="button" onClick={() => togglePinned(widget.id)} className={`flex items-center gap-1 border px-1.5 py-1 ${isPinned ? 'border-cyan-300/60 text-cyan-200' : 'border-white/10 text-white/45 hover:border-cyan-300/50 hover:text-cyan-200'}`}>
                    {isPinned ? <PinOff size={10} /> : <Pin size={10} />}
                    {isPinned ? 'Unpin' : 'Earth'}
                  </button>
                </div>
              </div>
              <div className="min-h-0 flex-1 overflow-auto custom-scrollbar p-3">
                <WidgetBody id={widget.id} />
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
};

function WidgetBody({ id }: { id: MonitorDeskWidgetId }) {
  if (id === 'map-layers') return <MapLayersWidget />;
  if (id === 'rocket-alerts') return <RocketAlertWidget />;
  if (id === 'gulf-watch') return <GulfWatchCombinedWidget />;
  if (id === 'ai-synthesis') return <AiSynthesisWidget />;
  if (id === 'live-intel-feed') return <LiveIntelFeedWidget />;
  return null;
}

function AiSynthesisWidget() {
  const { currentRegionLat, currentRegionLon, selectedCategory, setSelectedCategory } = useOsintStore();
  const { data: routeData, isLoading, isError } = useOsintNews(currentRegionLat, currentRegionLon, selectedCategory, true);
  const intelBrief = useIntelBrief();
  const totalSignals = (routeData?.news.length ?? 0) + (routeData?.intercepts?.length ?? 0);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex items-center justify-between shrink-0 pb-2 border-b border-white/8">
        <div className="flex items-center gap-1.5">
          <BrainCircuit size={12} className="text-purple-400 drop-shadow-[0_0_6px_rgba(168,85,247,0.8)]" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-intel-text-light">AI Synthesis</span>
        </div>
        {isLoading && <span className="text-[7px] text-purple-400/60 animate-pulse uppercase tracking-widest">Processing...</span>}
      </div>

      <div className="flex gap-1 overflow-x-auto no-scrollbar shrink-0 py-2 border-b border-white/5">
        {CATEGORIES.map((cat) => (
          <button key={cat} onClick={() => setSelectedCategory(cat)} className={`whitespace-nowrap px-1.5 py-0.5 text-[7px] uppercase font-bold border transition-all ${selectedCategory === cat ? 'bg-purple-500/20 text-purple-300 border-purple-500/50' : 'bg-transparent text-white/30 border-white/8 hover:border-purple-500/30 hover:text-purple-300/60'}`}>
            {cat}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pt-2 space-y-2">
        <div className="border border-purple-500/20 bg-purple-950/20">
          <div className="px-2.5 pt-2.5 pb-1">
            <div className="flex items-center gap-1.5 mb-0.5"><Sparkles size={10} className="text-purple-400/70" /><span className="text-[11px] text-intel-text-light font-semibold tracking-wide">Generate Insight</span></div>
            <p className="text-[8px] text-white/25 font-mono mb-2.5 leading-relaxed">{intelBrief.data ? 'Last synthesis complete. Click to regenerate.' : 'Awaiting selection of sector data to process.'}</p>
            {intelBrief.data && <div className="text-[9px] text-gray-400 font-mono leading-relaxed mb-2 line-clamp-4">{intelBrief.data.brief}</div>}
            {intelBrief.isPending && <div className="text-[9px] text-purple-400/60 animate-pulse font-mono mb-2">&gt; Parsing incoming signals...</div>}
          </div>
          <button onClick={() => routeData?.news && intelBrief.mutate({ news: routeData.news, lat: currentRegionLat, lon: currentRegionLon })} disabled={!routeData || routeData.news.length === 0 || intelBrief.isPending} className="w-full relative border-t border-purple-500/20 disabled:opacity-30 group/btn">
            <div className={`absolute inset-0 bg-purple-500/15 transition-all duration-300 ${intelBrief.isPending ? 'w-full animate-pulse' : 'w-0 group-hover/btn:w-full'}`} />
            <span className="relative flex items-center justify-center gap-2 py-1.5 text-[8px] font-bold tracking-[0.2em] uppercase text-purple-300/70 group-hover/btn:text-purple-200 transition-colors">{intelBrief.isPending ? '[...] Processing' : `[${totalSignals > 0 ? totalSignals : '0'}] Initialize Synthesis`}</span>
          </button>
        </div>

        {routeData?.intercepts && routeData.intercepts.length > 0 && (
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-[8px] text-white/30 uppercase tracking-[0.15em]"><span className="w-1 h-1 bg-white/30 rounded-full" />{routeData.intercepts.length} Critical Signal{routeData.intercepts.length > 1 ? 's' : ''}</div>
            {routeData.intercepts.map((item, idx) => {
              const c = INTERCEPT_COLORS[idx % INTERCEPT_COLORS.length];
              return <div key={idx} className={`border-l-2 ${c.border} ${c.bg} pl-2.5 pr-2 py-2`}><div className={`flex items-center justify-between mb-1 ${c.tag}`}><div className="flex items-center gap-1"><span className={`w-1 h-1 rounded-full shrink-0 ${c.dot}`} /><span className="text-[8px] font-bold uppercase tracking-wider opacity-80 truncate">{shortSource(item.source)}</span></div><span className="text-[7px] opacity-50 shrink-0 ml-1">{safeFmt(item.pubDate, TIME_FORMATTER)}</span></div><a href={item.link} target="_blank" rel="noreferrer" className="text-[10px] text-white/80 font-semibold leading-snug hover:text-white transition-colors block line-clamp-2">{item.title}</a></div>;
            })}
          </div>
        )}

        {isError && <div className="text-[9px] text-red-400/70 p-2 border border-red-500/20 bg-red-500/5 font-mono">&gt; COMMS LINK SEVERED.</div>}
      </div>
    </div>
  );
}

function LiveIntelFeedWidget() {
  const { currentRegionLat, currentRegionLon, selectedCategory } = useOsintStore();
  const { data: routeData, isLoading, isError } = useOsintNews(currentRegionLat, currentRegionLon, selectedCategory, true);
  const totalSignals = (routeData?.news.length ?? 0) + (routeData?.intercepts?.length ?? 0);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex items-center justify-between shrink-0 pb-2 border-b border-white/8">
        <div className="flex items-center gap-1.5"><Rss size={11} className="text-intel-accent drop-shadow-[0_0_6px_var(--color-intel-accent)]" /><span className="text-[10px] font-bold uppercase tracking-widest text-intel-text-light">Live Intel Feed</span></div>
        <div className="flex items-center gap-2.5 text-[8px]">{totalSignals > 0 && <span className="text-intel-accent/50 tabular-nums">{totalSignals} signals</span>}<span className="text-white/20">{currentRegionLat === 0 && currentRegionLon === 0 ? 'click map → region' : `${currentRegionLat.toFixed(1)}°, ${currentRegionLon.toFixed(1)}°`}</span></div>
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar pt-2 space-y-0">
        {isLoading && <div className="flex items-center justify-center h-10"><span className="text-[9px] text-intel-accent/30 animate-pulse font-mono">&gt; Intercepting signals...</span></div>}
        {!isLoading && (routeData?.news.length ?? 0) === 0 && !isError && <div className="text-[9px] text-white/20 p-3 text-center font-mono">&gt; No signals detected in sector</div>}
        {routeData?.news?.map((item, idx) => <a key={idx} href={item.link} target="_blank" rel="noreferrer" className="group/item flex flex-col gap-0.5 border-b border-white/5 py-2 px-1 hover:bg-white/3 transition-colors"><div className="flex items-baseline justify-between gap-2"><span className="text-[8px] text-intel-accent/45 font-bold tracking-wider shrink-0">[{shortSource(item.source)}]</span><span className="text-[7px] text-white/20 tabular-nums shrink-0">{safeFmt(item.pubDate, DATE_FORMATTER) || safeFmt(item.pubDate, TIME_FORMATTER)}</span></div><p className="text-[10px] text-white/70 font-medium leading-snug group-hover/item:text-white transition-colors line-clamp-2">{item.title}</p></a>)}
        {isError && <div className="text-[9px] text-red-400/70 p-2 border border-red-500/20 bg-red-500/5 font-mono">&gt; Feed route unavailable.</div>}
      </div>
    </div>
  );
}
