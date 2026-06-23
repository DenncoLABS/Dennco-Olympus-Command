import React from 'react';
import { CyberMap } from './components/CyberMap';
import { CyberSidebar } from './components/CyberSidebar';
import { CyberEndpointSelector } from './components/CyberEndpointSelector';
import { CyberDataVisualization } from './components/CyberDataVisualization';
import { useDynamicCyberData } from './hooks/useCyberData';

// ─── Live header stat tiles ───────────────────────────────────────────────────
const StatTile: React.FC<{ label: string; value: string; color: string }> = ({
  label,
  value,
  color,
}) => (
  <div className="tech-panel px-4 py-2 flex flex-col justify-center min-w-[140px]">
    <span className="text-intel-text-light/40 font-mono text-[9px] uppercase tracking-[0.15em]">
      {label}
    </span>
    <span className="font-mono text-sm font-bold truncate" style={{ color }}>
      {value}
    </span>
  </div>
);

const LiveMetrics: React.FC = () => {
  const { data: l7Data } = useDynamicCyberData('/radar/attacks/layer7/top/locations/origin', '7d');
  const { data: anomData } = useDynamicCyberData('/radar/traffic_anomalies', '7d');
  const { data: rankData } = useDynamicCyberData('/radar/ranking/top', '7d');

  const topAttacker = l7Data?.top_0?.[0]?.originCountryName ?? '…';
  const anomalies = anomData?.trafficAnomalies?.length ?? '…';
  const topDomain = rankData?.top_0?.[0]?.domain ?? '…';

  return (
    <div className="flex gap-2">
      <StatTile label="Top DDoS Origin" value={topAttacker} color="#ff3366" />
      <StatTile label="Active Anomalies" value={String(anomalies)} color="#ef4444" />
      <StatTile label="#1 Domain" value={topDomain} color="#f59e0b" />
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
export const CyberPage: React.FC = () => {
  return (
    <div className="absolute inset-0 bg-intel-bg font-mono overflow-hidden z-20 flex flex-col text-intel-text tracking-wide">
      {/* ── Top: Global Map (≈ 55% height) ── */}
      <div className="relative flex-[55] border-b border-intel-accent/20 shadow-[0_4px_30px_rgba(0,229,255,0.05)] bg-black overflow-hidden">
        <CyberMap />

        {/* Floating header bar over the map */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 pointer-events-none">
          <div className="tech-panel px-4 py-2 flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-[#ff3366] animate-pulse shadow-[0_0_8px_#ff3366]" />
            <span className="text-intel-text-light font-mono text-xs font-bold tracking-[0.2em] uppercase">
              Cyber Threat Globe
            </span>
            <span className="text-intel-text-light/30 font-mono text-[10px]">
              Cloudflare Radar · Live
            </span>
          </div>
        </div>

        {/* Live metric badges – bottom-left corner over map */}
        <div className="absolute bottom-3 left-3 z-20 flex gap-2 pointer-events-none">
          <LiveMetrics />
        </div>
      </div>

      {/* ── Bottom: Data Panels (≈ 45% height) ── */}
      <div className="relative flex-[45] bg-gradient-to-b from-black to-intel-bg min-h-0">
        {/* Subtle grid texture */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,229,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,229,255,0.03)_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none" />

        <div className="relative z-10 flex h-full gap-3 p-3">
          {/* Left sidebar: Category navigation */}
          <CyberSidebar />

          {/* Right area: Endpoint selector + Data viz */}
          <div className="flex-1 flex flex-col gap-2 min-w-0 overflow-hidden">
            <CyberEndpointSelector />
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
              <CyberDataVisualization />
            </div>
          </div>
        </div>
      </div>

      {/* Scanlines overlay */}
      <div className="absolute inset-0 pointer-events-none bg-[url('/scanlines.png')] opacity-[0.04] mix-blend-overlay z-50" />
    </div>
  );
};
