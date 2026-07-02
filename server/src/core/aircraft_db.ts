import fs from 'fs';
import path from 'path';
import { mapAssetStore, type MapAssetRecord } from './map_assets';
const duckdb = require('duckdb');

export interface AircraftDetails {
  icao24: string;
  registration?: string;
  manufacturerName?: string;
  model?: string;
  operator?: string;
  typecode?: string;
  built?: string;
}

export type AircraftAsset = MapAssetRecord;

const PARQUET_PATH = path.resolve(
  __dirname,
  '../../src/Data/aircraft-database-complete-2025-08.parquet',
);
const JSON_CACHE_PATH = `${PARQUET_PATH}.cache.json`;

function normalizeIcao24(value: string): string {
  return value.trim().toLowerCase();
}

function labelFor(details: AircraftDetails): string {
  return details.registration || details.icao24.toUpperCase();
}

class AircraftDatabase {
  private isLoaded = false;
  private db = new Map<string, AircraftDetails>();

  public async load(): Promise<void> {
    if (this.isLoaded) return;
    if (this.tryLoadFromCache()) return;
    if (!fs.existsSync(PARQUET_PATH)) {
      console.warn(`Aircraft DB not found at: ${PARQUET_PATH}. Extended details will be unavailable.`);
      this.isLoaded = true;
      return;
    }
    await this.parseParquet();
    this.saveCache();
  }

  private tryLoadFromCache(): boolean {
    try {
      if (!fs.existsSync(JSON_CACHE_PATH)) return false;
      const sourceMtime = fs.statSync(PARQUET_PATH).mtimeMs;
      const cacheMtime = fs.statSync(JSON_CACHE_PATH).mtimeMs;
      if (cacheMtime < sourceMtime) {
        console.log('Aircraft DB cache is stale, rebuilding from Parquet...');
        return false;
      }
      console.log('Loading Aircraft Database from JSON cache...');
      const t = Date.now();
      const entries: [string, AircraftDetails][] = JSON.parse(fs.readFileSync(JSON_CACHE_PATH, 'utf8'));
      this.db = new Map(entries);
      this.isLoaded = true;
      console.log(`Aircraft Database loaded ${this.db.size} records from cache in ${Date.now() - t}ms`);
      return true;
    } catch (e) {
      console.warn('Failed to load Aircraft DB cache, falling back to Parquet:', e);
      return false;
    }
  }

  private saveCache(): void {
    try {
      fs.writeFileSync(JSON_CACHE_PATH, JSON.stringify(Array.from(this.db.entries())));
      console.log('Aircraft DB JSON cache written.');
    } catch (e) {
      console.warn('Failed to write Aircraft DB cache (non-fatal):', e);
    }
  }

  private async parseParquet(): Promise<void> {
    console.log('Parsing Aircraft Database Parquet with DuckDB (first run only)...');
    const t = Date.now();
    return new Promise((resolve, reject) => {
      const db = new duckdb.Database(':memory:');
      db.all(`SELECT * FROM '${PARQUET_PATH}'`, (err: any, rows: any[]) => {
        if (err) {
          console.error('Error reading Parquet with DuckDB:', err);
          return reject(err);
        }
        let count = 0;
        for (const record of rows) {
          const icao24 = record.icao24?.trim().toLowerCase();
          if (!icao24) continue;
          const details: AircraftDetails = { icao24 };
          if (record.registration) details.registration = record.registration.trim();
          if (record.manufacturerName) details.manufacturerName = record.manufacturerName.trim();
          else if (record.manufacturerIcao) details.manufacturerName = String(record.manufacturerIcao).trim();
          if (record.model) details.model = record.model.trim();
          const operator = (record.operator || record.owner)?.trim();
          if (operator) details.operator = operator;
          if (record.typecode) details.typecode = record.typecode.trim();
          if (record.built) details.built = String(record.built).trim();
          this.db.set(icao24, details);
          count++;
        }
        this.isLoaded = true;
        console.log(`Aircraft Database parsed ${count} records via DuckDB in ${Date.now() - t}ms`);
        resolve();
      });
    });
  }

  public getDetails(icao24: string): AircraftDetails | undefined {
    return this.db.get(normalizeIcao24(icao24));
  }

  public getAsset(icao24: string, telemetry: Record<string, unknown> | null = null): AircraftAsset {
    const key = normalizeIcao24(icao24);
    const details = this.getDetails(key) || { icao24: key };
    const tracking = telemetry
      ? {
          enabled: true,
          source: 'dennco-flightmesh',
          status: 'online' as const,
          lastSeen: Date.now(),
          lat: typeof telemetry.lat === 'number' ? telemetry.lat : null,
          lon: typeof telemetry.lon === 'number' ? telemetry.lon : null,
          telemetry,
        }
      : undefined;
    return mapAssetStore.upsert({
      assetType: 'aircraft',
      uniqueId: key,
      label: labelFor(details),
      details,
      tracking,
    });
  }

  public getInfo() {
    return { records: this.db.size, source: PARQUET_PATH, cache: JSON_CACHE_PATH, assetRoot: '/var/lib/dennco/olympus-command/assets', loaded: this.isLoaded };
  }

  public search(query: string, limit = 50): AircraftAsset[] {
    const q = query.trim().toLowerCase();
    const max = Math.max(1, Math.min(limit, 200));
    const results: AircraftAsset[] = [];
    for (const item of this.db.values()) {
      if (!q || item.icao24.includes(q) || item.registration?.toLowerCase().includes(q) || item.manufacturerName?.toLowerCase().includes(q) || item.model?.toLowerCase().includes(q) || item.operator?.toLowerCase().includes(q) || item.typecode?.toLowerCase().includes(q)) {
        results.push(this.getAsset(item.icao24));
        if (results.length >= max) break;
      }
    }
    return results;
  }
}

export const aircraftDb = new AircraftDatabase();
