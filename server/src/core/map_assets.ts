export type MapAssetType = 'aircraft' | 'vessel' | 'vehicle' | 'custom';
export type MapAssetStatus = 'online' | 'offline' | 'unknown';

export interface MapAssetRecord {
  assetId: string;
  assetType: MapAssetType;
  uniqueId: string;
  label: string;
}

export const ASSET_ROOT = '/var/lib/dennco/olympus-command/assets';

export const mapAssetStore = {
  list: () => [] as MapAssetRecord[],
  get: () => null as MapAssetRecord | null,
  getByUniqueId: () => null as MapAssetRecord | null,
  getMovement: () => [],
  upsert: () => {
    throw new Error('Map asset store is disabled pending a safe schema migration.');
  },
  touchTracking: () => {
    throw new Error('Map asset tracking is disabled pending a safe schema migration.');
  },
};
