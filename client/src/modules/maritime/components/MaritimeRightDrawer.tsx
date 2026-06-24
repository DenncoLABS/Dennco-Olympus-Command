import React, { useEffect, useRef, useState } from 'react';
import { Target, Share2, AlertTriangle, Info, Folder, Radio } from 'lucide-react';
import type { VesselState } from '../hooks/useMaritimeSnapshot';

interface MaritimeRightDrawerProps {
  vessel: VesselState | null;
  onClose: () => void;
}

function toDMS(coordinate: number, pos: string, neg: string): string {
  const absolute = Math.abs(coordinate);
  const degrees = Math.floor(absolute);
  const minutesNotTruncated = (absolute - degrees) * 60;
  const minutes = Math.floor(minutesNotTruncated);
  const seconds = Math.floor((minutesNotTruncated - minutes) * 60);
  const direction = coordinate >= 0 ? pos : neg;
  return `${degrees}°${minutes}'${seconds}"${direction}`;
}

const getNavStatusString = (status: number) => {
  switch (status) {
    case 0:
      return 'UNDER WAY USING ENGINE';
    case 1:
      return 'AT ANCHOR';
    case 2:
      return 'NOT UNDER COMMAND';
    case 3:
      return 'RESTRICTED MANOEUVRABILITY';
    case 4:
      return 'CONSTRAINED BY DRAUGHT';
    case 5:
      return 'MOORED';
    case 6:
      return 'AGROUND';
    case 7:
      return 'ENGAGED IN FISHING';
    case 8:
      return 'UNDER WAY SAILING';
    case 14:
      return 'AIS-SART / DISTRESS BEACON';
    default:
      return 'NOT DEFINED';
  }
};

const getShipTypeString = (type: number) => {
  if (type >= 20 && type <= 29) return 'WING IN GROUND';
  if (type === 30) return 'FISHING';
  if (type >= 31 && type <= 32) return 'TOWING';
  if (type === 33) return 'DREDGING';
  if (type === 34) return 'DIVING';
  if (type === 35) return 'MILITARY';
  if (type === 36) return 'SAILING';
  if (type === 37) return 'PLEASURE CRAFT';
  if (type >= 40 && type <= 49) return 'HIGH SPEED CRAFT';
  if (type === 50) return 'PILOT VESSEL';
  if (type === 51) return 'SEARCH AND RESCUE';
  if (type === 52) return 'TUG';
  if (type === 53) return 'PORT TENDER';
  if (type === 54) return 'ANTI-POLLUTION';
  if (type === 55) return 'LAW ENFORCEMENT';
  if (type === 58) return 'MEDICAL';
  if (type >= 60 && type <= 69) return 'PASSENGER';
  if (type >= 70 && type <= 79) return 'CARGO';
  if (type >= 80 && type <= 89) return 'TANKER';
  return 'UNKNOWN/OTHER';
};

function vesselFolder(vessel: VesselState): string {
  const safeName = (vessel.name || 'UNKNOWN').replace(/[^A-Z0-9]+/gi, '_').replace(/^_+|_+$/g, '').toUpperCase();
  return `/data/maritime/vessels/${vessel.mmsi}_${safeName}`;
}

function hasMaydaySignal(vessel: VesselState): boolean {
  const text = `${vessel.textMessage || ''} ${vessel.destination || ''} ${vessel.name || ''}`.toUpperCase();
  return text.includes('MAYDAY') || text.includes('PAN PAN') || text.includes('DISTRESS') || vessel.navigationalStatus === 14;
}

export const MaritimeRightDrawer: React.FC<MaritimeRightDrawerProps> = ({ vessel, onClose }) => {
  const [ageSeconds, setAgeSeconds] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!vessel) return;
    const tick = () => setAgeSeconds(Math.floor((Date.now() - vessel.lastUpdate) / 1000));
    tick();
    intervalRef.current = setInterval(tick, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [vessel, vessel?.lastUpdate]);

  if (!vessel) return null;

  const latDMS = toDMS(vessel.lat, 'N', 'S');
  const lonDMS = toDMS(vessel.lon, 'E', 'W');
  const isMoored = vessel.navigationalStatus === 1 || vessel.navigationalStatus === 5;
  const isMayday = hasMaydaySignal(vessel);

  return (
    <div className="absolute top-12 right-0 bottom-8 w-96 tech-panel z-20 flex flex-col font-mono text-sm animate-in slide-in-from-right duration-300 !border-y-0 !border-r-0 !border-l-intel-accent/30 shadow-[-15px_0_30px_rgba(0,0,0,0.8)]">
      <div className="flex items-start justify-between p-4 tech-panel-header">
        <div>
          <div className="text-[10px] text-intel-accent mb-1 tracking-[0.2em] font-bold drop-shadow-[0_0_5px_var(--color-intel-accent)]">
            TARGET // MARITIME
          </div>
          <h2 className="text-2xl font-bold text-intel-text-light tracking-wider flex items-center drop-shadow-[0_0_8px_rgba(224,242,254,0.5)]">
            {vessel.name.toUpperCase()}
            {isMoored && <span className="ml-3 px-1.5 py-0.5 bg-[#f59e0b]/20 text-[#f59e0b] text-[10px] border border-[#f59e0b]/30">MOORED</span>}
            {isMayday && <span className="ml-3 px-1.5 py-0.5 bg-red-500/20 text-red-300 text-[10px] border border-red-500/40">MAYDAY</span>}
          </h2>
          <div className="text-intel-text text-xs mt-1 space-x-3 opacity-80">
            <span>MMSI: {vessel.mmsi}</span>
            {vessel.callsign && <span>CALLSIGN: {vessel.callsign}</span>}
            {vessel.type !== undefined && <span>TYPE: {getShipTypeString(vessel.type)}</span>}
          </div>
        </div>

        <button onClick={onClose} className="text-intel-accent hover:text-intel-text-light hover:drop-shadow-[0_0_8px_var(--color-intel-accent)] transition-all font-mono mt-1">
          [X]
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-6">
        <div className="space-y-3 relative">
          <div className="absolute -left-5 top-0 bottom-0 w-1 bg-intel-accent/30" />
          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            <div>
              <div className="text-[10px] text-intel-text uppercase tracking-widest mb-1 flex items-center"><Target size={10} className="mr-1.5" /> LATITUDE</div>
              <div className="text-base font-medium text-white font-mono">{latDMS}</div>
              <div className="text-xs text-intel-text/60 mt-0.5">{vessel.lat.toFixed(6)}°</div>
            </div>
            <div>
              <div className="text-[10px] text-intel-text uppercase tracking-widest mb-1 flex items-center"><Target size={10} className="mr-1.5" /> LONGITUDE</div>
              <div className="text-base font-medium text-white font-mono">{lonDMS}</div>
              <div className="text-xs text-intel-text/60 mt-0.5">{vessel.lon.toFixed(6)}°</div>
            </div>
            <div>
              <div className="text-[10px] text-intel-text uppercase tracking-widest mb-1">SPEED OVER GROUND</div>
              <div className="text-lg font-medium text-intel-accent tabular-nums">{vessel.sog.toFixed(1)} <span className="text-xs text-intel-text font-normal">kn</span></div>
            </div>
            <div>
              <div className="text-[10px] text-intel-text uppercase tracking-widest mb-1">COURSE</div>
              <div className="text-lg font-medium text-white tabular-nums">{Number(vessel.cog).toFixed(1)}°</div>
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-white/10">
          <div className="text-[10px] text-intel-accent uppercase tracking-widest font-bold border-b border-intel-accent/30 pb-2 flex items-center"><Folder size={12} className="mr-2" /> DATA FOLDER</div>
          <div className="bg-black/30 border border-white/10 rounded p-3 text-xs text-white break-all">{vesselFolder(vessel)}</div>
        </div>

        <div className="space-y-4 pt-4 border-t border-white/10">
          <div className="text-[10px] text-intel-accent uppercase tracking-widest font-bold border-b border-intel-accent/30 pb-2 flex items-center"><Info size={12} className="mr-2" /> STATUS INFO</div>
          <ul className="space-y-3 text-sm">
            <li className="flex flex-col"><span className="text-[10px] text-intel-text uppercase tracking-wider mb-0.5">NAVIGATIONAL STATUS</span><span className="text-white font-medium">{getNavStatusString(vessel.navigationalStatus)}</span></li>
            <li className="flex flex-col"><span className="text-[10px] text-intel-text uppercase tracking-wider mb-0.5">LAST DATA UPDATE</span><span className={`text-white font-medium tabular-nums ${ageSeconds > 60 ? 'text-amber-400' : ''}`}>{ageSeconds}s ago</span></li>
            {vessel.destination && <li className="flex flex-col"><span className="text-[10px] text-intel-text uppercase tracking-wider mb-0.5">DESTINATION</span><span className="text-white font-medium break-all">{vessel.destination}</span></li>}
            {vessel.dimension && (vessel.dimension.a > 0 || vessel.dimension.b > 0) && <li className="flex flex-col"><span className="text-[10px] text-intel-text uppercase tracking-wider mb-0.5">DIMENSIONS (L x W)</span><span className="text-white font-medium">{vessel.dimension.a + vessel.dimension.b}m x {vessel.dimension.c + vessel.dimension.d}m</span></li>}
            {vessel.history && <li className="flex flex-col"><span className="text-[10px] text-intel-text uppercase tracking-wider mb-0.5">TRACK HISTORY</span><span className="text-white font-medium">{vessel.history.length} position{vessel.history.length !== 1 ? 's' : ''}</span></li>}
          </ul>
        </div>

        {isMayday && <div className="bg-red-500/10 border border-red-500/40 rounded p-3 text-xs text-red-100 flex items-start space-x-3 mt-4"><Radio size={14} className="text-red-300 mt-0.5 shrink-0" /><div><div className="font-bold text-red-200 mb-1">MAYDAY / DISTRESS INFORMATION</div><p>Record MMSI, vessel name, position, navigational status, broadcast text, and last update. Attempt VHF Channel 16 contact and notify responsible Coast Guard sector.</p></div></div>}
        {vessel.textMessage && <div className="bg-intel-accent/10 border border-intel-accent/30 rounded p-3 text-xs text-intel-text flex items-start space-x-3 mt-4"><Info size={14} className="text-intel-accent mt-0.5 shrink-0" /><p className="font-mono text-white break-all">BROADCAST: {vessel.textMessage}</p></div>}
        {ageSeconds > 120 && <div className="bg-amber-500/10 border border-amber-500/30 rounded p-3 text-xs text-amber-200/80 flex items-start space-x-3 mt-4"><AlertTriangle size={14} className="text-amber-500 mt-0.5 shrink-0" /><p>Positional data is stale. Vessel may have deviated from reported position.</p></div>}
      </div>

      <div className="p-4 bg-black/20 border-t border-white/5 flex gap-2">
        <button disabled className="flex-1 flex items-center justify-center space-x-2 py-2 bg-intel-accent/10 hover:bg-intel-accent/20 border border-intel-accent/50 text-intel-accent transition-colors opacity-50 cursor-not-allowed"><Share2 size={14} /><span className="text-xs tracking-wider">SHARE</span></button>
      </div>
    </div>
  );
};
