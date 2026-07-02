import fs from 'fs';
import path from 'path';

export type MapAssetType = 'aircraft' | 'vessel' | 'vehicle' | 'custom';
export type MapAssetStatus = 'online' | 'offline' | 'unknown';

export interface MapAssetTrackingState {
  enabled: boolean;
  source: string | null;
  status: MapAssetStatus;
  lastSeen: number | null;
  lat: number | null;
  lon: number | null;
  telemetry: Record<string, unknown> | null;
}

export interface MapAssetMovementPoint {
  timestamp: number;
  source: string | null;
  lat: number | null;
  lon: number | null;
  status: MapAssetStatus;
  telemetry: Record<string, unknown> | null;
}

export interface MapAssetRecord {
  assetId: string;
  assetType: MapAssetType;
  uniqueId: string;
  label: string;
  folderPath: string;
  databasePath: string;
  photoPath?: string;
  details: Record<string, unknown>;
  tracking: MapAssetTrackingState;
  data: {
    identity: Record<string, unknown>;
    telemetry: Record<string, unknown> | null;
    history: MapAssetMovementPoint[];
    documents: unknown[];
    notes: unknown[];
  };
  createdAt: number;
  updatedAt: number;
}

const ASSET_ROOT = process.env.OLYMPUS_ASSET_ROOT || '/var/lib/dennco/olympus-command/assets';
const INDEX_PATH = path.join(ASSET_ROOT, 'asset-index.json');
const MAX_INLINE_HISTORY = 500;

function now() {
  return Date.now();
}

function sanitize(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '') || 'unknown';
}

function normalizeType(value: unknown): MapAssetType {
  if (value === 'aircraft' || value === 'vessel' || value === 'vehicle' || value === 'custom') return value;
  return 'custom';
}

function assetIdFor(assetType: MapAssetType, uniqueId: string) {
  return `${assetType}-${sanitize(uniqueId)}`;
}

function folderFor(assetType: MapAssetType, uniqueId: string) {
  return path.join(ASSET_ROOT, `${assetType}s`, sanitize(uniqueId));
}

function databasePathFor(assetType: MapAssetType, uniqueId: string) {
  return `${assetType}s/${sanitize(uniqueId)}`;
}

function ensureDirSync(target: string) {
  fs.mkdirSync(target, { recursive: true });
}

function readJsonFile<T>(filePath: string, fallback: T): T {
  try {
    if (!fs.existsSync(filePath)) return fallback;
    return JSON.parse(fs.readFileSync(filePath, 'utf8')) as T;
  } catch {
    return fallback;
  }
}

function readIndex(): MapAssetRecord[] {
  return readJsonFile<MapAssetRecord[]>(INDEX_PATH, []).filter(Boolean);
}

function writeIndex(records: MapAssetRecord[]) {
  ensureDirSync(ASSET_ROOT);
  fs.writeFileSync(INDEX_PATH, JSON.stringify(records, null, 2));
}

function movementPath(asset: MapAssetRecord) {
  return path.join(asset.folderPath, 'history', 'movement.json');
}

function writeMovement(asset: MapAssetRecord, history: MapAssetMovementPoint[]) {
  ensureDirSync(path.join(asset.folderPath, 'history'));
  fs.writeFileSync(movementPath(asset), JSON.stringify(history, null, 2));
}

function readMovement(asset: MapAssetRecord): MapAssetMovementPoint[] {
  return readJsonFile<MapAssetMovementPoint[]>(movementPath(asset), asset.data.history || []);
}

function writeAsset(asset: MapAssetRecord) {
  ensureDirSync(asset.folderPath);
  ensureDirSync(path.join(asset.folderPath, 'history'));
  ensureDirSync(path.join(asset.folderPath, 'documents'));
  ensureDirSync(path.join(asset.folderPath, 'notes'));
  ensureDirSync(path.join(asset.folderPath, 'photos'));
  fs.writeFileSync(path.join(asset.folderPath, 'asset.json'), JSON.stringify(asset, null, 2));
}

function defaultTracking(): MapAssetTrackingState {
  return {
    enabled: false,
    source: null,
    status: 'offline',
    lastSeen: null,
    lat: null,
    lon: null,
    telemetry: null,
  };
}

function movementPointFromTracking(tracking: MapAssetTrackingState): MapAssetMovementPoint | null {
  if (!tracking.lastSeen || tracking.lat == null || tracking.lon == null) return null;
  return {
    timestamp: tracking.lastSeen,
    source: tracking.source,
    lat: tracking.lat,
    lon: tracking.lon,
    status: tracking.status,
    telemetry: tracking.telemetry,
  };
}

function shouldAppendMovement(history: MapAssetMovementPoint[], point: MapAssetMovementPoint): boolean {
  const last = history[history.length - 1];
  if (!last) return true;
  if (last.lat !== point.lat || last.lon !== point.lon) return true;
  if (last.status !== point.status) return true;
  return point.timestamp - last.timestamp > 60_000;
}

export class MapAssetStore {
  public list(assetType?: MapAssetType): MapAssetRecord[] {
    return readIndex().filter((asset) => !assetType || asset.assetType === assetType);
  }

  public get(assetId: string): MapAssetRecord | null {
    return readIndex().find((asset) => asset.assetId === assetId) || null;
  }

  public getByUniqueId(assetType: MapAssetType, uniqueId: string): MapAssetRecord | null {
    const assetId = assetIdFor(assetType, uniqueId);
    return this.get(assetId);
  }

  public getMovement(assetId: string): MapAssetMovementPoint[] {
    const asset = this.get(assetId);
    if (!asset) return [];
    return readMovement(asset);
  }

  public upsert(input: {
    assetType: MapAssetType;
    uniqueId: string;
    label?: string;
    details?: Record<string, unknown>;
    photoPath?: string;
    tracking?: Partial<MapAssetTrackingState>;
  }): MapAssetRecord {
    const assetType = normalizeType(input.assetType);
    const uniqueId = sanitize(input.uniqueId);
    const assetId = assetIdFor(assetType, uniqueId);
    const records = readIndex();
    const existing = records.find((asset) => asset.assetId === assetId);
    const timestamp = now();
    const details = { ...(existing?.details || {}), ...(input.details || {}) };
    const tracking = { ...(existing?.tracking || defaultTracking()), ...(input.tracking || {}) };
    const asset: MapAssetRecord = {
      assetId,
      assetType,
      uniqueId,
      label: input.label || existing?.label || uniqueId.toUpperCase(),
      folderPath: existing?.folderPath || folderFor(assetType, uniqueId),
      databasePath: existing?.databasePath || databasePathFor(assetType, uniqueId),
      photoPath: input.photoPath || existing?.photoPath,
      details,
      tracking,
      data: {
        identity: details,
        telemetry: tracking.telemetry || existing?.data.telemetry || null,
        history: existing?.data.history || [],
        documents: existing?.data.documents || [],
        notes: existing?.data.notes || [],
      },
      createdAt: existing?.createdAt || timestamp,
      updatedAt: timestamp,
    };

    const previousHistory = existing ? readMovement(existing) : [];
    const movementPoint = movementPointFromTracking(tracking);
    const fullHistory = movementPoint && shouldAppendMovement(previousHistory, movementPoint)
      ? [...previousHistory, movementPoint]
      : previousHistory;
    asset.data.history = fullHistory.slice(-MAX_INLINE_HISTORY);

    const next = existing ? records.map((item) => (item.assetId === assetId ? asset : item)) : [...records, asset];
    writeIndex(next);
    writeMovement(asset, fullHistory);
    writeAsset(asset);
    return asset;
  }

  public touchTracking(assetType: MapAssetType, uniqueId: string, telemetry: Record<string, unknown> & { lat?: unknown; lon?: unknown }, source: string): MapAssetRecord {
    const label = typeof telemetry.label === 'string' ? telemetry.label : typeof telemetry.callsign === 'string' ? telemetry.callsign : typeof telemetry.name === 'string' ? telemetry.name : uniqueId.toUpperCase();
    const lat = Number(telemetry.lat);
    const lon = Number(telemetry.lon);
    return this.upsert({
      assetType,
      uniqueId,
      label,
      details: telemetry,
      tracking: {
        enabled: true,
        source,
        status: Number.isFinite(lat) && Number.isFinite(lon) ? 'online' : 'unknown',
        lastSeen: now(),
        lat: Number.isFinite(lat) ? lat : null,
        lon: Number.isFinite(lon) ? lon : null,
        telemetry,
      },
    });
  }
}

export const mapAssetStore = new MapAssetStore();
export { ASSET_ROOT };
