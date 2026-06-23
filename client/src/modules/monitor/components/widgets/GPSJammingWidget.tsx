import { useGPSJammingStore } from '../../gpsJamming.store';
import { useGPSJammingData } from '../../hooks/useGPSJammingData';
import { AlertTriangle, CheckCircle2, AlertCircle, CalendarDays, Activity } from 'lucide-react';
import clsx from 'clsx';

export function GPSJammingWidget() {
  const { data, loading, enabled, setEnabled } = useGPSJammingData();
  const {
    availableDates,
    selectedDate,
    setSelectedDate,
    showCleanSignals,
    showInterferedSignals,
    showMixedSignals,
    setShowCleanSignals,
    setShowInterferedSignals,
    setShowMixedSignals,
  } = useGPSJammingStore();

  const stats = data
    ? {
        total: data.totalCells,
        clean: data.cells.filter((c) => c.interference <= 0.02).length,
        mixed: data.cells.filter((c) => c.interference > 0.02 && c.interference <= 0.1).length,
        interfered: data.cells.filter((c) => c.interference > 0.1).length,
      }
    : null;

  return (
    <div className="flex flex-col h-full gap-0">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0 pb-2 border-b border-white/10">
        <div className="flex items-center gap-1.5">
          <Activity
            size={12}
            className="text-orange-400 drop-shadow-[0_0_8px_rgba(255,150,0,0.9)]"
          />
          <span className="text-[10px] font-bold uppercase tracking-widest text-intel-text-light">
            GPS Jamming
          </span>
        </div>
        <div className="flex flex-col items-end">
          <button
            onClick={() => setEnabled(!enabled)}
            className={clsx(
              'text-[8px] px-2 py-0.5 font-bold border transition-all',
              enabled
                ? 'bg-orange-500/25 text-orange-300 border-orange-500/60 shadow-[0_0_8px_rgba(255,150,0,0.2)]'
                : 'bg-black/60 text-white/40 border-white/15 hover:border-orange-500/40 hover:text-orange-400/60',
            )}
          >
            LAYER: {enabled ? 'ON' : 'OFF'}
          </button>
          {!enabled && (
            <span className="text-[7px] text-white/25 mt-0.5 tracking-wider">Tap to Activate</span>
          )}
        </div>
      </div>

      {/* Date selector */}
      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar shrink-0 py-2 border-b border-white/5">
        <CalendarDays size={9} className="text-orange-400/50 shrink-0" />
        {availableDates.length > 0 ? (
          <>
            <button
              onClick={() => setSelectedDate(null)}
              className={clsx(
                'whitespace-nowrap px-1.5 py-0.5 text-[7px] uppercase font-bold border transition-colors',
                selectedDate === null
                  ? 'bg-orange-500/20 text-orange-300 border-orange-500/50'
                  : 'bg-transparent text-intel-text border-white/10 hover:border-orange-500/30 hover:text-orange-400/60',
              )}
            >
              Latest
            </button>
            {availableDates.slice(0, 4).map((date) => (
              <button
                key={date}
                onClick={() => setSelectedDate(selectedDate === date ? null : date)}
                className={clsx(
                  'whitespace-nowrap px-1.5 py-0.5 text-[7px] uppercase font-bold border transition-colors',
                  selectedDate === date
                    ? 'bg-orange-500/20 text-orange-300 border-orange-500/50'
                    : 'bg-transparent text-intel-text border-white/10 hover:border-orange-500/30 hover:text-orange-400/60',
                )}
              >
                {date.slice(5)}
              </button>
            ))}
          </>
        ) : (
          <span className="text-[8px] text-white/25">No datasets</span>
        )}
      </div>

      {/* Disabled state — decorative heatmap placeholder */}
      {!enabled && (
        <div className="flex-1 relative overflow-hidden mt-1">
          {/* Simulated interference heatmap gradient */}
          <div
            className="absolute inset-0 opacity-35"
            style={{
              background: [
                'radial-gradient(ellipse 55% 45% at 38% 58%, rgba(220,38,38,0.85) 0%, transparent 65%)',
                'radial-gradient(ellipse 40% 35% at 62% 42%, rgba(251,146,60,0.6) 0%, transparent 60%)',
                'radial-gradient(ellipse 30% 25% at 25% 35%, rgba(250,204,21,0.4) 0%, transparent 55%)',
                'radial-gradient(ellipse 50% 40% at 70% 70%, rgba(59,130,246,0.25) 0%, transparent 60%)',
              ].join(', '),
            }}
          />
          {/* Subtle grid overlay */}
          <div className="absolute inset-0 opacity-10 bg-[linear-gradient(rgba(255,255,255,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.15)_1px,transparent_1px)] bg-[size:12px_12px]" />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center px-4">
            <Activity size={16} className="text-orange-400/30" />
            <p className="text-[9px] text-white/30 leading-relaxed font-mono">
              Activate to view
              <br />
              interference pattern
              <br />
              for this sector.
            </p>
          </div>
        </div>
      )}

      {enabled && loading && (
        <div className="flex-1 flex items-center justify-center">
          <span className="text-orange-400/60 animate-pulse text-[9px] font-mono">
            &gt; Syncing interference data...
          </span>
        </div>
      )}

      {enabled && !loading && stats && (
        <div className="flex-1 flex flex-col gap-2 overflow-y-auto custom-scrollbar pt-2">
          {/* Total */}
          <div className="flex items-center justify-between px-2.5 py-1.5 border border-white/8 bg-white/3">
            <span className="text-[8px] text-white/40 uppercase tracking-wider">Total Cells</span>
            <span className="text-[15px] font-bold text-intel-accent tabular-nums">
              {stats.total.toLocaleString()}
            </span>
          </div>

          {/* Bars */}
          {[
            {
              icon: <CheckCircle2 size={9} />,
              label: 'Low',
              sub: '0–2%',
              count: stats.clean,
              borderCls: 'border-green-500/30',
              bgCls: 'bg-green-500/5',
              textCls: 'text-green-400',
              barCls: 'bg-green-500',
            },
            {
              icon: <AlertCircle size={9} />,
              label: 'Med',
              sub: '2–10%',
              count: stats.mixed,
              borderCls: 'border-yellow-500/30',
              bgCls: 'bg-yellow-500/5',
              textCls: 'text-yellow-400',
              barCls: 'bg-yellow-500',
            },
            {
              icon: <AlertTriangle size={9} />,
              label: 'High',
              sub: '>10%',
              count: stats.interfered,
              borderCls: 'border-red-500/30',
              bgCls: 'bg-red-500/5',
              textCls: 'text-red-400',
              barCls: 'bg-red-500',
            },
          ].map(({ icon, label, sub, count, borderCls, bgCls, textCls, barCls }) => {
            const pct = ((count / stats.total) * 100).toFixed(1);
            return (
              <div key={label} className={`border ${borderCls} ${bgCls} px-2.5 py-1.5`}>
                <div className={`flex items-center justify-between mb-1 ${textCls}`}>
                  <div className="flex items-center gap-1 text-[8px] uppercase tracking-wider opacity-80">
                    {icon}
                    <span>{label}</span>
                    <span className="opacity-40">({sub})</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[8px] tabular-nums">
                    <span className="font-bold text-[10px]">{count.toLocaleString()}</span>
                    <span className="opacity-40">{pct}%</span>
                  </div>
                </div>
                <div className="h-px bg-white/5 overflow-hidden">
                  <div
                    className={`h-full ${barCls} opacity-70 transition-all duration-500`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}

          {/* Filters */}
          <div className="border-t border-white/8 pt-2 mt-1">
            <div className="text-[8px] text-white/30 uppercase tracking-wider mb-1.5">
              Map Filters
            </div>
            <div className="space-y-1.5">
              {[
                {
                  checked: showCleanSignals,
                  onChange: setShowCleanSignals,
                  colorCls: 'border-green-500/50 checked:bg-green-500',
                  dotCls: 'bg-green-500/80',
                  label: 'Low',
                },
                {
                  checked: showMixedSignals,
                  onChange: setShowMixedSignals,
                  colorCls: 'border-yellow-500/50 checked:bg-yellow-500',
                  dotCls: 'bg-yellow-500/80',
                  label: 'Medium',
                },
                {
                  checked: showInterferedSignals,
                  onChange: setShowInterferedSignals,
                  colorCls: 'border-red-500/50 checked:bg-red-500',
                  dotCls: 'bg-red-500/80',
                  label: 'High',
                },
              ].map(({ checked, onChange, colorCls, dotCls, label }) => (
                <label key={label} className="flex items-center gap-1.5 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => onChange(e.target.checked)}
                    className={`w-2.5 h-2.5 rounded border-2 bg-black/50 focus:outline-none cursor-pointer ${colorCls}`}
                  />
                  <div className={`w-2 h-2 rounded-sm shrink-0 ${dotCls}`} />
                  <span className="text-[9px] text-white/60 group-hover:text-white transition-colors">
                    {label} Interference
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="text-[7px] text-white/20 mt-auto pt-2 border-t border-white/5">
            <span className="text-orange-400/50">gpsjam.org</span>
            {data?.date && <span className="ml-1.5 text-white/20">· {data.date}</span>}
          </div>
        </div>
      )}
    </div>
  );
}
