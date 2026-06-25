import React, { useEffect, useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, BrainCircuit, Pin, PinOff, Rss, Sparkles } from 'lucide-react';
import { MapLayersWidget } from '../components/widgets/MapLayersWidget';
import { RocketAlertWidget } from '../components/widgets/RocketAlertWidget';
import { GulfWatchCombinedWidget } from '../components/widgets/GulfWatchCombinedWidget';
import { useOsintStore } from '../../osint/osint.store';
import { useOsintNews } from '../../osint/hooks/useOsintNews';
import { useIntelBrief } from '../../osint/hooks/useIntelBrief';
import { monitorDeskWidgetManifest, type MonitorDeskWidgetId } from './monitorDeskWidgetManifest';

const ORDER_KEY = 'olympus.desk.monitorWidgets.order.v1';
const EARTH_KEY = 'olympus.desk.monitorWidgets.earthPinned.v1';

const CATEGORIES = ['All', 'Politics & Society', 'Business & Economy', 'Science & Technology', 'Local News'] as const;
const DATE_FORMATTER = new Intl.DateTimeFormat(undefined, { dateStyle: 'short' });
const TIME_FORMATTER = new Intl.DateTimeFormat(undefined, { timeStyle: 'short' });

function safeFmt(dateStr: string, fmt: Intl.DateTimeFormat): string {
  try {
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? '' : fmt.format(d);
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

function defaultOrder(): MonitorDeskWidgetId[] {
  return monitorDeskWidgetManifest.map((widget) => widget.id);
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

export const MonitorDeskWorkspace: React.FC = () => {
  const [order, setOrder] = useState<MonitorDeskWidgetId[]>(() => readOrder());
  const [earthPinned, setEarthPinned] = useState<MonitorDeskWidgetId[]>(() => readEarthPinned());
  const [draggingId, setDraggingId] = useState<MonitorDeskWidgetId | null>(null);
  const manifestById = useMemo(() => new Map(monitorDeskWidgetManifest.map((widget) => [widget.id, widget])), []);

  useEffect(() => {
    localStorage.setItem(ORDER_KEY, JSON.stringify(order));
  }, [order]);

  useEffect(() => {
    localStorage.setItem(EARTH_KEY, JSON.stringify(earthPinned));
  }, [earthPinned]);

  const toggleEarthPin = (id: MonitorDeskWidgetId) => {
    setEarthPinned((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  };

  const reorder = (id: MonitorDeskWidgetId, direction: -1 | 1) => setOrder((current) => moveItem(current, id, direction));

  return (
    <div className="h-full min-h-0 flex flex-col">
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div>
          <h3 className="text-cyan-200 uppercase tracking-[0.18em] text-sm">Monitor Widget Workspace</h3>
          <p className="mt-1 text-xs text-white/45">Move, reorder, and stage Monitor widgets for future Earth-screen placement.</p>
        </div>
        <div className="text-[10px] uppercase tracking-[0.14em] text-white/35">{earthPinned.length} pinned to Earth staging</div>
      </div>

      <div className="mt-3 grid min-h-0 flex-1 grid-cols-1 gap-3 overflow-y-auto pr-1 lg:grid-cols-2 xl:grid-cols-3">
        {order.map((id, index) => {
          const definition = manifestById.get(id);
          if (!definition) return null;
          const pinned = earthPinned.includes(id);
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
              className={`flex min-h-[260px] flex-col rounded border bg-black/45 transition-all ${pinned ? 'border-cyan-300/50 shadow-[0_0_18px_rgba(34,211,238,0.14)]' : 'border-white/10 hover:border-cyan-300/35'}`}
            >
              <div className="flex items-center justify-between gap-2 border-b border-white/10 px-3 py-2">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.16em] text-cyan-300">{definition.title}</div>
                  <div className="mt-0.5 text-[8px] uppercase tracking-[0.12em] text-white/30">Desk Widget · drag card to reorder</div>
                </div>
                <div className="flex items-center gap-1">
                  <button type="button" onClick={() => reorder(id, -1)} disabled={index === 0} className="border border-white/10 p-1 text-white/45 hover:border-cyan-300/50 hover:text-cyan-200 disabled:opacity-25"><ArrowUp size={12} /></button>
                  <button type="button" onClick={() => reorder(id, 1)} disabled={index === order.length - 1} className="border border-white/10 p-1 text-white/45 hover:border-cyan-300/50 hover:text-cyan-200 disabled:opacity-25"><ArrowDown size={12} /></button>
                  <button type="button" onClick={() => toggleEarthPin(id)} className={`border p-1 ${pinned ? 'border-cyan-300/60 text-cyan-200' : 'border-white/10 text-white/45 hover:border-cyan-300/50 hover:text-cyan-200'}`} title={pinned ? 'Dock back to Desk staging' : 'Pin to Earth staging'}>{pinned ? <PinOff size={12} /> : <Pin size={12} />}</button>
                </div>
              </div>
              <div className="min-h-0 flex-1 overflow-hidden p-3">
                <MonitorWidgetBody id={id} />
              </div>
              <div className="border-t border-white/10 px-3 py-2 text-[9px] uppercase tracking-[0.12em] text-white/35">
                {pinned ? 'Earth staging saved · live map placement next phase' : definition.futureUse}
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
      return <div className="h-full overflow-auto custom-scrollbar"><MapLayersWidget /></div>;
    case 'rocket-alerts':
      return <div className="h-full overflow-auto custom-scrollbar"><RocketAlertWidget /></div>;
    case 'gulf-watch':
      return <div className="h-full overflow-auto custom-scrollbar"><GulfWatchCombinedWidget /></div>;
    case 'ai-synthesis':
      return <AiSynthesisWidget />;
    case 'live-intel-feed':
      return <LiveIntelFeedWidget />;
  }
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
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`whitespace-nowrap px-1.5 py-0.5 text-[7px] uppercase font-bold border transition-all ${selectedCategory === cat ? 'bg-purple-500/20 text-purple-300 border-purple-500/50' : 'bg-transparent text-white/30 border-white/8 hover:border-purple-500/30 hover:text-purple-300/60'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pt-2 space-y-2">
        <div className="border border-purple-500/20 bg-purple-950/20">
          <div className="px-2.5 pt-2.5 pb-1">
            <div className="flex items-center gap-1.5 mb-0.5">
              <Sparkles size={10} className="text-purple-400/70" />
              <span className="text-[11px] text-intel-text-light font-semibold tracking-wide">Generate Insight</span>
            </div>
            <p className="text-[8px] text-white/25 font-mono mb-2.5 leading-relaxed">
              {intelBrief.data ? 'Last synthesis complete. Click to regenerate.' : 'Awaiting selection of sector data to process.'}
            </p>
            {intelBrief.data && <div className="text-[9px] text-gray-400 font-mono leading-relaxed mb-2 line-clamp-5">{intelBrief.data.brief}</div>}
            {intelBrief.isPending && <div className="text-[9px] text-purple-400/60 animate-pulse font-mono mb-2">&gt; Parsing incoming signals...</div>}
          </div>
          <button
            onClick={() => {
              if (routeData?.news) intelBrief.mutate({ news: routeData.news, lat: currentRegionLat, lon: currentRegionLon });
            }}
            disabled={!routeData || routeData.news.length === 0 || intelBrief.isPending}
            className="w-full relative border-t border-purple-500/20 disabled:opacity-30 group/btn"
          >
            <div className={`absolute inset-0 bg-purple-500/15 transition-all duration-300 ${intelBrief.isPending ? 'w-full animate-pulse' : 'w-0 group-hover/btn:w-full'}`} />
            <span className="relative flex items-center justify-center gap-2 py-1.5 text-[8px] font-bold tracking-[0.2em] uppercase text-purple-300/70 group-hover/btn:text-purple-200 transition-colors">
              {intelBrief.isPending ? '[...] Processing' : `[${totalSignals > 0 ? totalSignals : '0'}] Initialize Synthesis`}
            </span>
          </button>
        </div>

        {routeData?.intercepts && routeData.intercepts.length > 0 && <div className="space-y-1.5"><div className="flex items-center gap-1.5 text-[8px] text-white/30 uppercase tracking-[0.15em]"><span className="w-1 h-1 bg-white/30 rounded-full" />{routeData.intercepts.length} Critical Signal{routeData.intercepts.length > 1 ? 's' : ''}</div>{routeData.intercepts.slice(0, 8).map((item, idx) => <div key={idx} className="border-l-2 border-l-purple-500 bg-purple-500/8 pl-2.5 pr-2 py-2"><div className="flex items-center justify-between mb-1 text-purple-400"><span className="text-[8px] font-bold uppercase tracking-wider opacity-80 truncate">{shortSource(item.source)}</span><span className="text-[7px] opacity-50 shrink-0 ml-1">{safeFmt(item.pubDate, TIME_FORMATTER)}</span></div><a href={item.link} target="_blank" rel="noreferrer" className="text-[10px] text-white/80 font-semibold leading-snug hover:text-white transition-colors block line-clamp-2">{item.title}</a></div>)}</div>}
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
        {routeData?.news?.slice(0, 24).map((item, idx) => <a key={idx} href={item.link} target="_blank" rel="noreferrer" className="group/item flex flex-col gap-0.5 border-b border-white/5 py-2 px-1 hover:bg-white/3 transition-colors"><div className="flex items-baseline justify-between gap-2"><span className="text-[8px] text-intel-accent/45 font-bold tracking-wider shrink-0">[{shortSource(item.source)}]</span><span className="text-[7px] text-white/20 tabular-nums shrink-0">{safeFmt(item.pubDate, DATE_FORMATTER) || safeFmt(item.pubDate, TIME_FORMATTER)}</span></div><p className="text-[10px] text-white/70 font-medium leading-snug group-hover/item:text-white transition-colors line-clamp-2">{item.title}</p></a>)}
      </div>
    </div>
  );
}
