export type IntelMapAppId = 'flights' | 'maritime' | 'monitor' | 'dot' | 'cyber' | string;
export type IntelMapProjection = 'mercator' | 'globe';
export type IntelMapBaseLayer = 'dark' | 'light' | 'street' | 'satellite' | string;
export type IntelMapLayerKind = 'base' | 'overlay' | 'entity' | 'sensor' | 'weather' | 'infrastructure' | 'custom';
export type IntelFeedKind = 'rest' | 'websocket' | 'local-file' | 'computed' | 'custom';
export type IntelWidgetPlacement = 'map' | 'dock' | 'panel' | 'modal';
export type IntelWorkflowTrigger = 'flight.emergency' | 'feed.update' | 'map.opened' | 'widget.action' | 'custom';

export type IntelMapAppDefinition = {
  id: IntelMapAppId;
  title: string;
  description: string;
  modulePath: string;
  defaultBaseLayer: IntelMapBaseLayer;
  defaultProjection: IntelMapProjection;
  layerIds: string[];
  feedIds: string[];
  widgetIds: string[];
  workflowIds?: string[];
  preservesLegacyApp: boolean;
};

export type IntelLayerDefinition = {
  id: string;
  title: string;
  kind: IntelMapLayerKind;
  description: string;
  appIds: IntelMapAppId[];
  feedIds?: string[];
  defaultEnabled: boolean;
  userConfigurable: boolean;
};

export type IntelFeedDefinition = {
  id: string;
  title: string;
  kind: IntelFeedKind;
  description: string;
  route?: string;
  sourceFolder?: string;
  cachePolicy?: 'session' | 'last-good' | 'persistent' | 'none';
  sharedAcrossMaps: boolean;
};

export type IntelWidgetDefinition = {
  id: string;
  title: string;
  description: string;
  placement: IntelWidgetPlacement;
  appIds: IntelMapAppId[];
  defaultOpen: boolean;
  returnsToDock: boolean;
};

export type IntelWorkflowDefinition = {
  id: string;
  title: string;
  description: string;
  trigger: IntelWorkflowTrigger;
  enabledByDefault: boolean;
  appIds: IntelMapAppId[];
  actions: Array<{ type: string; target?: string; severity?: string; message?: string }>;
};

export type IntelSavedMapDefinition = {
  id: string;
  title: string;
  appId?: IntelMapAppId;
  baseLayer: IntelMapBaseLayer;
  projection: IntelMapProjection;
  layerIds: string[];
  feedIds: string[];
  widgetIds: string[];
  workflowIds: string[];
  viewport?: { lat: number; lon: number; zoom: number };
  notes?: string;
  createdAt: string;
  updatedAt: string;
};
