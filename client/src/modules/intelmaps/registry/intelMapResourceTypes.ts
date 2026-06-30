import type { MapLayer, MapProjection, WeatherRadarState } from '../../../ui/theme/theme.store';

export type IntelMapResourceKind = 'instance' | 'layer' | 'asset' | 'feed' | 'template' | 'saved-map';
export type IntelMapAssetKind = 'geojson' | 'kml' | 'kmz' | 'image' | 'icon' | 'symbol' | 'raster' | 'vector' | 'document' | 'other';
export type IntelMapFeedKind = 'rest' | 'geojson' | 'tiles' | 'websocket' | 'local-file' | 'manual';
export type IntelMapLayerKind = 'base' | 'overlay' | 'feed' | 'asset' | 'drawn' | 'annotation';
export type IntelMapShareRole = 'viewer' | 'operator' | 'editor' | 'owner';
export type IntelMapShareScope = 'private' | 'workgroup' | 'link' | 'organization';

export type IntelMapViewState = {
  longitude: number;
  latitude: number;
  zoom: number;
  bearing?: number;
  pitch?: number;
};

export type IntelMapAppearanceState = {
  mapLayer: MapLayer;
  mapProjection: MapProjection;
  weatherRadar: WeatherRadarState;
};

export type IntelMapAssetDefinition = {
  id: string;
  name: string;
  kind: IntelMapAssetKind;
  path: string;
  mimeType?: string;
  sizeBytes?: number;
  uploadedAt?: number;
  tags?: string[];
};

export type IntelMapFeedDefinition = {
  id: string;
  name: string;
  kind: IntelMapFeedKind;
  url?: string;
  method?: 'GET' | 'POST';
  refreshMs?: number;
  enabled: boolean;
  tags?: string[];
};

export type IntelMapLayerDefinition = {
  id: string;
  name: string;
  kind: IntelMapLayerKind;
  visible: boolean;
  opacity: number;
  sourceId?: string;
  sourceKind?: 'asset' | 'feed' | 'system' | 'drawn';
  zIndex?: number;
  tags?: string[];
};

export type IntelMapTemplateDefinition = {
  id: string;
  name: string;
  description: string;
  viewState: IntelMapViewState;
  appearance: IntelMapAppearanceState;
  layerIds: string[];
  feedIds: string[];
  assetIds: string[];
};

export type IntelMapSharePermission = {
  role: IntelMapShareRole;
  canView: boolean;
  canEdit: boolean;
  canOperate: boolean;
  canShare: boolean;
  canExport: boolean;
};

export type IntelMapShareTarget = {
  id: string;
  label: string;
  scope: IntelMapShareScope;
  role: IntelMapShareRole;
  expiresAt?: number;
};

export type IntelMapShareState = {
  enabled: boolean;
  scope: IntelMapShareScope;
  ownerId?: string;
  shareId?: string;
  shareUrl?: string;
  createdAt?: number;
  expiresAt?: number;
  defaultPermission: IntelMapSharePermission;
  targets: IntelMapShareTarget[];
};

export type IntelMapInstanceDefinition = {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  viewState: IntelMapViewState;
  appearance: IntelMapAppearanceState;
  layerIds: string[];
  feedIds: string[];
  assetIds: string[];
  notes?: string;
  savedPath?: string;
  share?: IntelMapShareState;
};

export type IntelMapResourceRegistry = {
  version: 1;
  rootPath: string;
  folders: Record<IntelMapResourceKind, string>;
  instances: IntelMapInstanceDefinition[];
  layers: IntelMapLayerDefinition[];
  assets: IntelMapAssetDefinition[];
  feeds: IntelMapFeedDefinition[];
  templates: IntelMapTemplateDefinition[];
};
