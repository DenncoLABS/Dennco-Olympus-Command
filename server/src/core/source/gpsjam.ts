import fs from 'fs';
import path from 'path';
import csvParser from 'csv-parser';
import { Cache } from '../cache';

/**
 * GPS Jamming Data Source Integration (gpsjam.org)
 *
 * Data Schema Documentation:
 *
 * Manifest (manifest.csv):
 * - date: YYYY-MM-DD format
 * - suspect: boolean indicating anomalous/suspicious days
 * - num_bad_aircraft_hexes: Count of problematic aircraft identifiers
 *
 * Daily Datasets (YYYY-MM-DD-h3_4.csv):
 * - hex: H3 geospatial index (resolution 4, ~1,770 km² per cell)
 * - count_good_aircraft: Valid aircraft detections (clean ADS-B signals)
 * - count_bad_aircraft: Invalid/interfered detections (GPS interference indicator)
 *
 * The data tracks ADS-B aircraft tracking quality per H3 cell.
 * Higher count_bad_aircraft values indicate stronger GPS interference.
 */

const BASE_URL = 'https://gpsjam.org/data';
const DATA_DIR = path.resolve(__dirname, '../../Data/gpsjam');
const MANIFEST_PATH = path.join(DATA_DIR, 'manifest.csv');
const CACHE_TTL = 3600000; // 1 hour for processed data
const DOWNLOAD_CACHE_TTL = 86400000; // 24 hours for raw downloads

// Interfaces
export interface ManifestEntry {
  date: string;
  suspect: boolean;
  num_bad_aircraft_hexes: number;
}

export interface GPSJammingCell {
  hex: string;
  count_good_aircraft: number;
  count_bad_aircraft: number;
  interference_ratio: number; // calculated: bad / (good + bad)
}

export interface GPSJammingDataset {
  date: string;
  cells: GPSJammingCell[];
  suspect: boolean;
  totalCells: number;
}

// Caches
const manifestCache = new Cache<ManifestEntry[]>(CACHE_TTL);
const datasetCache = new Map<string, Cache<GPSJammingDataset>>();

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

/**
 * Fetch and parse the manifest.csv file
 * Lists all available datasets with metadata
 */
export async function fetchManifest(): Promise<ManifestEntry[]> {
  const cached = manifestCache.get();
  if (cached) return cached;

  console.log('[GPSJam] Fetching manifest...');

  try {
    // Download manifest
    const response = await fetch(`${BASE_URL}/manifest.csv`);
    if (!response.ok) {
      throw new Error(`Failed to fetch manifest: ${response.status} ${response.statusText}`);
    }

    const csvText = await response.text();

    // Save to local cache
    fs.writeFileSync(MANIFEST_PATH, csvText);

    // Parse CSV
    const entries = await parseManifestCSV(csvText);

    manifestCache.set(entries);
    console.log(`[GPSJam] Manifest loaded with ${entries.length} datasets`);

    return entries;
  } catch (error) {
    console.error('[GPSJam] Error fetching manifest:', error);

    // Try to load from local cache
    if (fs.existsSync(MANIFEST_PATH)) {
      console.warn('[GPSJam] Using cached manifest file');
      const csvText = fs.readFileSync(MANIFEST_PATH, 'utf-8');
      return parseManifestCSV(csvText);
    }

    throw error;
  }
}

/**
 * Parse manifest CSV text into structured entries
 */
function parseManifestCSV(csvText: string): Promise<ManifestEntry[]> {
  return new Promise((resolve, reject) => {
    const entries: ManifestEntry[] = [];
    const stream = require('stream');
    const readable = stream.Readable.from([csvText]);

    readable
      .pipe(csvParser())
      .on('data', (row: any) => {
        entries.push({
          date: row.date?.trim() || '',
          suspect: row.suspect === 'true' || row.suspect === 'True',
          num_bad_aircraft_hexes: parseInt(row.num_bad_aircraft_hexes) || 0,
        });
      })
      .on('end', () => resolve(entries))
      .on('error', reject);
  });
}

/**
 * Download and parse a specific dataset by date
 * @param date - Date in YYYY-MM-DD format
 */
export async function fetchDataset(date: string): Promise<GPSJammingDataset> {
  // Check cache first
  if (!datasetCache.has(date)) {
    datasetCache.set(date, new Cache<GPSJammingDataset>(CACHE_TTL));
  }

  const cache = datasetCache.get(date)!;
  const cached = cache.get();
  if (cached) return cached;

  console.log(`[GPSJam] Fetching dataset for ${date}...`);

  const filename = `${date}-h3_4.csv`;
  const localPath = path.join(DATA_DIR, filename);

  try {
    let csvText: string;

    // Check if we have a recent local copy
    if (fs.existsSync(localPath)) {
      const stats = fs.statSync(localPath);
      const age = Date.now() - stats.mtimeMs;

      if (age < DOWNLOAD_CACHE_TTL) {
        console.log(`[GPSJam] Using cached dataset for ${date}`);
        csvText = fs.readFileSync(localPath, 'utf-8');
      } else {
        // Download fresh copy
        csvText = await downloadDataset(date, filename, localPath);
      }
    } else {
      // Download if not cached
      csvText = await downloadDataset(date, filename, localPath);
    }

    // Parse the dataset
    const cells = await parseDatasetCSV(csvText);

    // Get suspect status from manifest
    const manifest = await fetchManifest();
    const manifestEntry = manifest.find((e) => e.date === date);

    const dataset: GPSJammingDataset = {
      date,
      cells,
      suspect: manifestEntry?.suspect || false,
      totalCells: cells.length,
    };

    cache.set(dataset);
    return dataset;
  } catch (error) {
    console.error(`[GPSJam] Error fetching dataset for ${date}:`, error);
    throw error;
  }
}

/**
 * Download a dataset file from gpsjam.org
 */
async function downloadDataset(date: string, filename: string, localPath: string): Promise<string> {
  console.log(`[GPSJam] Downloading ${filename}...`);

  const response = await fetch(`${BASE_URL}/${filename}`);
  if (!response.ok) {
    throw new Error(`Failed to download ${filename}: ${response.status} ${response.statusText}`);
  }

  const csvText = await response.text();

  // Save to local cache
  fs.writeFileSync(localPath, csvText);
  console.log(`[GPSJam] Downloaded and cached ${filename}`);

  return csvText;
}

/**
 * Parse dataset CSV into structured cell data
 */
function parseDatasetCSV(csvText: string): Promise<GPSJammingCell[]> {
  return new Promise((resolve, reject) => {
    const cells: GPSJammingCell[] = [];
    const stream = require('stream');
    const readable = stream.Readable.from([csvText]);

    readable
      .pipe(csvParser())
      .on('data', (row: any) => {
        const good = parseInt(row.count_good_aircraft) || 0;
        const bad = parseInt(row.count_bad_aircraft) || 0;
        const total = good + bad;

        cells.push({
          hex: row.hex?.trim() || '',
          count_good_aircraft: good,
          count_bad_aircraft: bad,
          interference_ratio: total > 0 ? bad / total : 0,
        });
      })
      .on('end', () => resolve(cells))
      .on('error', reject);
  });
}

/**
 * Get the latest available dataset date
 */
export async function getLatestDate(): Promise<string> {
  const manifest = await fetchManifest();
  if (manifest.length === 0) {
    throw new Error('No datasets available in manifest');
  }

  // Manifest is typically sorted by date, get the last entry
  return manifest[manifest.length - 1].date;
}

/**
 * Get all available dates
 */
export async function getAvailableDates(): Promise<string[]> {
  const manifest = await fetchManifest();
  return manifest.map((entry) => entry.date);
}

/**
 * Query GPS jamming data with filters
 * @param options - Query options
 */
export interface QueryOptions {
  date?: string; // Specific date or latest if not provided
  bbox?: [number, number, number, number]; // [minLon, minLat, maxLon, maxLat]
  h3Indices?: string[]; // Filter by specific H3 indices
  minInterference?: number; // Minimum interference ratio (0-1)
}

export async function queryGPSJamming(options: QueryOptions = {}): Promise<GPSJammingDataset> {
  // Get date (use latest if not specified)
  const date = options.date || (await getLatestDate());

  // Fetch the full dataset
  let dataset = await fetchDataset(date);

  // Apply filters
  let filteredCells = dataset.cells;

  // Filter by H3 indices if provided
  if (options.h3Indices && options.h3Indices.length > 0) {
    const h3Set = new Set(options.h3Indices);
    filteredCells = filteredCells.filter((cell) => h3Set.has(cell.hex));
  }

  // Filter by minimum interference
  if (options.minInterference !== undefined) {
    const minInterference = options.minInterference;
    filteredCells = filteredCells.filter((cell) => cell.interference_ratio >= minInterference);
  }

  // Note: bbox filtering would require H3 library to convert H3 indices to lat/lon
  // For now, this can be done client-side or with h3-js library integration

  return {
    ...dataset,
    cells: filteredCells,
    totalCells: filteredCells.length,
  };
}

/**
 * Get interference statistics for a dataset
 */
export async function getInterferenceStats(date?: string) {
  const targetDate = date || (await getLatestDate());
  const dataset = await fetchDataset(targetDate);

  const stats = {
    date: targetDate,
    totalCells: dataset.totalCells,
    suspect: dataset.suspect,
    cellsWithInterference: 0,
    avgInterferenceRatio: 0,
    maxInterferenceRatio: 0,
    totalBadAircraft: 0,
    totalGoodAircraft: 0,
  };

  let sumRatio = 0;

  for (const cell of dataset.cells) {
    if (cell.count_bad_aircraft > 0) {
      stats.cellsWithInterference++;
    }
    stats.totalBadAircraft += cell.count_bad_aircraft;
    stats.totalGoodAircraft += cell.count_good_aircraft;
    sumRatio += cell.interference_ratio;
    stats.maxInterferenceRatio = Math.max(stats.maxInterferenceRatio, cell.interference_ratio);
  }

  stats.avgInterferenceRatio = dataset.totalCells > 0 ? sumRatio / dataset.totalCells : 0;

  return stats;
}

/**
 * Backfill missing datasets from manifest
 * Downloads all datasets that aren't cached locally
 */
export async function backfillDatasets(limit?: number): Promise<number> {
  console.log('[GPSJam] Starting backfill...');

  const manifest = await fetchManifest();
  const missingDates: string[] = [];

  // Find missing datasets
  for (const entry of manifest) {
    const filename = `${entry.date}-h3_4.csv`;
    const localPath = path.join(DATA_DIR, filename);

    if (!fs.existsSync(localPath)) {
      missingDates.push(entry.date);
    }
  }

  console.log(`[GPSJam] Found ${missingDates.length} missing datasets`);

  // Apply limit if specified
  const datesToFetch = limit ? missingDates.slice(-limit) : missingDates;

  let downloaded = 0;
  for (const date of datesToFetch) {
    try {
      await fetchDataset(date);
      downloaded++;
      console.log(`[GPSJam] Backfilled ${date} (${downloaded}/${datesToFetch.length})`);
    } catch (error) {
      console.error(`[GPSJam] Failed to backfill ${date}:`, error);
    }
  }

  console.log(`[GPSJam] Backfill complete. Downloaded ${downloaded} datasets.`);
  return downloaded;
}
