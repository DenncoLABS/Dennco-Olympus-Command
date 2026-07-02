import React from 'react';
import { useTileSpaceStore } from './tileSpace.store';

export const TileSpace: React.FC = () => {
  const focusPages = useTileSpaceStore((state) => state.focusPages);
  const activeFocusPageId = useTileSpaceStore((state) => state.activeFocusPageId);
  const tiles = useTileSpaceStore((state) => state.tiles);
  const groups = useTileSpaceStore((state) => state.groups);
  const closeTile = useTileSpaceStore((state) => state.closeTile);
  const selectTile = useTileSpaceStore((state) => state.selectTile);
  const selectedTileId = useTileSpaceStore((state) => state.selectedTileId);
  const activeFocus = focusPages.find((page) => page.id === activeFocusPageId) || focusPages[0];
  if (!activeFocus) return null;

  const activeTiles = tiles.filter((tile) => tile.focusPageId === activeFocus.id && tile.state !== 'closed');
  const activeGroups = groups.filter((group) => group.focusPageId === activeFocus.id);
  const ungroupedTiles = activeTiles.filter((tile) => !tile.groupId);

  return (
    <div className="pointer-events-none absolute inset-3 z-[3100] flex flex-col gap-3 font-mono">
      <div className="pointer-events-auto flex items-center justify-between rounded-2xl border border-cyan-300/20 bg-black/55 px-4 py-2 text-[10px] uppercase tracking-[0.16em] text-white/55 backdrop-blur">
        <div>
          <div className="text-cyan-300">TileSpace</div>
          <div className="mt-0.5 text-[9px] text-white/35">Focus · {activeFocus.name}</div>
        </div>
        <div className="flex items-center gap-3 text-[9px]"><span>{activeTiles.length} tiles</span><span>{activeGroups.length} groups</span></div>
      </div>
      <div className="pointer-events-auto min-h-0 flex-1 overflow-hidden rounded-2xl border border-cyan-300/20 bg-black/20 p-3 backdrop-blur-sm">
        {activeTiles.length === 0 ? (
          <div className="flex h-full items-center justify-center text-center text-white/45">
            <div className="max-w-lg rounded-2xl border border-dashed border-cyan-300/25 bg-black/35 p-6">
              <div className="text-[10px] uppercase tracking-[0.22em] text-cyan-300">Empty Focus Page</div>
              <div className="mt-3 text-2xl font-bold uppercase tracking-[0.14em] text-white/80">Deploy tiles from the Desk</div>
              <p className="mt-3 text-sm leading-6 text-white/45">Open an app from the Dock, then use its Desk surface to add tiles or widgets into TileSpace.</p>
            </div>
          </div>
        ) : (
          <div className="grid h-full auto-rows-fr gap-3 lg:grid-cols-2 xl:grid-cols-3">
            {activeGroups.map((group) => (
              <section key={group.id} className="min-h-[280px] rounded-2xl border border-cyan-300/25 bg-slate-950/75 p-3">
                <div className="mb-3 flex items-center justify-between"><div><div className="text-[10px] uppercase tracking-[0.18em] text-cyan-300">App Group</div><div className="text-sm font-bold uppercase tracking-[0.12em] text-white">{group.title}</div></div><span className="rounded border border-white/10 px-2 py-1 text-[9px] uppercase tracking-[0.12em] text-white/45">{group.layout}</span></div>
                <div className="grid h-[calc(100%-46px)] grid-cols-2 grid-rows-2 gap-2">
                  {activeTiles.filter((tile) => tile.groupId === group.id).map((tile) => <TileCard key={tile.id} tile={tile} selected={selectedTileId === tile.id} onSelect={() => selectTile(tile.id)} onClose={() => closeTile(tile.id)} />)}
                </div>
              </section>
            ))}
            {ungroupedTiles.map((tile) => <TileCard key={tile.id} tile={tile} selected={selectedTileId === tile.id} onSelect={() => selectTile(tile.id)} onClose={() => closeTile(tile.id)} />)}
          </div>
        )}
      </div>
    </div>
  );
};

function TileCard({ tile, selected, onSelect, onClose }: { tile: { id: string; title: string; appId: string; subAppId?: string; scope: string; state: string; lockMode: string }; selected: boolean; onSelect: () => void; onClose: () => void }) {
  return (
    <article onClick={onSelect} className={`group flex min-h-[120px] flex-col rounded-xl border bg-black/45 p-3 transition-all duration-200 ${selected ? 'border-cyan-300/70 shadow-[0_0_18px_rgba(34,211,238,0.25)]' : 'border-white/10 hover:border-cyan-300/45'}`}>
      <div className="flex items-start justify-between gap-2"><div><div className="text-[9px] uppercase tracking-[0.16em] text-cyan-300">{tile.scope}</div><div className="text-sm font-bold uppercase tracking-[0.12em] text-white">{tile.title}</div></div><button type="button" onClick={(event) => { event.stopPropagation(); onClose(); }} className="rounded border border-white/10 px-2 py-0.5 text-[9px] uppercase tracking-[0.12em] text-white/35 opacity-0 transition group-hover:opacity-100 hover:border-cyan-300/50 hover:text-cyan-200">Close</button></div>
      <div className="mt-auto grid grid-cols-2 gap-2 pt-3 text-[9px] uppercase tracking-[0.12em] text-white/40"><span className="rounded border border-white/10 px-2 py-1">{tile.appId}</span><span className="rounded border border-white/10 px-2 py-1">{tile.state}</span>{tile.subAppId && <span className="rounded border border-white/10 px-2 py-1">{tile.subAppId}</span>}<span className="rounded border border-white/10 px-2 py-1">{tile.lockMode}</span></div>
    </article>
  );
}
