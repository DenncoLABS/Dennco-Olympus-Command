import React from 'react';
import { getTileRegistryItem } from './tileRegistry';
import { TileRuntimeCard } from './TileRuntimeCard';

type TileQuadPreviewProps = {
  groupId?: string;
};

export const TileQuadPreview: React.FC<TileQuadPreviewProps> = ({ groupId = 'intelmaps-quad' }) => {
  const group = getTileRegistryItem(groupId);
  const children = group?.children || [];

  return (
    <section className="rounded-2xl border border-cyan-300/20 bg-slate-950/70 p-3">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-[0.18em] text-cyan-300">Tile Group</div>
          <div className="text-sm font-bold uppercase tracking-[0.12em] text-white">{group?.label || 'Intel Maps Quad'}</div>
        </div>
        <span className="rounded border border-white/10 px-2 py-1 text-[9px] uppercase tracking-[0.12em] text-white/45">quad</span>
      </div>
      <div className="grid min-h-[360px] grid-cols-2 grid-rows-2 gap-2">
        {children.map((tileId) => <TileRuntimeCard key={tileId} tileId={tileId} />)}
      </div>
    </section>
  );
};
