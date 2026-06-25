import React, { useEffect, useMemo, useState } from 'react';

const TILE_SCREEN_COUNT_KEY = 'olympus.tiles.screenCount';
const TILE_SCREEN_INDEX_KEY = 'olympus.tiles.activeIndex';
const MIN_TILE_SCREENS = 3;
const MAX_TILE_SCREENS = 18;

function readSavedNumber(key: string, fallback: number) {
  const raw = window.localStorage.getItem(key);
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export const TileScreens: React.FC = () => {
  const [screenCount, setScreenCount] = useState(() => clamp(readSavedNumber(TILE_SCREEN_COUNT_KEY, MIN_TILE_SCREENS), MIN_TILE_SCREENS, MAX_TILE_SCREENS));
  const [activeIndex, setActiveIndex] = useState(() => clamp(readSavedNumber(TILE_SCREEN_INDEX_KEY, 0), 0, Math.max(0, readSavedNumber(TILE_SCREEN_COUNT_KEY, MIN_TILE_SCREENS) - 1)));

  const screens = useMemo(() => Array.from({ length: screenCount }, (_, index) => index), [screenCount]);

  useEffect(() => {
    window.localStorage.setItem(TILE_SCREEN_COUNT_KEY, String(screenCount));
  }, [screenCount]);

  useEffect(() => {
    window.localStorage.setItem(TILE_SCREEN_INDEX_KEY, String(activeIndex));
  }, [activeIndex]);

  const goToTile = (index: number) => {
    setActiveIndex(clamp(index, 0, screenCount - 1));
  };

  const previousTile = () => {
    setActiveIndex((current) => clamp(current - 1, 0, screenCount - 1));
  };

  const nextTile = () => {
    setActiveIndex((current) => {
      if (current < screenCount - 1) return current + 1;
      if (screenCount < MAX_TILE_SCREENS) {
        setScreenCount((count) => count + 1);
        return current + 1;
      }
      return current;
    });
  };

  const addTile = () => {
    setScreenCount((count) => {
      const nextCount = clamp(count + 1, MIN_TILE_SCREENS, MAX_TILE_SCREENS);
      setActiveIndex(nextCount - 1);
      return nextCount;
    });
  };

  const handleWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    if (Math.abs(event.deltaX) < 18 && !event.shiftKey) return;
    if (event.deltaX > 0 || event.deltaY > 0) nextTile();
    else previousTile();
  };

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#020617] font-mono text-white" onWheel={handleWheel}>
      <div className="pointer-events-none absolute inset-0 opacity-30 bg-[radial-gradient(rgba(34,211,238,0.12)_1px,transparent_1px)] bg-[size:28px_28px]" />
      <div
        className="absolute inset-0 flex transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${activeIndex * 100}%)` }}
      >
        {screens.map((screen) => (
          <section key={screen} className="relative h-full w-full shrink-0 overflow-hidden px-6 py-5">
            <div className="absolute left-6 top-5 rounded border border-cyan-300/15 bg-black/35 px-3 py-2 text-[9px] uppercase tracking-[0.18em] text-white/45">
              <div className="text-cyan-300">Tile Screen {screen + 1}</div>
              <div>Independent tile workspace · app windows can deploy here</div>
            </div>
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 text-center">
              <div className="text-[11px] uppercase tracking-[0.42em] text-cyan-300/80">Tile Workspace {screen + 1}</div>
              <div className="mt-3 text-xl uppercase tracking-[0.18em] text-white/35">No Tile Window Open</div>
              <div className="mt-3 text-[11px] uppercase tracking-[0.16em] text-white/25">
                Open apps from the Dock or Intel Maps bar. Windows will be staged on the active Tile screen.
              </div>
            </div>
            <div className="absolute bottom-28 left-1/2 flex -translate-x-1/2 items-center gap-2 text-[9px] uppercase tracking-[0.16em] text-white/40">
              {screens.map((dot) => (
                <button
                  key={dot}
                  type="button"
                  aria-label={`Go to Tile Screen ${dot + 1}`}
                  onClick={() => goToTile(dot)}
                  className={`h-1.5 rounded-full transition-all ${dot === activeIndex ? 'w-8 bg-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.8)]' : 'w-2 bg-white/20 hover:bg-cyan-300/50'}`}
                />
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="olympus-tile-switcher fixed bottom-[40px] right-5 z-[4600] flex items-center gap-2 rounded-2xl border border-cyan-300/25 bg-black/80 px-2 py-1.5 text-[10px] uppercase tracking-[0.16em] text-white/55 shadow-[0_0_18px_rgba(34,211,238,0.16)] backdrop-blur">
        <button
          type="button"
          onClick={previousTile}
          disabled={activeIndex === 0}
          className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-cyan-200 disabled:cursor-not-allowed disabled:opacity-30 hover:border-cyan-300/50 hover:bg-cyan-300/10"
          aria-label="Previous Tile screen"
        >
          ‹
        </button>
        <div className="min-w-[92px] text-center leading-tight">
          <div className="text-cyan-300">Tile {activeIndex + 1}</div>
          <div className="text-[8px] text-white/35">of {screenCount}</div>
        </div>
        <button
          type="button"
          onClick={nextTile}
          className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-cyan-200 hover:border-cyan-300/50 hover:bg-cyan-300/10"
          aria-label="Next Tile screen"
        >
          ›
        </button>
        <button
          type="button"
          onClick={addTile}
          disabled={screenCount >= MAX_TILE_SCREENS}
          className="ml-1 h-8 rounded-xl border border-cyan-300/20 bg-cyan-300/10 px-2 text-[9px] text-cyan-100 disabled:cursor-not-allowed disabled:opacity-30 hover:border-cyan-300/55 hover:bg-cyan-300/15"
          aria-label="Add Tile screen"
        >
          + Tile
        </button>
      </div>
    </div>
  );
};
