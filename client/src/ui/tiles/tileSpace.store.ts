import { create } from 'zustand';

export type WidgetScope = 'system' | 'app' | 'app-group' | 'sub-app' | 'tile';
export type TileLifecycleState = 'created' | 'loading' | 'live' | 'paused' | 'stale' | 'warning' | 'error' | 'editing' | 'review-needed' | 'locked' | 'closed' | 'archived';
export type TileLockMode = 'free' | 'locked' | 'pinned' | 'read-only' | 'operator-only' | 'review-needed';
export type TileLayoutKind = 'single' | 'split' | 'tri' | 'quad' | 'custom';

export type TileInstance = {
  id: string;
  appId: string;
  subAppId?: string;
  tileDefinitionId?: string;
  title: string;
  scope: WidgetScope;
  state: TileLifecycleState;
  lockMode: TileLockMode;
  groupId?: string;
  focusPageId: string;
  position?: { x: number; y: number; w: number; h: number };
  linkedTileIds?: string[];
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
  createdAt: string;
  updatedAt: string;
};

export type WidgetInstance = {
  id: string;
  appId: string;
  widgetDefinitionId?: string;
  title: string;
  scope: WidgetScope;
  subAppId?: string;
  parentTileId?: string;
  groupId?: string;
  focusPageId: string;
  state: 'placeholder' | 'active' | 'hidden' | 'archived';
  createdAt: string;
  updatedAt: string;
};

export type FocusPage = {
  id: string;
  name: string;
  order: number;
  tileIds: string[];
  groupIds: string[];
  widgetIds: string[];
  archived?: boolean;
  updatedAt?: string;
};

export type FocusLayout = {
  id: string;
  name: string;
  sourceFocusPageId: string;
  createdAt: string;
  updatedAt: string;
  archived?: boolean;
  focusPage: FocusPage;
  tiles: TileInstance[];
  groups: TileGroup[];
  widgets: WidgetInstance[];
};

export type TileSpaceSessionContext = {
  activeAppId: string | null;
  activeDeskSurface: string | null;
  activeFocusPage: FocusPage | null;
  selectedTile: TileInstance | null;
  selectedObject: null;
  linkedTiles: TileInstance[];
  openContext: {
    focusPages: Array<Pick<FocusPage, 'id' | 'name' | 'order'>>;
    tiles: TileInstance[];
    groups: TileGroup[];
    widgets: WidgetInstance[];
  };
  currentWorkflow: string;
};

const STORAGE_KEY = 'olympus.tilespace.v2';
const LEGACY_STORAGE_KEY = 'olympus.tilespace.v1';
const now = () => new Date().toISOString();
const id = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
const defaultFocusPages: FocusPage[] = [
  { id: 'focus-global-monitoring', name: 'Global Monitoring', order: 0, tileIds: [], groupIds: [], widgetIds: [] },
  { id: 'focus-workflow-review', name: 'Workflow Review', order: 1, tileIds: [], groupIds: [], widgetIds: [] },
  { id: 'focus-quad-watch', name: 'Quad Map Watch', order: 2, tileIds: [], groupIds: [], widgetIds: [] },
];
const focusNamePool = ['Research Session', 'Incident Review', 'Map Comparison', 'Workflow Review', 'Quad Map Watch', 'Global Monitoring'];

export interface TileSpaceState {
  focusPages: FocusPage[];
  activeFocusPageId: string;
  tiles: TileInstance[];
  groups: TileGroup[];
  widgets: WidgetInstance[];
  savedLayouts: FocusLayout[];
  selectedTileId: string | null;
  activeDeskSurface: string | null;
  setActiveDeskSurface: (deskSurface: string | null) => void;
  selectFocusPage: (focusPageId: string) => void;
  nextFocusPage: () => void;
  previousFocusPage: () => void;
  addFocusPage: (name?: string) => string;
  deployAppTile: (input: { appId: string; title: string; subAppId?: string; tileDefinitionId?: string; scope?: WidgetScope; groupId?: string }) => string;
  deployTileGroup: (input: { appId: string; title: string; layout?: TileLayoutKind; tiles: Array<{ title: string; subAppId?: string; tileDefinitionId?: string; scope?: WidgetScope }> }) => string;
  deployIntelMapsQuad: () => string;
  addWidget: (input: { appId: string; title: string; scope: WidgetScope; widgetDefinitionId?: string; subAppId?: string; parentTileId?: string; groupId?: string }) => string;
  closeTile: (tileId: string) => void;
  selectTile: (tileId: string | null) => void;
  duplicateTile: (tileId: string) => string | null;
  groupTiles: (input: { appId: string; title?: string; tileIds: string[]; layout?: TileLayoutKind }) => string | null;
  saveFocusLayout: (name?: string) => string;
  loadFocusLayout: (layoutId: string) => void;
  duplicateFocusLayout: (layoutId?: string) => string | null;
  resetFocusLayout: (focusPageId?: string) => void;
  archiveFocusLayout: (layoutId: string) => void;
  resetTileSpace: () => void;
  getAssistantContext: (activeAppId?: string | null) => TileSpaceSessionContext;
}

type PersistedTileSpace = Pick<TileSpaceState, 'focusPages' | 'activeFocusPageId' | 'tiles' | 'groups' | 'widgets' | 'savedLayouts' | 'selectedTileId' | 'activeDeskSurface'>;

function normalizePersisted(parsed: Partial<PersistedTileSpace> | null): PersistedTileSpace | null {
  if (!parsed || !Array.isArray(parsed.focusPages)) return null;
  return {
    focusPages: parsed.focusPages.length ? parsed.focusPages : defaultFocusPages,
    activeFocusPageId: parsed.activeFocusPageId || parsed.focusPages[0]?.id || defaultFocusPages[0].id,
    tiles: Array.isArray(parsed.tiles) ? parsed.tiles : [],
    groups: Array.isArray(parsed.groups) ? parsed.groups.map((group) => ({ createdAt: now(), updatedAt: now(), ...group })) : [],
    widgets: Array.isArray(parsed.widgets) ? parsed.widgets.map((widget) => ({ state: 'placeholder' as const, createdAt: now(), updatedAt: now(), ...widget })) : [],
    savedLayouts: Array.isArray(parsed.savedLayouts) ? parsed.savedLayouts : [],
    selectedTileId: parsed.selectedTileId || null,
    activeDeskSurface: parsed.activeDeskSurface || null,
  };
}

function readPersisted(): PersistedTileSpace | null {
  if (typeof localStorage === 'undefined') return null;
  try {
    const current = normalizePersisted(JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'));
    if (current) return current;
    return normalizePersisted(JSON.parse(localStorage.getItem(LEGACY_STORAGE_KEY) || 'null'));
  } catch {
    return null;
  }
}

function persist(state: PersistedTileSpace) {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

const persisted = typeof window === 'undefined' ? null : readPersisted();

function snapshotFocusLayout(state: TileSpaceState, focusPageId: string, name?: string): FocusLayout {
  const focusPage = state.focusPages.find((page) => page.id === focusPageId) || state.focusPages[0] || defaultFocusPages[0];
  const tiles = state.tiles.filter((tile) => tile.focusPageId === focusPage.id && tile.state !== 'closed' && tile.state !== 'archived');
  const groups = state.groups.filter((group) => group.focusPageId === focusPage.id);
  const widgets = state.widgets.filter((widget) => widget.focusPageId === focusPage.id && widget.state !== 'archived');
  const timestamp = now();
  return {
    id: id('layout'),
    name: name || focusPage.name,
    sourceFocusPageId: focusPage.id,
    createdAt: timestamp,
    updatedAt: timestamp,
    focusPage: { ...focusPage, tileIds: tiles.map((tile) => tile.id), groupIds: groups.map((group) => group.id), widgetIds: widgets.map((widget) => widget.id), updatedAt: timestamp },
    tiles,
    groups,
    widgets,
  };
}

function cloneLayoutIntoFocus(layout: FocusLayout, focusPageId: string, focusName?: string) {
  const timestamp = now();
  const groupMap = new Map<string, string>();
  const tileMap = new Map<string, string>();
  const groups = layout.groups.map((group) => {
    const nextId = id('group');
    groupMap.set(group.id, nextId);
    return { ...group, id: nextId, focusPageId, tileIds: [], createdAt: timestamp, updatedAt: timestamp };
  });
  const tiles = layout.tiles.map((tile) => {
    const nextId = id('tile');
    tileMap.set(tile.id, nextId);
    return { ...tile, id: nextId, focusPageId, groupId: tile.groupId ? groupMap.get(tile.groupId) : undefined, state: 'live' as TileLifecycleState, createdAt: timestamp, updatedAt: timestamp };
  });
  const widgets = layout.widgets.map((widget) => ({
    ...widget,
    id: id('widget'),
    focusPageId,
    parentTileId: widget.parentTileId ? tileMap.get(widget.parentTileId) : undefined,
    groupId: widget.groupId ? groupMap.get(widget.groupId) : undefined,
    state: widget.state === 'archived' ? 'placeholder' as const : widget.state,
    createdAt: timestamp,
    updatedAt: timestamp,
  }));
  const hydratedGroups = groups.map((group) => ({ ...group, tileIds: tiles.filter((tile) => tile.groupId === group.id).map((tile) => tile.id) }));
  const focusPage: FocusPage = { ...layout.focusPage, id: focusPageId, name: focusName || layout.name, tileIds: tiles.map((tile) => tile.id), groupIds: hydratedGroups.map((group) => group.id), widgetIds: widgets.map((widget) => widget.id), updatedAt: timestamp };
  return { focusPage, tiles, groups: hydratedGroups, widgets };
}

export const useTileSpaceStore = create<TileSpaceState>((set, get) => ({
  focusPages: persisted?.focusPages || defaultFocusPages,
  activeFocusPageId: persisted?.activeFocusPageId || defaultFocusPages[0].id,
  tiles: persisted?.tiles || [],
  groups: persisted?.groups || [],
  widgets: persisted?.widgets || [],
  savedLayouts: persisted?.savedLayouts || [],
  selectedTileId: persisted?.selectedTileId || null,
  activeDeskSurface: persisted?.activeDeskSurface || null,
  setActiveDeskSurface: (activeDeskSurface) => setAndPersist({ activeDeskSurface }),
  selectFocusPage: (focusPageId) => setAndPersist({ activeFocusPageId: focusPageId, selectedTileId: null }),
  nextFocusPage: () => {
    const state = get();
    const ordered = [...state.focusPages].filter((page) => !page.archived).sort((a, b) => a.order - b.order);
    const index = ordered.findIndex((page) => page.id === state.activeFocusPageId);
    const next = ordered[index + 1];
    if (next) setAndPersist({ activeFocusPageId: next.id, selectedTileId: null });
    else {
      const nextId = get().addFocusPage(focusNamePool[ordered.length % focusNamePool.length] || `Focus ${ordered.length + 1}`);
      setAndPersist({ activeFocusPageId: nextId, selectedTileId: null });
    }
  },
  previousFocusPage: () => {
    const state = get();
    const ordered = [...state.focusPages].filter((page) => !page.archived).sort((a, b) => a.order - b.order);
    const index = ordered.findIndex((page) => page.id === state.activeFocusPageId);
    const prev = ordered[index - 1];
    if (prev) setAndPersist({ activeFocusPageId: prev.id, selectedTileId: null });
  },
  addFocusPage: (name = 'New Focus') => {
    const state = get();
    const timestamp = now();
    const focusPage: FocusPage = { id: id('focus'), name, order: state.focusPages.length, tileIds: [], groupIds: [], widgetIds: [], updatedAt: timestamp };
    setAndPersist({ focusPages: [...state.focusPages, focusPage] });
    return focusPage.id;
  },
  deployAppTile: ({ appId, title, subAppId, tileDefinitionId, scope = 'app', groupId }) => {
    const state = get();
    const timestamp = now();
    const tile: TileInstance = { id: id('tile'), appId, subAppId, tileDefinitionId, title, scope, state: 'live', lockMode: 'free', groupId, focusPageId: state.activeFocusPageId, linkedTileIds: [], createdAt: timestamp, updatedAt: timestamp };
    const focusPages = state.focusPages.map((page) => page.id === state.activeFocusPageId ? { ...page, tileIds: [...page.tileIds, tile.id], updatedAt: timestamp } : page);
    const groups = groupId ? state.groups.map((group) => group.id === groupId ? { ...group, tileIds: [...group.tileIds, tile.id], updatedAt: timestamp } : group) : state.groups;
    setAndPersist({ tiles: [...state.tiles, tile], groups, focusPages, selectedTileId: tile.id });
    return tile.id;
  },
  deployTileGroup: ({ appId, title, layout = 'quad', tiles: tileSpecs }) => {
    const state = get();
    const timestamp = now();
    const groupId = id('group');
    const deployedTiles: TileInstance[] = tileSpecs.map((spec) => ({ id: id('tile'), appId, subAppId: spec.subAppId, tileDefinitionId: spec.tileDefinitionId, title: spec.title, scope: spec.scope || 'sub-app', state: 'live', lockMode: 'free', groupId, focusPageId: state.activeFocusPageId, linkedTileIds: [], createdAt: timestamp, updatedAt: timestamp }));
    const group: TileGroup = { id: groupId, appId, title, layout, tileIds: deployedTiles.map((tile) => tile.id), focusPageId: state.activeFocusPageId, createdAt: timestamp, updatedAt: timestamp };
    const focusPages = state.focusPages.map((page) => page.id === state.activeFocusPageId ? { ...page, tileIds: [...page.tileIds, ...deployedTiles.map((tile) => tile.id)], groupIds: [...page.groupIds, group.id], updatedAt: timestamp } : page);
    setAndPersist({ tiles: [...state.tiles, ...deployedTiles], groups: [...state.groups, group], focusPages, selectedTileId: deployedTiles[0]?.id || null });
    return group.id;
  },
  deployIntelMapsQuad: () => get().deployTileGroup({
    appId: 'intelmaps', title: 'Intel Maps Quad', layout: 'quad', tiles: [
      { subAppId: 'flight-map', tileDefinitionId: 'flight-map', title: 'Flight Map', scope: 'sub-app' },
      { subAppId: 'maritime-map', tileDefinitionId: 'maritime-map', title: 'Maritime Map', scope: 'sub-app' },
      { subAppId: 'dot-map', tileDefinitionId: 'dot-map', title: 'DOT Map', scope: 'sub-app' },
      { subAppId: 'monitor-map', tileDefinitionId: 'monitor-map', title: 'Monitor Map', scope: 'sub-app' },
    ],
  }),
  addWidget: ({ appId, title, scope, widgetDefinitionId, subAppId, parentTileId, groupId }) => {
    const state = get();
    const timestamp = now();
    const widget: WidgetInstance = { id: id('widget'), appId, title, scope, widgetDefinitionId, subAppId, parentTileId, groupId, focusPageId: state.activeFocusPageId, state: 'placeholder', createdAt: timestamp, updatedAt: timestamp };
    const focusPages = state.focusPages.map((page) => page.id === state.activeFocusPageId ? { ...page, widgetIds: [...page.widgetIds, widget.id], updatedAt: timestamp } : page);
    setAndPersist({ widgets: [...state.widgets, widget], focusPages });
    return widget.id;
  },
  closeTile: (tileId) => {
    const state = get();
    const timestamp = now();
    const tiles = state.tiles.map((tile) => tile.id === tileId ? { ...tile, state: 'closed' as TileLifecycleState, updatedAt: timestamp } : tile);
    setAndPersist({ tiles, selectedTileId: state.selectedTileId === tileId ? null : state.selectedTileId });
  },
  selectTile: (selectedTileId) => setAndPersist({ selectedTileId }),
  duplicateTile: (tileId) => {
    const source = get().tiles.find((tile) => tile.id === tileId);
    if (!source) return null;
    return get().deployAppTile({ appId: source.appId, title: `${source.title} Copy`, subAppId: source.subAppId, tileDefinitionId: source.tileDefinitionId, scope: source.scope, groupId: source.groupId });
  },
  groupTiles: ({ appId, title, tileIds, layout = 'custom' }) => {
    const state = get();
    const activeTiles = state.tiles.filter((tile) => tileIds.includes(tile.id) && tile.state !== 'closed');
    if (activeTiles.length < 2) return null;
    const timestamp = now();
    const groupId = id('group');
    const group: TileGroup = { id: groupId, appId, title: title || `${appId} Tile Group`, layout, tileIds: activeTiles.map((tile) => tile.id), focusPageId: state.activeFocusPageId, createdAt: timestamp, updatedAt: timestamp };
    const tiles = state.tiles.map((tile) => tileIds.includes(tile.id) ? { ...tile, groupId, scope: tile.scope === 'app' ? 'app-group' as WidgetScope : tile.scope, updatedAt: timestamp } : tile);
    const focusPages = state.focusPages.map((page) => page.id === state.activeFocusPageId ? { ...page, groupIds: [...page.groupIds, group.id], updatedAt: timestamp } : page);
    setAndPersist({ tiles, groups: [...state.groups, group], focusPages });
    return groupId;
  },
  saveFocusLayout: (name) => {
    const state = get();
    const layout = snapshotFocusLayout(state, state.activeFocusPageId, name);
    setAndPersist({ savedLayouts: [layout, ...state.savedLayouts] });
    return layout.id;
  },
  loadFocusLayout: (layoutId) => {
    const state = get();
    const layout = state.savedLayouts.find((item) => item.id === layoutId && !item.archived);
    if (!layout) return;
    const cloned = cloneLayoutIntoFocus(layout, state.activeFocusPageId, layout.name);
    setAndPersist({
      focusPages: state.focusPages.map((page) => page.id === state.activeFocusPageId ? cloned.focusPage : page),
      tiles: [...state.tiles.filter((tile) => tile.focusPageId !== state.activeFocusPageId), ...cloned.tiles],
      groups: [...state.groups.filter((group) => group.focusPageId !== state.activeFocusPageId), ...cloned.groups],
      widgets: [...state.widgets.filter((widget) => widget.focusPageId !== state.activeFocusPageId), ...cloned.widgets],
      selectedTileId: cloned.tiles[0]?.id || null,
    });
  },
  duplicateFocusLayout: (layoutId) => {
    const state = get();
    const layout = layoutId ? state.savedLayouts.find((item) => item.id === layoutId) : snapshotFocusLayout(state, state.activeFocusPageId, `${state.focusPages.find((page) => page.id === state.activeFocusPageId)?.name || 'Focus'} Copy`);
    if (!layout) return null;
    const focusPageId = get().addFocusPage(`${layout.name} Copy`);
    const latest = get();
    const cloned = cloneLayoutIntoFocus(layout, focusPageId, `${layout.name} Copy`);
    setAndPersist({ activeFocusPageId: focusPageId, focusPages: latest.focusPages.map((page) => page.id === focusPageId ? cloned.focusPage : page), tiles: [...latest.tiles, ...cloned.tiles], groups: [...latest.groups, ...cloned.groups], widgets: [...latest.widgets, ...cloned.widgets], selectedTileId: cloned.tiles[0]?.id || null });
    return focusPageId;
  },
  resetFocusLayout: (focusPageId) => {
    const state = get();
    const target = focusPageId || state.activeFocusPageId;
    const timestamp = now();
    setAndPersist({ focusPages: state.focusPages.map((page) => page.id === target ? { ...page, tileIds: [], groupIds: [], widgetIds: [], updatedAt: timestamp } : page), tiles: state.tiles.filter((tile) => tile.focusPageId !== target), groups: state.groups.filter((group) => group.focusPageId !== target), widgets: state.widgets.filter((widget) => widget.focusPageId !== target), selectedTileId: state.selectedTileId && state.tiles.some((tile) => tile.id === state.selectedTileId && tile.focusPageId === target) ? null : state.selectedTileId });
  },
  archiveFocusLayout: (layoutId) => {
    const state = get();
    setAndPersist({ savedLayouts: state.savedLayouts.map((layout) => layout.id === layoutId ? { ...layout, archived: true, updatedAt: now() } : layout) });
  },
  resetTileSpace: () => setAndPersist({ focusPages: defaultFocusPages, activeFocusPageId: defaultFocusPages[0].id, tiles: [], groups: [], widgets: [], savedLayouts: [], selectedTileId: null, activeDeskSurface: null }),
  getAssistantContext: (activeAppId = null) => {
    const state = get();
    const activeFocusPage = state.focusPages.find((page) => page.id === state.activeFocusPageId) || null;
    const selectedTile = state.tiles.find((tile) => tile.id === state.selectedTileId) || null;
    const linkedTiles = selectedTile?.linkedTileIds?.length ? state.tiles.filter((tile) => selectedTile.linkedTileIds?.includes(tile.id)) : [];
    return { activeAppId, activeDeskSurface: state.activeDeskSurface, activeFocusPage, selectedTile, selectedObject: null, linkedTiles, openContext: { focusPages: state.focusPages.filter((page) => !page.archived).map(({ id, name, order }) => ({ id, name, order })), tiles: state.tiles.filter((tile) => tile.state !== 'closed' && tile.state !== 'archived'), groups: state.groups, widgets: state.widgets.filter((widget) => widget.state !== 'archived') }, currentWorkflow: activeFocusPage?.name || 'No active focus' };
  },
}));

export function getTileSpaceSessionContext(activeAppId?: string | null) {
  return useTileSpaceStore.getState().getAssistantContext(activeAppId);
}

function setAndPersist(patch: Partial<PersistedTileSpace>) {
  useTileSpaceStore.setState((state) => {
    const next = { ...state, ...patch };
    persist({ focusPages: next.focusPages, activeFocusPageId: next.activeFocusPageId, tiles: next.tiles, groups: next.groups, widgets: next.widgets, savedLayouts: next.savedLayouts, selectedTileId: next.selectedTileId, activeDeskSurface: next.activeDeskSurface });
    return patch;
  });
}
