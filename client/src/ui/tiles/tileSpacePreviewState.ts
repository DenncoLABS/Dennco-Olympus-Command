export const TILESPACE_PREVIEW_SELECTED_TILE_KEY = 'olympus.tilespace.preview.selectedTile';
export const TILESPACE_PREVIEW_QUAD_KEY = 'olympus.tilespace.preview.quad';
export const TILESPACE_PREVIEW_FOCUS_KEY = 'olympus.tilespace.preview.focus';
export const TILESPACE_PREVIEW_ACTIVE_TAB_KEY = 'olympus.tilespace.preview.activeTab';
export const TILESPACE_PREVIEW_LAYOUT_KEY = 'olympus.tilespace.preview.layout';

export function readTileSpacePreviewString(key: string, fallback: string) {
  try {
    return window.localStorage.getItem(key) || fallback;
  } catch {
    return fallback;
  }
}

export function readTileSpacePreviewBoolean(key: string, fallback: boolean) {
  try {
    const value = window.localStorage.getItem(key);
    if (value === 'true') return true;
    if (value === 'false') return false;
    return fallback;
  } catch {
    return fallback;
  }
}

export function writeTileSpacePreviewString(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Browser storage can be unavailable in restricted sessions.
  }
}

export function writeTileSpacePreviewBoolean(key: string, value: boolean) {
  writeTileSpacePreviewString(key, String(value));
}
