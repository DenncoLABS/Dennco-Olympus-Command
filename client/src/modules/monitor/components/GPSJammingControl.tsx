import { useGPSJammingStore } from '../gpsJamming.store';
import { useGPSJammingData } from '../hooks/useGPSJammingData';

/**
 * Clean GPS Jamming Control Panel
 * Simple checkbox filters for signal types
 */
export function GPSJammingControl() {
  const { enabled, data, loading, setEnabled } = useGPSJammingData();
  const {
    showCleanSignals,
    showInterferedSignals,
    showMixedSignals,
    setShowCleanSignals,
    setShowInterferedSignals,
    setShowMixedSignals,
  } = useGPSJammingStore();

  if (!enabled) {
    return (
      <button
        onClick={() => setEnabled(true)}
        className="absolute bottom-4 left-4 z-10 pointer-events-auto tech-panel px-4 py-2 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-white/20" />
          <span className="font-mono text-xs font-bold tracking-wider text-white/70 uppercase">
            GPS Jamming
          </span>
        </div>
      </button>
    );
  }

  return (
    <div className="absolute bottom-4 left-4 z-10 pointer-events-auto tech-panel p-3 min-w-[240px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse shadow-[0_0_8px_rgba(255,165,0,0.6)]" />
          <span className="font-mono text-xs font-bold tracking-wider text-intel-text-light uppercase">
            GPS Jamming
          </span>
        </div>
        <button
          onClick={() => setEnabled(false)}
          className="text-white/40 hover:text-white/80 transition-colors text-sm"
        >
          ×
        </button>
      </div>

      {/* Status */}
      {loading && (
        <div className="text-[10px] text-intel-accent animate-pulse mb-3">Loading data...</div>
      )}

      {data && !loading && (
        <div className="text-[10px] text-green-400 mb-3">
          {data.totalCells.toLocaleString()} cells loaded
        </div>
      )}

      {/* Filter Checkboxes */}
      <div className="space-y-2">
        <div className="text-[10px] text-white/50 uppercase tracking-wider mb-2">
          Filter Signals
        </div>

        <label className="flex items-center gap-2 cursor-pointer group">
          <input
            type="checkbox"
            checked={showCleanSignals}
            onChange={(e) => setShowCleanSignals(e.target.checked)}
            className="w-3 h-3 rounded border-2 border-green-500/50 bg-black/50 checked:bg-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 cursor-pointer"
          />
          <div className="flex items-center gap-2 flex-1">
            <div className="w-3 h-3 rounded-sm bg-green-500/80" />
            <span className="text-[11px] text-white/80 group-hover:text-white transition-colors">
              Low (0-2%)
            </span>
          </div>
        </label>

        <label className="flex items-center gap-2 cursor-pointer group">
          <input
            type="checkbox"
            checked={showMixedSignals}
            onChange={(e) => setShowMixedSignals(e.target.checked)}
            className="w-3 h-3 rounded border-2 border-yellow-500/50 bg-black/50 checked:bg-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500 cursor-pointer"
          />
          <div className="flex items-center gap-2 flex-1">
            <div className="w-3 h-3 rounded-sm bg-yellow-500/80" />
            <span className="text-[11px] text-white/80 group-hover:text-white transition-colors">
              Medium (2-10%)
            </span>
          </div>
        </label>

        <label className="flex items-center gap-2 cursor-pointer group">
          <input
            type="checkbox"
            checked={showInterferedSignals}
            onChange={(e) => setShowInterferedSignals(e.target.checked)}
            className="w-3 h-3 rounded border-2 border-red-500/50 bg-black/50 checked:bg-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 cursor-pointer"
          />
          <div className="flex items-center gap-2 flex-1">
            <div className="w-3 h-3 rounded-sm bg-red-500/80" />
            <span className="text-[11px] text-white/80 group-hover:text-white transition-colors">
              High (&gt;10%)
            </span>
          </div>
        </label>
      </div>

      {/* Data source */}
      <div className="text-[9px] text-white/30 mt-3 pt-2 border-t border-white/5">
        Data from <span className="text-orange-400/70">gpsjam.org</span>
      </div>
    </div>
  );
}
