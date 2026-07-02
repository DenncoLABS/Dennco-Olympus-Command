import React from 'react';
import { getTileRegistryItem } from './tileRegistry';

type TileRuntimeCardProps = {
  tileId: string;
  selected?: boolean;
  onSelect?: () => void;
};

export const TileRuntimeCard: React.FC<TileRuntimeCardProps> = ({ tileId, selected = false, onSelect }) => {
  const tile = getTileRegistryItem(tileId);
  if (!tile) return <div className="rounded border border-red-400/30 bg-red-500/10 p-3 text-xs text-red-100">Unknown Tile: {tileId}</div>;

  return (
    <article
      onClick={onSelect}
      className={`group flex min-h-[160px] flex-col overflow-hidden rounded-xl border bg-black/55 p-3 transition-all duration-200 ${selected ? 'border-cyan-300/70 shadow-[0_0_18px_rgba(34,211,238,0.22)]' : 'border-white/10 hover:border-cyan-300/45'}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-[9px] uppercase tracking-[0.16em] text-cyan-300">Tile Runtime</div>
          <div className="text-sm font-bold uppercase tracking-[0.12em] text-white">{tile.label}</div>
        </div>
        <span className="rounded border border-white/10 px-2 py-0.5 text-[9px] uppercase tracking-[0.12em] text-white/35">{tile.layout}</span>
      </div>
      <div className="relative mt-3 flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.14),transparent_44%),linear-gradient(135deg,rgba(255,255,255,0.04),transparent)] text-center">
        <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.08)_1px,transparent_1px)] [background-size:24px_24px]" />
        <div className="relative px-4">
          <div className="text-[10px] uppercase tracking-[0.18em] text-white/70">Embeddable App Tile</div>
          <p className="mt-2 max-w-xs text-xs leading-5 text-white/45">{tile.description}</p>
        </div>
      </div>
    </article>
  );
};
