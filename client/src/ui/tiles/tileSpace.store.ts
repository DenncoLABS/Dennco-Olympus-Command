import { create } from 'zustand';

export type WidgetScope = 'system' | 'app' | 'app-group' | 'sub-app' | 'tile';
export type TileLifecycleState = 'created' | 'loading' | 'live' | 'paused' | 'stale' | 'warning' | 'error' | 'editing' | 'review-needed' | 'locked' | 'closed' | 'archived';
export type TileLockMode = 'free' | 'locked' | 'pinned' | 'read-only' | 'operator-only' | 'review-needed';
export type TileLayoutKind = 'single' | 'split' | 'tri' | 'quad' | 'custom';

export type TileInstance = {
  id: string;
  appId: string;
  subAppId?: string;
  title: string;
  scope: WidgetScope;
  state: TileLifecycleState;
  lockMode: TileLockMode;
  groupId?: string;
  focusPageId: string;
  position?: { x: number; y: number; w: number; h: number };
  createdAt: string;
  updatedAt: string;
};

export type TileGroup = {
  id: string;
  appId: string;
  title: string;
  layout: TileLayoutKind;
  tileIds: string[];
  focusPageId: string;
};

export type WidgetInstance = {
  id: string;
  appId: string;
  title: string;
  scope: WidgetScope;
  parentTileId?: string;
  groupId?: string;
  focusPageId: string;
};

export type FocusPage = {
  id: string;
  name: string;
  order: number;
  tileIds: string[];
  groupIds: string[];
  widgetIds: string[];
};

const STORAGE_KEY = 'olympus.tilespace.v1';

const now = () => new Date().toISOString();
const id = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

const defaultFocusPages: FocusPage[] = [
  { id: 'focus-global-monitoring', name: 'Global Monitoring', order: 0, tileIds: [], groupIds: [], widgetIds: [] },
  { id: 'focus-workflow-review', name: 'Workflow Review', order: 1, tileIds: [], groupIds: [], widgetIds: [] },
  { id: 'focus-quad-watch', name: 'Quad Map Watch', order: 2, tileIds: [], groupIds: [], widgetIds: [] },
];

export interface TileSpaceState {
  focusPages: FocusPage[];
  activeFocusPageId: string;
  tiles: TileInstance[];
  groups: TileGroup[];
  widgets: WidgetInstance[];
  selectedTileId: string | null;
  selectFocusPage: (focusPageId: string) => void;
  nextFocusPage: () => void;
  previousFocusPage: () => void;
  addFocusPage: (name?: string) => string;
  deployAppTile: (input: { appId: string; title: string; subAppId?: string; scope?: WidgetScope; groupId?: string }) => string;
  deployIntelMapsQuad: () => string;
  addWidget: (input: { appId: string; title: string; scope: WidgetScope; parentTileId?: string; groupId?: string }) => string;
  closeTile: (tileId: string) => void;
  selectTile: (tileId: string | null) => void;
  resetTileSpace: () => void;
}

type PersistedTileSpace = Pick<TileSpaceState, 'focusPages' | 'activeFocusPageId' | 'tiles' | 'groups' | 'widgets' | 'selectedTileId'>;

function readPersisted(): PersistedTileSpace | null {
  if (typeof localStorage === 'undefined') return null;
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null') as PersistedTileSpace | null;
    if (!parsed || !Array.isArray(parsed.focusPages)) return null;
    return parsed;
  } catch {
    return null;
  }
}

function persist(state: PersistedTileSpace) {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

const persisted = typeof window === 'undefined' ? null : readPersisted();

export const useTileSpaceStore = create<TileSpaceState>((set, get) => ({
  focusPages: persisted?.focusPages || defaultFocusPages,
  activeFocusPageId: persisted?.activeFocusPageId || defaultFocusPages[0].id,
  tiles: persisted?.tiles || [],
  groups: persisted?.groups || [],
  widgets: persisted?.widgets || [],
  selectedTileId: persisted?.selectedTileId || null,
  selectFocusPage: (focusPageId) => setAndPersist({ activeFocusPageId: focusPageId }),
  nextFocusPage: () => {
    const state = get();
    const ordered = [...state.focusPages].sort((a, b) => a.order - b.order);
    const index = ordered.findIndex((page) => page.id === state.activeFocusPageId);
    const next = ordered[index + 1];
    if (next) setAndPersist({ activeFocusPageId: next.id });
    else {
      const name = `Focus ${ordered.length + 1}`;
      const nextId = get().addFocusPage(name);
      setAndPersist({ activeFocusPageId: nextId });
    }
  },
  previousFocusPage: () => {
    const state = get();
    const ordered = [...state.focusPages].sort((a, b) => a.order - b.order);
    const index = ordered.findIndex((page) => page.id === state.activeFocusPageId);
    const prev = ordered[index - 1];
    if (prev) setAndPersist({ activeFocusPageId: prev.id });
  },
  addFocusPage: (name = 'New Focus') => {
    const state = get();
    const focusPage: FocusPage = { id: id('focus'), name, order: state.focusPages.length, tileIds: [], groupIds: [], widgetIds: [] };
    setAndPersist({ focusPages: [...state.focusPages, focusPage] });
    return focusPage.id;
  },
  deployAppTile: ({ appId, title, subAppId, scope = 'app', groupId }) => {
    const state = get();
    const timestamp = now();
    const tile: TileInstance = {
      id: id('tile'),
      appId,
      subAppId,
      title,
      scope,
      state: 'live',
      lockMode: 'free',
      groupId,
      focusPageId: state.activeFocusPageId,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    const focusPages = state.focusPages.map((page) => page.id === state.activeFocusPageId ? { ...page, tileIds: [...page.tileIds, tile.id] } : page);
    setAndPersist({ tiles: [...state.tiles, tile], focusPages, selectedTileId: tile.id });
    return tile.id;
  },
  deployIntelMapsQuad: () => {
    const state = get();
    const timestamp = now();
    const groupId = id('group');
    const specs = [
      ['flights', 'Flight Map'],
      ['maritime', 'Maritime Map'],
      ['dot', 'DOT Map'],
      ['monitor', 'Monitor Map'],
    ] as const;
    const tiles: TileInstance[] = specs.map(([subAppId, title]) => ({
      id: id('tile'),
      appId: 'intelmaps',
      subAppId,
      title,
      scope: 'sub-app',
      state: 'live',
      lockMode: 'free',
      groupId,
      focusPageId: state.activeFocusPageId,
      createdAt: timestamp,
      updatedAt: timestamp,
    }));
    const group: TileGroup = {
      id: groupId,
      appId: 'intelmaps',
      title: 'Intel Maps Quad',
      layout: 'quad',
      tileIds: tiles.map((tile) => tile.id),
      focusPageId: state.activeFocusPageId,
    };
    const focusPages = state.focusPages.map((page) => page.id === state.activeFocusPageId ? { ...page, tileIds: [...page.tileIds, ...tiles.map((tile) => tile.id)], groupIds: [...page.groupIds, group.id] } : page);
    setAndPersist({ tiles: [...state.tiles, ...tiles], groups: [...state.groups, group], focusPages, selectedTileId: tiles[0]?.id || null });
    return group.id;
  },
  addWidget: ({ appId, title, scope, parentTileId, groupId }) => {
    const state = get();
    const widget: WidgetInstance = { id: id('widget'), appId, title, scope, parentTileId, groupId, focusPageId: state.activeFocusPageId };
    const focusPages = state.focusPages.map((page) => page.id === state.activeFocusPageId ? { ...page, widgetIds: [...page.widgetIds, widget.id] } : page);
    setAndPersist({ widgets: [...state.widgets, widget], focusPages });
    return widget.id;
  },
  closeTile: (tileId) => {
    const state = get();
    const tiles = state.tiles.map((tile) => tile.id === tileId ? { ...tile, state: 'closed' as TileLifecycleState, updatedAt: now() } : tile);
    const selectedTileId = state.selectedTileId === tileId ? null : state.selectedTileId;
    setAndPersist({ tiles, selectedTileId });
  },
  selectTile: (selectedTileId) => setAndPersist({ selectedTileId }),
  resetTileSpace: () => setAndPersist({ focusPages: defaultFocusPages, activeFocusPageId: defaultFocusPages[0].id, tiles: [], groups: [], widgets: [], selectedTileId: null }),
}));

function setAndPersist(patch: Partial<PersistedTileSpace>) {
  useTileSpaceStore.setState((state) => {
    const next = { ...state, ...patch };
    persist({
      focusPages: next.focusPages,
      activeFocusPageId: next.activeFocusPageId,
      tiles: next.tiles,
      groups: next.groups,
      widgets: next.widgets,
      selectedTileId: next.selectedTileId,
    });
    return patch;
  });
}
