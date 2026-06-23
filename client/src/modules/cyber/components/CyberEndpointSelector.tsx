import React from 'react';
import { useCyberStore } from '../cyber.store';
import { CYBER_CONFIG, getCategoryDef } from '../config';

export const CyberEndpointSelector: React.FC = () => {
  const activeCategory = useCyberStore((s) => s.activeCategory);
  const activeEndpoint = useCyberStore((s) => s.activeEndpoint);
  const setActiveEndpoint = useCyberStore((s) => s.setActiveEndpoint);
  const timeRange = useCyberStore((s) => s.timeRange);
  const setTimeRange = useCyberStore((s) => s.setTimeRange);

  const catDef = getCategoryDef(activeCategory);
  const color = catDef?.color ?? '#00e5ff';
  const categoryDef = CYBER_CONFIG.find((c) => c.id === activeCategory);
  const timeRanges = [
    { label: '24H', value: '1d' },
    { label: '7D', value: '7d' },
    { label: '30D', value: '30d' },
  ];

  if (!categoryDef) return null;

  return (
    <div
      className="flex justify-between items-center w-full backdrop-blur-md border px-4 py-2 rounded"
      style={{ background: `${color}0a`, borderColor: `${color}33` }}
    >
      <div className="flex flex-wrap gap-2">
        {categoryDef.endpoints.map((ep) => {
          const isActive = activeEndpoint === ep.path;
          return (
            <button
              key={ep.path}
              onClick={() => setActiveEndpoint(ep.path)}
              className="px-3 py-1 font-mono text-xs transition-all rounded border"
              style={
                isActive
                  ? { background: color, color: '#000', borderColor: color, fontWeight: 700 }
                  : { background: 'transparent', color: color, borderColor: `${color}55` }
              }
            >
              {ep.name}
            </button>
          );
        })}
      </div>

      <div
        className="flex items-center gap-1 ml-4 pl-4 h-8 border-l"
        style={{ borderColor: `${color}33` }}
      >
        <span className="text-intel-text-light/40 font-mono text-[10px] mr-2 uppercase tracking-widest">
          Range
        </span>
        {timeRanges.map((tr) => (
          <button
            key={tr.value}
            onClick={() => setTimeRange(tr.value)}
            className="px-2 py-0.5 font-mono text-[10px] rounded transition-all"
            style={
              timeRange === tr.value
                ? { background: `${color}30`, color, border: `1px solid ${color}` }
                : { color: '#ffffff40', border: '1px solid transparent' }
            }
          >
            {tr.label}
          </button>
        ))}
      </div>
    </div>
  );
};
