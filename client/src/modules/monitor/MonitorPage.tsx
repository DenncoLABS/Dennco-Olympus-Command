import React from 'react';
import { MonitorMap } from './components/MonitorMap';
import { useOsintStore } from '../osint/osint.store';
import { useOsintNews } from '../osint/hooks/useOsintNews';

export const MonitorPage: React.FC = () => {
  const { currentRegionLat, currentRegionLon, selectedCategory } = useOsintStore();
  const { data: routeData, isLoading, isError } = useOsintNews(currentRegionLat, currentRegionLon, selectedCategory, true);
  const totalSignals = (routeData?.news.length ?? 0) + (routeData?.intercepts?.length ?? 0);

  return (
    <div className="absolute inset-0 bg-intel-bg font-mono overflow-hidden z-20 text-intel-text">
      <div className="absolute top-3 left-1/2 z-40 -translate-x-1/2 pointer-events-none">
        <div className="tech-panel px-4 py-2 shadow-lg border border-intel-accent/20 bg-black/70 backdrop-blur">
          <div className="flex items-center gap-4 text-[10px] uppercase tracking-[0.18em] text-white/55">
            <span className="text-intel-accent">Monitor API</span>
            <span className={isError ? 'text-red-300' : isLoading ? 'text-amber-300' : 'text-emerald-300'}>
              {isError ? 'Link Fault' : isLoading ? 'Refreshing' : 'Active'}
            </span>
            <span>{totalSignals} signals</span>
            <span>Refresh cycle: 30s</span>
            <span>{currentRegionLat.toFixed(1)}°, {currentRegionLon.toFixed(1)}°</span>
          </div>
        </div>
      </div>
      <MonitorMap />
      <div className="absolute inset-0 pointer-events-none bg-[url('/scanlines.png')] opacity-[0.04] mix-blend-overlay z-50" />
    </div>
  );
};
