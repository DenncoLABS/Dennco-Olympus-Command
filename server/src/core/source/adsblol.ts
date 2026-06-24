import { AircraftState } from '../../types/flights';
import { aircraftDb } from '../aircraft_db';

const CACHE_TTL = 5000;
const NODE_STALE_TTL_MS = 120000;
const MIN_NODE_GOOD_COUNT = 1;

const REGION_POINTS: Record<string, string> = {
  northeast: '40.8,-74.2,250',
  'new-england': '42.3,-71.0,250',
  'mid-atlantic': '38.9,-77.2,250',
  carolinas: '35.2,-80.9,250',
  southeast: '33.6,-84.4,250',
  florida: '27.7,-81.7,250',
  'great-lakes': '42.7,-84.9,250',
  'upper-midwest': '44.9,-93.2,250',
  'central-plains': '39.1,-95.7,250',
  'lower-plains': '35.5,-97.5,250',
  'texas-gulf': '31.3,-97.0,250',
  'south-texas': '29.4,-98.5,250',
  rockies: '39.8,-104.7,250',
  'northern-rockies': '45.8,-108.5,250',
  southwest: '34.0,-118.2,250',
  'desert-southwest': '33.4,-112.1,250',
  'bay-area': '37.6,-122.3,250',
  'pacific-nw': '47.5,-122.3,250',
  alaska: '61.2,-149.9,250',
  hawaii: '21.3,-157.9,250',
  'bc-vancouver': '49.2,-123.1,250',
  'alberta-prairie': '51.0,-114.1,250',
  'manitoba-ontario': '49.9,-97.1,250',
  'ontario-quebec': '43.7,-79.6,250',
  'atlantic-canada': '44.9,-63.5,250',
  'uk-ireland': '52.0,-1.5,250',
  'western-europe': '49.8,5.5,250',
  'japan-korea': '35.7,139.7,250',
  'australia-east': '-33.9,151.2,250',
};

const REGION_FALLBACKS: Record<string, string[]> = {
  northeast: ['mid-atlantic', 'new-england'],
  'new-england': ['northeast', 'mid-atlantic'],
  'mid-atlantic': ['northeast', 'carolinas'],
  carolinas: ['southeast', 'mid-atlantic'],
  southeast: ['carolinas', 'florida'],
  florida: ['southeast'],
  'great-lakes': ['upper-midwest', 'ontario-quebec'],
  'upper-midwest': ['great-lakes', 'central-plains'],
  'central-plains': ['lower-plains', 'upper-midwest'],
  'lower-plains': ['central-plains', 'texas-gulf'],
  'texas-gulf': ['south-texas', 'lower-plains'],
  'south-texas': ['texas-gulf'],
  rockies: ['northern-rockies', 'desert-southwest'],
  'northern-rockies': ['rockies', 'pacific-nw'],
  southwest: ['desert-southwest', 'bay-area'],
  'desert-southwest': ['southwest', 'rockies'],
  'bay-area': ['southwest', 'pacific-nw'],
  'pacific-nw': ['bay-area', 'northern-rockies', 'bc-vancouver'],
  'bc-vancouver': ['pacific-nw'],
  'alberta-prairie': ['manitoba-ontario', 'northern-rockies'],
  'manitoba-ontario': ['ontario-quebec', 'alberta-prairie'],
  'ontario-quebec': ['great-lakes', 'atlantic-canada'],
  'atlantic-canada': ['ontario-quebec', 'new-england'],
};

type RadarNodeCache = { states: AircraftState[]; ts: number; lastGoodStates: AircraftState[]; lastGoodAt: number; error?: string };
const nodeCache = new Map<string, RadarNodeCache>();

function pointToUrl(point: string): string | null {
  const [lat, lon, radius = '250'] = point.split(',').map((part) => part.trim());
  const latNum = Number(lat);
  const lonNum = Number(lon);
  const radiusNum = Number(radius);
  if (!Number.isFinite(latNum) || !Number.isFinite(lonNum) || !Number.isFinite(radiusNum)) return null;
  if (Math.abs(latNum) > 90 || Math.abs(lonNum) > 180 || radiusNum <= 0) return null;
  return `https://api.adsb.lol/v2/point/${latNum}/${lonNum}/${Math.min(radiusNum, 250)}`;
}

function getAircraftArray(data: any): any[] { return Array.isArray(data.ac) ? data.ac : Array.isArray(data.aircraft) ? data.aircraft : []; }
function getNowSeconds(data: any): number { if (typeof data.now === 'number') return data.now > 9999999999 ? Math.floor(data.now / 1000) : Math.floor(data.now); if (typeof data.ctime === 'number') return data.ctime > 9999999999 ? Math.floor(data.ctime / 1000) : Math.floor(data.ctime); return Math.floor(Date.now() / 1000); }

async function fetchOneRegion(regionId: string): Promise<{ aircraft: any[]; nowSec: number }> {
  const point = REGION_POINTS[regionId];
  if (!point) throw new Error(`Unknown radar region: ${regionId}`);
  const url = pointToUrl(point);
  if (!url) throw new Error(`Invalid radar region point: ${regionId}`);
  const response = await fetch(url, { headers: { 'User-Agent': 'Dennco-Olympus-Command/1.0' } });
  if (!response.ok) throw new Error(`${regionId}: ${response.status} ${response.statusText}`);
  const data = await response.json();
  return { aircraft: getAircraftArray(data), nowSec: getNowSeconds(data) };
}

function parseAircraft(aircraft: any[], nowSec: number): AircraftState[] {
  return aircraft.map((s: any) => {
    const icao24 = String(s.hex || s.icao || 'unknown').toLowerCase();
    const baroAltitude = typeof s.alt_baro === 'number' ? s.alt_baro : typeof s.altitude === 'number' ? s.altitude : s.alt_baro === 'ground' ? 0 : null;
    const baseState: AircraftState = {
      icao24,
      callsign: s.flight ? String(s.flight).trim() : s.call ? String(s.call).trim() : null,
      originCountry: s.country || null,
      lastContact: nowSec - (typeof s.seen === 'number' ? s.seen : 0),
      lon: typeof s.lon === 'number' ? s.lon : 0,
      lat: typeof s.lat === 'number' ? s.lat : 0,
      baroAltitude,
      onGround: s.alt_baro === 'ground' || s.ground === true,
      velocity: typeof s.gs === 'number' ? s.gs : typeof s.speed === 'number' ? s.speed : null,
      heading: typeof s.track === 'number' ? s.track : typeof s.heading === 'number' ? s.heading : null,
      verticalRate: typeof s.baro_rate === 'number' ? s.baro_rate : null,
      geoAltitude: typeof s.alt_geom === 'number' ? s.alt_geom : null,
      squawk: s.squawk || null,
      spi: s.spi === 1 || s.spi === true,
      positionSource: 0,
      category: typeof s.category === 'string' ? parseInt(s.category.replace(/[^0-9]/g, '')) || 0 : 0,
      mach: typeof s.mach === 'number' ? s.mach : undefined,
      true_heading: typeof s.true_heading === 'number' ? s.true_heading : undefined,
      mag_heading: typeof s.mag_heading === 'number' ? s.mag_heading : undefined,
      oat: typeof s.oat === 'number' ? s.oat : undefined,
      tat: typeof s.tat === 'number' ? s.tat : undefined,
      roll: typeof s.roll === 'number' ? s.roll : undefined,
      ias: typeof s.ias === 'number' ? s.ias : undefined,
      tas: typeof s.tas === 'number' ? s.tas : undefined,
      wd: typeof s.wd === 'number' ? s.wd : undefined,
      ws: typeof s.ws === 'number' ? s.ws : undefined,
      nav_altitude_mcp: typeof s.nav_altitude_mcp === 'number' ? s.nav_altitude_mcp : undefined,
      nav_heading: typeof s.nav_heading === 'number' ? s.nav_heading : undefined,
      nav_qnh: typeof s.nav_qnh === 'number' ? s.nav_qnh : undefined,
      nav_modes: Array.isArray(s.nav_modes) ? s.nav_modes : undefined,
      rc: typeof s.rc === 'number' ? s.rc : undefined,
      rssi: typeof s.rssi === 'number' ? s.rssi : undefined,
      emergency: typeof s.emergency === 'string' && s.emergency !== 'none' ? s.emergency : undefined,
    };
    const details = aircraftDb.getDetails(icao24);
    if (details) { if (details.registration) baseState.registration = details.registration; if (details.manufacturerName) baseState.manufacturerName = details.manufacturerName; if (details.model) baseState.model = details.model; if (details.operator) baseState.operator = details.operator; if (details.typecode) baseState.typecode = details.typecode; if (details.built) baseState.built = details.built; }
    else { if (s.r) baseState.registration = s.r; if (s.t) baseState.typecode = s.t; if (s.desc) baseState.model = s.desc; }
    return baseState;
  }).filter((a: AircraftState) => a.lat !== 0 && a.lon !== 0 && a.lat != null && a.lon != null && !Number.isNaN(a.lat) && !Number.isNaN(a.lon));
}

async function fetchRadarNode(regionId: string, allowFallback = true): Promise<AircraftState[]> {
  const now = Date.now();
  const cached = nodeCache.get(regionId);
  if (cached && now - cached.ts < CACHE_TTL) return cached.states;
  try {
    const { aircraft, nowSec } = await fetchOneRegion(regionId);
    let parsed = parseAircraft(aircraft, nowSec);
    if (allowFallback && parsed.length === 0) {
      for (const fallbackRegion of REGION_FALLBACKS[regionId] || []) {
        const fallbackStates = await fetchRadarNode(fallbackRegion, false);
        if (fallbackStates.length) { parsed = fallbackStates; break; }
      }
    }
    const lastGoodStates = parsed.length >= MIN_NODE_GOOD_COUNT ? parsed : cached?.lastGoodStates || [];
    const lastGoodAt = parsed.length >= MIN_NODE_GOOD_COUNT ? now : cached?.lastGoodAt || 0;
    nodeCache.set(regionId, { states: parsed, ts: now, lastGoodStates, lastGoodAt });
    return parsed;
  } catch (error: any) {
    const message = error?.message || `Radar node failed: ${regionId}`;
    if (cached?.lastGoodStates?.length && now - cached.lastGoodAt < NODE_STALE_TTL_MS) { nodeCache.set(regionId, { ...cached, states: cached.lastGoodStates, ts: now, error: message }); return cached.lastGoodStates; }
    nodeCache.set(regionId, { states: [], ts: now, lastGoodStates: [], lastGoodAt: 0, error: message });
    return [];
  }
}

export async function fetchStates(regionIds: string[] = []): Promise<AircraftState[]> {
  const selectedRegionIds = [...new Set(regionIds.filter((id) => REGION_POINTS[id]))];
  if (!selectedRegionIds.length) return [];
  const results = await Promise.all(selectedRegionIds.map((regionId) => fetchRadarNode(regionId)));
  const merged = new Map<string, AircraftState>();
  for (const nodeStates of results) for (const aircraft of nodeStates) { const existing = merged.get(aircraft.icao24); if (!existing || (aircraft.lastContact || 0) > (existing.lastContact || 0)) merged.set(aircraft.icao24, aircraft); }
  return [...merged.values()];
}

export async function fetchTrack(icao24: string): Promise<any> {
  const response = await fetch(`https://api.adsb.lol/v2/icao/${icao24}`, { headers: { 'User-Agent': 'Dennco-Olympus-Command/1.0' } });
  if (!response.ok) throw new Error(`ADSB.lol Tracks API Error: ${response.status} ${response.statusText}`);
  const data = await response.json();
  const ac = getAircraftArray(data);
  if (ac.length === 0) throw new Error('404');
  const s = ac[0];
  const time = getNowSeconds(data);
  if (s.lat == null || s.lon == null || Number.isNaN(s.lat) || Number.isNaN(s.lon)) throw new Error('404, no valid coordinates found');
  return { icao24, startTime: time, endTime: time, path: [[time, s.lat, s.lon, s.alt_baro === 'ground' ? 0 : s.alt_baro, s.track || 0, s.alt_baro === 'ground']] };
}
