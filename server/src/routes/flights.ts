import { Router } from 'express';
import type { AircraftState } from '../types/flights';
import {
  fetchStates as fetchAdsbLolStates,
  fetchTrack as fetchAdsbLolTrack,
} from '../core/source/adsblol';

const router = Router();

let snapshotCache: { data: object; ts: number; provider: string; regionKey: string } | null = null;
let lastGoodCombined: { states: AircraftState[]; ts: number; provider: string; regionKey: string } | null = null;
const SNAPSHOT_TTL_MS = 5_000;
const LAST_GOOD_TTL_MS = 120_000;
const MIN_GOOD_COUNT = 50;
const SHRINK_RATIO = 0.8;
const PROVIDER_LABEL = 'dennco-flightmesh';

function parseRegionIds(value: unknown): string[] {
  if (typeof value !== 'string') return [];
  return value
    .split(',')
    .map((region) => region.trim())
    .filter((region) => /^[a-z0-9-]{2,40}$/i.test(region));
}

async function fetchDenncoFlightMeshStates(regionIds: string[]): Promise<AircraftState[]> {
  return fetchAdsbLolStates(regionIds);
}

function shouldUseLastGood(nextCount: number, now: number, regionKey: string): boolean {
  if (!lastGoodCombined) return false;
  if (lastGoodCombined.regionKey !== regionKey) return false;
  if (now - lastGoodCombined.ts > LAST_GOOD_TTL_MS) return false;
  const goodCount = lastGoodCombined.states.length;
  if (goodCount < MIN_GOOD_COUNT) return false;
  if (nextCount < MIN_GOOD_COUNT) return true;
  return nextCount < Math.floor(goodCount * SHRINK_RATIO);
}

router.get('/snapshot', async (req, res) => {
  const now = Date.now();
  const regionIds = parseRegionIds(req.query.regions);
  const regionKey = regionIds.slice().sort().join(',');
  const providerLabel = regionIds.length ? `${PROVIDER_LABEL}-regional` : `${PROVIDER_LABEL}-no-active-radar`;

  if (!regionIds.length) {
    const payload = {
      states: [],
      timestamp: now,
      provider: providerLabel,
      live: true,
      radarRegions: [],
      scanActive: false,
      details: 'No radar region selected. Activate one or more radar pins, or use ALL.',
    };
    snapshotCache = { data: payload, ts: now, provider: providerLabel, regionKey: 'none' };
    res.setHeader('X-Cache', 'NO-ACTIVE-RADAR');
    return res.json(payload);
  }

  if (snapshotCache && snapshotCache.provider === providerLabel && snapshotCache.regionKey === regionKey && now - snapshotCache.ts < SNAPSHOT_TTL_MS) {
    res.setHeader('X-Cache', 'HIT');
    return res.json(snapshotCache.data);
  }

  try {
    const states = await fetchDenncoFlightMeshStates(regionIds);

    if (shouldUseLastGood(states.length, now, regionKey)) {
      const payload = {
        states: lastGoodCombined!.states,
        timestamp: now,
        provider: `${providerLabel}-last-good`,
        live: true,
        radarRegions: regionIds,
        scanActive: true,
        staleGuard: true,
        rejectedCount: states.length,
      };
      snapshotCache = { data: payload, ts: now, provider: providerLabel, regionKey };
      res.setHeader('X-Cache', 'LAST-GOOD');
      return res.json(payload);
    }

    const payload = { states, timestamp: now, provider: providerLabel, live: true, radarRegions: regionIds, scanActive: true };
    snapshotCache = { data: payload, ts: now, provider: providerLabel, regionKey };
    if (states.length >= MIN_GOOD_COUNT) {
      lastGoodCombined = { states, ts: now, provider: providerLabel, regionKey };
    }
    res.setHeader('X-Cache', 'MISS');
    res.json(payload);
  } catch (error: any) {
    const message = error?.message || 'Unknown flight provider error';
    console.warn(`[Flights] ${providerLabel} provider failed: ${message}`);

    if (lastGoodCombined && lastGoodCombined.regionKey === regionKey && now - lastGoodCombined.ts < LAST_GOOD_TTL_MS) {
      const payload = {
        states: lastGoodCombined.states,
        timestamp: now,
        provider: `${lastGoodCombined.provider}-last-good`,
        live: false,
        radarRegions: regionIds,
        scanActive: true,
        staleGuard: true,
        details: message,
      };
      snapshotCache = { data: payload, ts: now, provider: providerLabel, regionKey };
      res.setHeader('X-Cache', 'LAST-GOOD-ERROR');
      return res.json(payload);
    }

    res.status(502).json({
      error: 'Live flight provider unavailable',
      provider: providerLabel,
      live: false,
      radarRegions: regionIds,
      scanActive: true,
      states: [],
      timestamp: now,
      details: message,
    });
  }
});

router.get('/track/:icao24', async (req, res) => {
  try {
    const track = await fetchAdsbLolTrack(req.params.icao24);
    res.json(track);
  } catch (error: any) {
    console.error('Track error:', error.message);
    if (error.message.includes('404')) {
      return res.status(404).json({ error: 'Not Found' });
    }
    res.status(502).json({ error: 'Upstream Provider Error', details: error.message });
  }
});

export default router;
