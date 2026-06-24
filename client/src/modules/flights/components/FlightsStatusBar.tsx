import React from 'react';
import { formatTime } from '../../../utils/time';

interface Props {
  lastUpdated: number;
  isError: boolean;
  provider: string;
}

function flightLinkHealth(provider: string, isError: boolean) {
  const providerLower = provider.toLowerCase();

  if (isError) {
    return {
      label: 'SYS_FAULT',
      className: 'bg-red-500/20 text-red-400 border border-red-500/30',
      detail: 'Flight provider route returned an error.',
    };
  }

  if (providerLower.includes('no-active-radar')) {
    return {
      label: 'NO_ACTIVE_RADAR',
      className: 'bg-red-500/20 text-red-400 border border-red-500/30',
      detail: 'No flight radar region is active. Select one or more radar nodes.',
    };
  }

  if (providerLower.includes('last-good')) {
    return {
      label: 'LAST_GOOD',
      className: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
      detail: 'Showing cached last-good flight data while live radar refresh stabilizes.',
    };
  }

  return {
    label: 'SECURE_ACTIVE',
    className: 'bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/30',
    detail: 'Flight data link is active.',
  };
}

export const FlightsStatusBar: React.FC<Props> = ({ lastUpdated, isError, provider }) => {
  const health = flightLinkHealth(provider, isError);

  return (
    <div className="absolute bottom-0 left-0 right-0 h-8 tech-panel flex items-center justify-between px-4 z-20 text-[10px] uppercase font-bold tracking-widest text-intel-text !border-b-0 !border-l-0 !border-r-0 shadow-[0_-5px_15px_rgba(0,0,0,0.5)] bg-black/80">
      <div className="flex items-center gap-6 font-mono">
        <span>
          DATA LINK: <span className="text-intel-text-light">{provider}</span>
        </span>
        <span title={health.detail} className={`px-1.5 py-0.5 rounded ${health.className}`}>
          {health.label}
        </span>
      </div>
      <div>LAST REFRESH: {lastUpdated ? formatTime(lastUpdated / 1000) : '--:--:--'}</div>
    </div>
  );
};
