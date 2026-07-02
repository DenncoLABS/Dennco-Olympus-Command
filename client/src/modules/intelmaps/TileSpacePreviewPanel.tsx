import React from 'react';
import { TileRuntimeCard } from '../../ui/tiles';

export const TileSpacePreviewPanel: React.FC = () => {
  return (
    <section className="grid h-full min-h-0 grid-rows-[auto_1fr] gap-3 rounded border border-cyan-300/20 bg-black/55 p-3 text-white">
      <header className="rounded border border-cyan-300/20 bg-cyan-300/10 p-3">
        <div className="text-[10px] uppercase tracking-[0.22em] text-cyan-300">TileSpace MVP Preview</div>
        <h2 className="mt-2 text-xl font-bold uppercase tracking-[0.16em] text-white">Intel Maps Quad</h2>
        <p className="mt-2 max-w-3xl text-xs leading-5 text-white/50">Safe embeddable tile preview. Dock behavior is untouched. Full-screen map pages are not mounted inside tiles.</p>
      </header>
      <div className="grid min-h-0 grid-cols-2 grid-rows-2 gap-2 overflow-hidden">
        <TileRuntimeCard tileId="intelmaps-flight" />
        <TileRuntimeCard tileId="intelmaps-maritime" />
        <TileRuntimeCard tileId="intelmaps-dot" />
        <TileRuntimeCard tileId="intelmaps-monitor" />
      </div>
    </section>
  );
};
