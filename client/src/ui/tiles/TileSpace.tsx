import React from 'react';
import { useTileSpaceStore, type TileInstance, type WidgetInstance } from './tileSpace.store';

const scopeLabel: Record<string, string> = { system: 'System', app: 'App', 'app-group': 'App Group', 'sub-app': 'Sub-App', tile: 'Tile Local' };

export const TileSpace: React.FC = () => {
  const focusPages = useTileSpaceStore((state) => state.focusPages);
  const activeFocusPageId = useTileSpaceStore((state) => state.activeFocusPageId);
  const tiles = useTileSpaceStore((state) => state.tiles);
  const groups = useTileSpaceStore((state) => state.groups);
  const widgets = useTileSpaceStore((state) => state.widgets);
  const closeTile = useTileSpaceStore((state) => state.closeTile);
  const selectTile = useTileSpaceStore((state) => state.selectTile);
  const selectedTileId = useTileSpaceStore((state) => state.selectedTileId);
  const saveFocusLayout = useTileSpaceStore((state) => state.saveFocusLayout);
  const duplicateFocusLayout = useTileSpaceStore((state) => state.duplicateFocusLayout);
  const resetFocusLayout = useTileSpaceStore((state) => state.resetFocusLayout);

  const orderedFocusPages = [...focusPages].filter((page) => !page.archived).sort((a, b) => a.order - b.order);
  const activeFocus = orderedFocusPages.find((page) => page.id === activeFocusPageId) || orderedFocusPages[0];
  if (!activeFocus) return null;

  const activeTiles = tiles.filter((tile) => tile.focusPageId === activeFocus.id && tile.state !== 'closed' && tile.state !== 'archived');
  const activeGroups = groups.filter((group) => group.focusPageId === activeFocus.id && group.tileIds.some((tileId) => activeTiles.some((tile) => tile.id === tileId)));
  const activeWidgets = widgets.filter((widget) => widget.focusPageId === activeFocus.id && widget.state !== 'archived');
  const groupedTileIds = new Set(activeGroups.flatMap((group) => group.tileIds));
  const ungroupedTiles = activeTiles.filter((tile) => !tile.groupId || !groupedTileIds.has(tile.id));

  return (
    <div className="pointer-events-none absolute inset-3 z-[3100] flex flex-col gap-3 font-mono">
      <div className="pointer-events-auto flex items-center justify-between rounded-2xl border border-cyan-300/20 bg-black/55 px-4 py-2 text-[10px] uppercase tracking-[0.16em] text-white/55 backdrop-blur transition-all duration-200">
        <div><div className="text-cyan-300">TileSpace</div><div className="mt-0.5 text-[9px] text-white/35">Focus Page · {activeFocus.name}</div></div>
        <div className="flex flex-wrap items-center justify-end gap-2 text-[9px]"><span className="rounded border border-white/10 px-2 py-1">{activeTiles.length} tiles</span><span className="rounded border border-white/10 px-2 py-1">{activeGroups.length} groups</span><span className="rounded border border-white/10 px-2 py-1">{activeWidgets.length} widgets</span><button type="button" onClick={() => saveFocusLayout(activeFocus.name)} className="rounded border border-cyan-300/25 px-2 py-1 text-cyan-200 hover:bg-cyan-300/10">Save Layout</button><button type="button" onClick={() => duplicateFocusLayout()} className="rounded border border-white/10 px-2 py-1 text-white/55 hover:border-cyan-300/40 hover:text-cyan-200">Duplicate</button><button type="button" onClick={() => resetFocusLayout(activeFocus.id)} className="rounded border border-white/10 px-2 py-1 text-white/45 hover:border-amber-300/40 hover:text-amber-200">Reset</button></div>
      </div>
      <div className="pointer-events-auto min-h-0 flex-1 overflow-hidden rounded-2xl border border-cyan-300/20 bg-black/20 p-3 backdrop-blur-sm transition-all duration-200">
        {activeTiles.length === 0 && activeWidgets.length === 0 ? (
          <div className="flex h-full items-center justify-center text-center text-white/45"><div className="max-w-lg rounded-2xl border border-dashed border-cyan-300/25 bg-black/35 p-6"><div className="text-[10px] uppercase tracking-[0.22em] text-cyan-300">Empty Focus Page</div><div className="mt-3 text-2xl font-bold uppercase tracking-[0.14em] text-white/80">Deploy tiles from the Desk</div><p className="mt-3 text-sm leading-6 text-white/45">Open an app from the Dock, then use its Desk surface to add app tiles, tile groups, or widgets into TileSpace.</p></div></div>
        ) : (
          <div className="grid h-full auto-rows-fr gap-3 lg:grid-cols-2 xl:grid-cols-3">
            {activeGroups.map((group) => {
              const groupTiles = activeTiles.filter((tile) => tile.groupId === group.id);
              const groupWidgets = activeWidgets.filter((widget) => widget.groupId === group.id);
              return <section key={group.id} className="flex min-h-[280px] flex-col rounded-2xl border border-cyan-300/25 bg-slate-950/75 p-3 transition-all duration-200"><div className="mb-3 flex items-center justify-between gap-3"><div><div className="text-[10px] uppercase tracking-[0.18em] text-cyan-300">Tile Group</div><div className="text-sm font-bold uppercase tracking-[0.12em] text-white">{group.title}</div></div><span className="rounded border border-white/10 px-2 py-1 text-[9px] uppercase tracking-[0.12em] text-white/45">{group.layout}</span></div><div className="grid min-h-0 flex-1 grid-cols-2 grid-rows-2 gap-2">{groupTiles.map((tile) => <TileCard key={tile.id} tile={tile} selected={selectedTileId === tile.id} onSelect={() => selectTile(tile.id)} onClose={() => closeTile(tile.id)} />)}</div>{groupWidgets.length > 0 && <WidgetStrip widgets={groupWidgets} />}</section>;
            })}
            {ungroupedTiles.map((tile) => <TileCard key={tile.id} tile={tile} selected={selectedTileId === tile.id} onSelect={() => selectTile(tile.id)} onClose={() => closeTile(tile.id)} />)}
            {activeWidgets.filter((widget) => !widget.groupId && !widget.parentTileId).map((widget) => <WidgetCard key={widget.id} widget={widget} />)}
          </div>
        )}
      </div>
    </div>
  );
};

function TileCard({ tile, selected, onSelect, onClose }: { tile: TileInstance; selected: boolean; onSelect: () => void; onClose: () => void }) {
  return <article onClick={onSelect} className={`group flex min-h-[120px] flex-col rounded-xl border bg-black/45 p-3 transition-all duration-200 ${selected ? 'border-cyan-300/70 shadow-[0_0_18px_rgba(34,211,238,0.25)]' : 'border-white/10 hover:border-cyan-300/45'}`}><div className="flex items-start justify-between gap-2"><div><div className="text-[9px] uppercase tracking-[0.16em] text-cyan-300">{scopeLabel[tile.scope] || tile.scope}</div><div className="text-sm font-bold uppercase tracking-[0.12em] text-white">{tile.title}</div></div><button type="button" onClick={(event) => { event.stopPropagation(); onClose(); }} className="rounded border border-white/10 px-2 py-0.5 text-[9px] uppercase tracking-[0.12em] text-white/35 opacity-0 transition group-hover:opacity-100 hover:border-cyan-300/50 hover:text-cyan-200">Close Tile</button></div><div className="mt-auto grid grid-cols-2 gap-2 pt-3 text-[9px] uppercase tracking-[0.12em] text-white/40"><span className="rounded border border-white/10 px-2 py-1">App · {tile.appId}</span><span className="rounded border border-white/10 px-2 py-1">State · {tile.state}</span>{tile.subAppId && <span className="rounded border border-white/10 px-2 py-1">Sub-App · {tile.subAppId}</span>}<span className="rounded border border-white/10 px-2 py-1">{tile.lockMode}</span></div></article>;
}

function WidgetStrip({ widgets }: { widgets: WidgetInstance[] }) {
  return <div className="mt-2 flex flex-wrap gap-2">{widgets.map((widget) => <span key={widget.id} className="rounded border border-fuchsia-300/20 bg-fuchsia-300/10 px-2 py-1 text-[9px] uppercase tracking-[0.12em] text-fuchsia-100/80">{widget.title}</span>)}</div>;
}

function WidgetCard({ widget }: { widget: WidgetInstance }) {
  return <article className="flex min-h-[120px] flex-col rounded-xl border border-fuchsia-300/25 bg-fuchsia-950/30 p-3 transition-all duration-200 hover:border-fuchsia-300/45"><div className="text-[9px] uppercase tracking-[0.16em] text-fuchsia-200">Widget · {scopeLabel[widget.scope] || widget.scope}</div><div className="mt-1 text-sm font-bold uppercase tracking-[0.12em] text-white">{widget.title}</div><div className="mt-auto grid grid-cols-2 gap-2 pt-3 text-[9px] uppercase tracking-[0.12em] text-white/40"><span className="rounded border border-white/10 px-2 py-1">App · {widget.appId}</span><span className="rounded border border-white/10 px-2 py-1">{widget.state}</span>{widget.subAppId && <span className="rounded border border-white/10 px-2 py-1">Sub-App · {widget.subAppId}</span>}</div></article>;
}
