import React, { useEffect, useState } from 'react';

const TILE_SCREEN_COUNT_KEY = 'olympus.tiles.screenCount';
const TILE_SCREEN_INDEX_KEY = 'olympus.tiles.activeIndex';
const TILE_NAV_EVENT = 'olympus:tile-screen-nav';
const MIN_TILE_SCREENS = 3;
const MAX_TILE_SCREENS = 18;

function savedNumber(key: string, fallback: number) {
  const value = Number(localStorage.getItem(key));
  return Number.isFinite(value) ? value : fallback;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function DeskTileSwitcher() {
  const [screenCount, setScreenCount] = useState(() => clamp(savedNumber(TILE_SCREEN_COUNT_KEY, MIN_TILE_SCREENS), MIN_TILE_SCREENS, MAX_TILE_SCREENS));
  const [activeIndex, setActiveIndex] = useState(() => clamp(savedNumber(TILE_SCREEN_INDEX_KEY, 0), 0, Math.max(0, savedNumber(TILE_SCREEN_COUNT_KEY, MIN_TILE_SCREENS) - 1)));

  const publish = (nextIndex: number, nextCount: number) => {
    const safeCount = clamp(nextCount, MIN_TILE_SCREENS, MAX_TILE_SCREENS);
    const safeIndex = clamp(nextIndex, 0, safeCount - 1);
    setScreenCount(safeCount);
    setActiveIndex(safeIndex);
    localStorage.setItem(TILE_SCREEN_COUNT_KEY, String(safeCount));
    localStorage.setItem(TILE_SCREEN_INDEX_KEY, String(safeIndex));
    window.dispatchEvent(new CustomEvent(TILE_NAV_EVENT, { detail: { activeIndex: safeIndex, screenCount: safeCount } }));
  };

  const previousTile = () => publish(activeIndex - 1, screenCount);
  const nextTile = () => {
    if (activeIndex < screenCount - 1) publish(activeIndex + 1, screenCount);
    else if (screenCount < MAX_TILE_SCREENS) publish(activeIndex + 1, screenCount + 1);
  };

  useEffect(() => {
    const refresh = () => {
      const count = clamp(savedNumber(TILE_SCREEN_COUNT_KEY, MIN_TILE_SCREENS), MIN_TILE_SCREENS, MAX_TILE_SCREENS);
      setScreenCount(count);
      setActiveIndex(clamp(savedNumber(TILE_SCREEN_INDEX_KEY, 0), 0, count - 1));
    };
    window.addEventListener(TILE_NAV_EVENT, refresh as EventListener);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener(TILE_NAV_EVENT, refresh as EventListener);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  return (
    <div className="olympus-tile-switcher fixed bottom-[40px] right-5 z-[4700] flex items-center gap-2 rounded-2xl border border-cyan-300/25 bg-black/80 px-2 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-white/55 shadow-[0_0_18px_rgba(34,211,238,0.16)] backdrop-blur">
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
        disabled={activeIndex >= MAX_TILE_SCREENS - 1 && screenCount >= MAX_TILE_SCREENS}
        className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-cyan-200 disabled:cursor-not-allowed disabled:opacity-30 hover:border-cyan-300/50 hover:bg-cyan-300/10"
        aria-label="Next Tile screen"
      >
        ›
      </button>
    </div>
  );
}
