import { AircraftState } from '../../types/flights';
import { Cache } from '../cache';
import { aircraftDb } from '../aircraft_db';

const CACHE_TTL = 3000;
const adsblolCache = new Cache<AircraftState[]>(CACHE_TTL);
let lastGoodStates: AircraftState[] = [];
let lastGoodAt = 0;
const LAST_GOOD_MAX_AGE_MS = 120000;
const MIN_GOOD_COUNT = 50;

const DEFAULT_POINTS = [
  '40.6413,-73.7781,250',
  '33.6407,-84.4277,250',
  '41.9742,-87.9073,250',
  '32.8998,-97.0403,250',
  '34.0522,-118.2437,250',
  '37.6213,-122.3790,250',
  '47.4502,-122.3088,250',
  '25.7959,-80.2870,250',
  '42.2162,-83.3554,250',
  '51.4700,-0.4543,250',
  '48.8566,2.3522,250',
  '52.5200,13.4050,250',
  '35.6762,139.6503,250',
  '-33.8688,151.2093,250',
];

function getAdsbLolUrls(): string[] {
  if (process.env.ADSB_LOL_URL) return [process.env.ADSB_LOL_URL];
  if (process.env.ADSB_LOL_LAT && process.env.ADSB_LOL_LON) {
    const radius = process.env.ADSB_LOL_RADIUS || '250';
    return [`https://api.adsb.lol/v2/point/${process.env.ADSB_LOL_LAT}/${process.env.ADSB_LOL_LON}/${radius}`];
  }
  const points = (process.env.ADSB_LOL_POINTS || DEFAULT_POINTS.join(';'))
    .split(';')
    .map((point) => point.trim())
    .filter(Boolean);
  return points.map((point) => {
    const [lat, lon, radius = '250'] = point.split(',').map((part) => part.trim());
    return `https://api.adsb.lol/v2/point/${lat}/${lon}/${radius}`;
  });
}

function getAircraftArray(data: any): any[] {
  return Array.isArray(data.ac) ? data.ac : Array.isArray(data.aircraft) ? data.aircraft : [];
}

function getNowSeconds(data: any): number {
  if (typeof data.now === 'number') return data.now > 9999999999 ? Math.floor(data.now / 1000) : Math.floor(data.now);
  if (typeof data.ctime === 'number') return data.ctime > 9999999999 ? Math.floor(data.ctime / 1000) : Math.floor(data.ctime);
  return Math.floor(Date.now() / 1000);
}

function useLastGoodIfNeeded(next: AircraftState[]): AircraftState[] {
  const now = Date.now();
  if (next.length >= MIN_GOOD_COUNT) {
    lastGoodStates = next;
    lastGoodAt = now;
    return next;
  }
  if (lastGoodStates.length >= MIN_GOOD_COUNT && now - lastGoodAt < LAST_GOOD_MAX_AGE_MS) {
    return lastGoodStates;
  }
  return next;
}

async function fetchAircraftBatches(): Promise<{ aircraft: any[]; nowSec: number }> {
  const headers = { 'User-Agent': 'Dennco-Olympus-Command/1.0' };
  const results = await Promise.allSettled(
    getAdsbLolUrls().map(async (url) => {
      const response = await fetch(url, { headers });
      if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
      const data = await response.json();
      return { aircraft: getAircraftArray(data), nowSec: getNowSeconds(data) };
    }),
  );

  const merged = new Map<string, any>();
  let nowSec = Math.floor(Date.now() / 1000);

  for (const result of results) {
    if (result.status !== 'fulfilled') continue;
    nowSec = result.value.nowSec;
    for (const aircraft of result.value.aircraft) {
      const id = String(aircraft.hex || aircraft.icao || '').toLowerCase();
      if (id) merged.set(id, aircraft);
    }
  }

  return { aircraft: [...merged.values()], nowSec };
}

export async function fetchStates(): Promise<AircraftState[]> {
  const cached = adsblolCache.get();
  if (cached) return cached;

  const { aircraft, nowSec } = await fetchAircraftBatches();
  if (aircraft.length === 0) {
    if (lastGoodStates.length > 0 && Date.now() - lastGoodAt < LAST_GOOD_MAX_AGE_MS) return lastGoodStates;
    const staleCached = adsblolCache.get();
    if (staleCached && staleCached.length > 0) return staleCached;
    throw new Error('ADSB.lol returned no aircraft from configured regions');
  }

  const parsed: AircraftState[] = aircraft
    .map((s: any) => {
      const icao24 = String(s.hex || s.icao || 'unknown').toLowerCase();
      const baroAltitude =
        typeof s.alt_baro === 'number'
          ? s.alt_baro
          : typeof s.altitude === 'number'
            ? s.altitude
            : s.alt_baro === 'ground'
              ? 0
              : null;

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
      if (details) {
        if (details.registration) baseState.registration = details.registration;
        if (details.manufacturerName) baseState.manufacturerName = details.manufacturerName;
        if (details.model) baseState.model = details.model;
        if (details.operator) baseState.operator = details.operator;
        if (details.typecode) baseState.typecode = details.typecode;
        if (details.built) baseState.built = details.built;
      } else {
        if (s.r) baseState.registration = s.r;
        if (s.t) baseState.typecode = s.t;
        if (s.desc) baseState.model = s.desc;
      }

      return baseState;
    })
    .filter((a: AircraftState) => a.lat !== 0 && a.lon !== 0 && a.lat != null && a.lon != null && !Number.isNaN(a.lat) && !Number.isNaN(a.lon));

  const guarded = useLastGoodIfNeeded(parsed);
  adsblolCache.set(guarded);
  return guarded;
}

export async function fetchTrack(icao24: string): Promise<any> {
  const response = await fetch(`https://api.adsb.lol/v2/icao/${icao24}`, {
    headers: { 'User-Agent': 'Dennco-Olympus-Command/1.0' },
  });
  if (!response.ok) throw new Error(`ADSB.lol Tracks API Error: ${response.status} ${response.statusText}`);

  const data = await response.json();
  const ac = getAircraftArray(data);
  if (ac.length === 0) throw new Error('404');

  const s = ac[0];
  const time = getNowSeconds(data);
  if (s.lat == null || s.lon == null || Number.isNaN(s.lat) || Number.isNaN(s.lon)) {
    throw new Error('404, no valid coordinates found');
  }

  return {
    icao24,
    startTime: time,
    endTime: time,
    path: [[time, s.lat, s.lon, s.alt_baro === 'ground' ? 0 : s.alt_baro, s.track || 0, s.alt_baro === 'ground']],
  };
}
