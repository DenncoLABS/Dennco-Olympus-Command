import React, { useCallback, useState } from 'react';
import { useMaritimeStore } from '../state/maritime.store';

interface MaritimeToolbarProps {
  totalCount: number;
  filteredCount: number;
  mooredCount?: number;
  portCount?: number;
  installationCount?: number;
}

export const MaritimeToolbar: React.FC<MaritimeToolbarProps> = ({
  totalCount,
  filteredCount,
  mooredCount = 0,
  portCount = 0,
  installationCount = 0,
}) => {
  const name = useMaritimeStore((s) => s.filters.name);
  const speedMin = useMaritimeStore((s) => s.filters.speedMin);
  const showUnderway = useMaritimeStore((s) => s.filters.showUnderway);
  const showMoored = useMaritimeStore((s) => s.filters.showMoored);
  const showPorts = useMaritimeStore((s) => s.showPorts);
  const setShowPorts = useMaritimeStore((s) => s.setShowPorts);
  const showInstallations = useMaritimeStore((s) => s.showInstallations);
  const setShowInstallations = useMaritimeStore((s) => s.setShowInstallations);
  const showMaritimeNodes = useMaritimeStore((s) => s.showMaritimeNodes);
  const setShowMaritimeNodes = useMaritimeStore((s) => s.setShowMaritimeNodes);
  const activeMaritimeNodeIds = useMaritimeStore((s) => s.activeMaritimeNodeIds);
  const activateAllMaritimeNodes = useMaritimeStore((s) => s.activateAllMaritimeNodes);
  const clearMaritimeNodes = useMaritimeStore((s) => s.clearMaritimeNodes);
  const setFilter = useMaritimeStore((s) => s.setFilter);

  const [localName, setLocalName] = useState(name);
  const nameTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value.toUpperCase();
      setLocalName(val);
      if (nameTimerRef.current) clearTimeout(nameTimerRef.current);
      nameTimerRef.current = setTimeout(() => setFilter('name', val), 300);
    },
    [setFilter],
  );

  return (
    <div className="absolute top-0 left-0 right-0 min-h-12 tech-panel z-10 flex items-center px-4 py-2 justify-between shrink-0 font-mono !border-t-0 !border-l-0 !border-r-0 shadow-[0_15px_30px_rgba(0,0,0,0.8)] flex-wrap gap-3">
      <div className="flex items-center h-full gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-intel-text opacity-50 uppercase tracking-widest font-bold">Stats</span>
          <Stat label="TOTAL" value={totalCount} color="text-white" />
          <Stat label="SHOWN" value={filteredCount} color="text-intel-accent" />
          <Stat label="MOORED" value={mooredCount} color="text-yellow-300" />
          <Stat label="NODES" value={activeMaritimeNodeIds.length} color="text-white" />
          <Stat label="PORTS" value={portCount} color="text-yellow-300" />
          <Stat label="INSTALLATIONS" value={installationCount} color="text-red-300" />
        </div>

        <div className="h-4 w-px bg-white/10" />

        <div className="flex items-center gap-4 h-full flex-wrap">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] text-intel-text uppercase tracking-widest font-bold">NAME</span>
            <input
              type="text"
              value={localName}
              onChange={handleNameChange}
              className="bg-black/60 border border-white/10 text-intel-text-light text-xs px-2 py-1 w-24 focus:outline-none focus:border-intel-accent focus:shadow-[0_0_10px_rgba(0,229,255,0.3)] transition-all"
              placeholder="ANY"
            />
          </div>

          <Toggle label="UNDERWAY" checked={showUnderway} onChange={(checked) => setFilter('showUnderway', checked)} />
          <Toggle label="MOORED" checked={showMoored} onChange={(checked) => setFilter('showMoored', checked)} />
          <Toggle label="PORTS" checked={showPorts} onChange={setShowPorts} />
          <Toggle label="INSTALLATIONS" checked={showInstallations} onChange={setShowInstallations} />
          <Toggle label="NODES" checked={showMaritimeNodes} onChange={setShowMaritimeNodes} />

          <div className="flex items-center gap-1 border border-cyan-400/20 bg-cyan-400/5 px-2 py-1 text-[10px] font-mono uppercase tracking-[0.12em] text-cyan-200/80">
            <span>ACTIVE NODES: <span className="text-white">{activeMaritimeNodeIds.length}</span></span>
            <button type="button" onClick={activateAllMaritimeNodes} className="ml-2 border border-white/15 px-1.5 py-0.5 text-[9px] text-white/70 hover:border-white/45 hover:text-white transition-colors">ALL</button>
            <button type="button" onClick={clearMaritimeNodes} className="border border-white/15 px-1.5 py-0.5 text-[9px] text-white/70 hover:border-white/45 hover:text-white transition-colors">NONE</button>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-[10px] text-intel-text uppercase tracking-widest font-bold">MIN SPD (KT)</span>
            <input
              type="range"
              min="0"
              max="50"
              value={speedMin}
              onChange={(e) => setFilter('speedMin', parseInt(e.target.value))}
              className="w-24 accent-intel-accent"
            />
            <span className="text-[10px] text-intel-accent w-6 tabular-nums text-right">{speedMin}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const Toggle: React.FC<{ label: string; checked: boolean; onChange: (checked: boolean) => void }> = ({ label, checked, onChange }) => (
  <label className="flex items-center space-x-2">
    <span className="text-[10px] text-intel-text uppercase tracking-widest font-bold">{label}</span>
    <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="accent-intel-accent cursor-pointer" />
  </label>
);

const Stat: React.FC<{ label: string; value: number; color: string }> = ({ label, value, color }) => (
  <span className="text-white/70 text-xs">
    {label} <strong className={`${color} ml-1`}>{value.toLocaleString()}</strong>
  </span>
);
