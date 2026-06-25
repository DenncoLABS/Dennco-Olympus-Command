import React, { useEffect, useRef } from 'react';
import { useThemeStore } from '../theme/theme.store';

const INDEX_KEY = 'olympus.tiles.activeIndex';
const STORE_PREFIX = 'olympus.tiles.workspace.';
const NAV_EVENT = 'olympus:tile-screen-nav';

function indexNow() {
  const value = Number(window.localStorage.getItem(INDEX_KEY));
  return Number.isFinite(value) && value >= 0 ? value : 0;
}

function keyFor(index: number) {
  return `${STORE_PREFIX}${index}`;
}

function readState(index: number) {
  try {
    const raw = window.localStorage.getItem(keyFor(index));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeState(index: number, value: unknown) {
  try {
    window.localStorage.setItem(keyFor(index), JSON.stringify(value));
  } catch {
    return;
  }
}

export const TileWorkspaceBinder: React.FC = () => {
  const currentRef = useRef(typeof window === 'undefined' ? 0 : indexNow());
  const getShellSession = useThemeStore((state) => state.getShellSession);
  const hydrateShellSession = useThemeStore((state) => state.hydrateShellSession);
  const activeModule = useThemeStore((state) => state.activeModule);
  const mapProjection = useThemeStore((state) => state.mapProjection);
  const mapLayer = useThemeStore((state) => state.mapLayer);
  const weatherRadar = useThemeStore((state) => state.weatherRadar);

  useEffect(() => {
    writeState(currentRef.current, getShellSession());
  }, [activeModule, mapProjection, mapLayer, weatherRadar, getShellSession]);

  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<{ activeIndex?: number }>).detail;
      if (!detail || typeof detail.activeIndex !== 'number') return;
      writeState(currentRef.current, getShellSession());
      const next = Math.max(0, detail.activeIndex);
      currentRef.current = next;
      window.localStorage.setItem(INDEX_KEY, String(next));
      hydrateShellSession(readState(next) || { activeModule: 'core' });
    };

    window.addEventListener(NAV_EVENT, handler);
    return () => window.removeEventListener(NAV_EVENT, handler);
  }, [getShellSession, hydrateShellSession]);

  return null;
};
