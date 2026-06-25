import { useThemeStore } from '../theme/theme.store';

const INDEX_KEY = 'olympus.tiles.activeIndex';
const STORE_PREFIX = 'olympus.tiles.workspace.';
const NAV_EVENT = 'olympus:tile-screen-nav';
const BOOT_KEY = '__olympusTileWorkspaceScopeReady';

type ScopedWindow = Window & { [BOOT_KEY]?: boolean };

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

if (typeof window !== 'undefined') {
  const scopedWindow = window as ScopedWindow;
  if (!scopedWindow[BOOT_KEY]) {
    scopedWindow[BOOT_KEY] = true;
    let currentIndex = indexNow();

    const saveCurrent = () => {
      writeState(currentIndex, useThemeStore.getState().getShellSession());
    };

    useThemeStore.subscribe(saveCurrent);
    saveCurrent();

    window.addEventListener(NAV_EVENT, (event: Event) => {
      const detail = (event as CustomEvent<{ activeIndex?: number }>).detail;
      if (!detail || typeof detail.activeIndex !== 'number') return;

      saveCurrent();
      currentIndex = Math.max(0, detail.activeIndex);
      window.localStorage.setItem(INDEX_KEY, String(currentIndex));

      const nextState = readState(currentIndex) || { activeModule: 'core' };
      useThemeStore.getState().hydrateShellSession(nextState);
    });
  }
}
