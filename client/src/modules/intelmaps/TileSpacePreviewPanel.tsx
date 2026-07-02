import React, { useEffect, useMemo, useState } from 'react';
import {
  TILESPACE_PREVIEW_QUAD_KEY,
  TILESPACE_PREVIEW_SELECTED_TILE_KEY,
  TileRuntimeCard,
  getTileRegistryItem,
  readTileSpacePreviewBoolean,
  readTileSpacePreviewString,
  writeTileSpacePreviewBoolean,
  writeTileSpacePreviewString,
} from '../../ui/tiles';

const QUAD_TILE_IDS = ['intelmaps-flight', 'intelmaps-maritime', 'intelmaps-dot', 'intelmaps-monitor'];

export const TileSpacePreviewPanel: React.FC = () => {
  const [selectedTileId, setSelectedTileId] = useState(() => readTileSpacePreviewString(TILESPACE_PREVIEW_SELECTED_TILE_KEY, 'intelmaps-flight'));
  const [quadDeployed, setQuadDeployed] = useState(() => readTileSpacePreviewBoolean(TILESPACE_PREVIEW_QUAD_KEY, true));
  const selectedTile = useMemo(() => getTileRegistryItem(selectedTileId), [selectedTileId]);

  useEffect(() => {
    writeTileSpacePreviewString(TILESPACE_PREVIEW_SELECTED_TILE_KEY, selectedTileId);
  }, [selectedTileId]);

  useEffect(() => {
    writeTileSpacePreviewBoolean(TILESPACE_PREVIEW_QUAD_KEY, quadDeployed);
  }, [quadDeployed]);

  return (
    <section className="grid h-full min-h-0 grid-rows-[auto_auto_1fr] gap-3 rounded border border-cyan-300/20 bg-black/55 p-3 text-white">
      <header className="flex items-center justify-between gap-3 rounded border border-cyan-300/20 bg-cyan-300/10 px-3 py-2">
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-[0.22em] text-cyan-300">TileSpace MVP</div>
          <h2 className="mt-1 truncate text-lg font-bold uppercase tracking-[0.16em] text-white">Intel Maps Quad</h2>
        </div>
        <div className="flex shrink-0 items-center gap-2 text-[9px] uppercase tracking-[0.14em] text-white/50">
          <span className="rounded border border-emerald-300/30 px-2 py-1 text-emerald-200">● Active</span>
          <span className="rounded border border-white/10 px-2 py-1">Tiles: {quadDeployed ? 4 : 0}</span>
          <span className="rounded border border-white/10 px-2 py-1">Focus: Operations</span>
          <button type="button" onClick={() => setQuadDeployed((value) => !value)} className="rounded border border-cyan-300/30 px-3 py-1 text-cyan-100 hover:bg-cyan-300/10">
            {quadDeployed ? 'Clear Quad' : 'Deploy Quad'}
          </button>
        </div>
      </header>

      <div className="grid grid-cols-[1fr_260px] gap-3 text-xs">
        <div className="rounded border border-white/10 bg-black/35 p-3">
          <div className="text-[10px] uppercase tracking-[0.18em] text-cyan-300">Selected Tile</div>
          <div className="mt-1 text-sm font-bold uppercase tracking-[0.12em] text-white">{selectedTile?.label || 'None'}</div>
          <p className="mt-2 text-white/45">{selectedTile?.description || 'Select a tile from the quad.'}</p>
        </div>
        <div className="rounded border border-white/10 bg-black/35 p-3">
          <div className="text-[10px] uppercase tracking-[0.18em] text-cyan-300">Focus Page</div>
          <div className="mt-1 text-sm font-bold uppercase tracking-[0.12em] text-white">Operations</div>
          <p className="mt-2 text-white/45">Selected tile and quad state now survive reloads and app switching.</p>
        </div>
      </div>

      {quadDeployed ? (
        <div className="grid min-h-0 grid-cols-2 grid-rows-2 gap-2 overflow-hidden">
          {QUAD_TILE_IDS.map((tileId) => (
            <TileRuntimeCard key={tileId} tileId={tileId} selected={selectedTileId === tileId} onSelect={() => setSelectedTileId(tileId)} />
          ))}
        </div>
      ) : (
        <div className="flex min-h-0 items-center justify-center rounded border border-dashed border-cyan-300/25 bg-black/35 text-center">
          <div>
            <div className="text-[10px] uppercase tracking-[0.24em] text-cyan-300">TileSpace Empty</div>
            <div className="mt-2 text-lg uppercase tracking-[0.16em] text-white/55">Click Deploy Quad</div>
          </div>
        </div>
      )}
    </section>
  );
};
