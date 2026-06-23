import { Router } from 'express';
import type { AircraftState } from '../types/flights';
import {
  fetchStates as fetchAdsbLolStates,
  fetchTrack as fetchAdsbLolTrack,
} from '../core/source/adsblol';

const router = Router();

let snapshotCache: { data: object; ts: number; provider: string } | null = null;
let lastGoodCombined: { states: AircraftState[]; ts: number; provider: string } | null = null;
const SNAPSHOT_TTL_MS = 5_000;
const LAST_GOOD_TTL_MS = 120_000;
const MIN_GOOD_COUNT = 50;
const SHRINK_RATIO = 0.8;
const PROVIDER_LABEL = 'dennco-flightmesh';

async function fetchDenncoFlightMeshStates(): Promise<AircraftState[]> {
  return fetchAdsbLolStates();
}

function shouldUseLastGood(nextCount: number, now: number): boolean {
  if (!lastGoodCombined) return false;
  if (now - lastGoodCombined.ts > LAST_GOOD_TTL_MS) return false;
  const goodCount = lastGoodCombined.states.length;
  if (goodCount < MIN_GOOD_COUNT) return false;
  if (nextCount < MIN_GOOD_COUNT) return true;
  return nextCount < Math.floor(goodCount * SHRINK_RATIO);
}

router.get('/snapshot', async (_req, res) => {
  const now = Date.now();
  const providerLabel = PROVIDER_LABEL;

  if (snapshotCache && snapshotCache.provider === providerLabel && now - snapshotCache.ts < SNAPSHOT_TTL_MS) {
    res.setHeader('X-Cache', 'HIT');
    return res.json(snapshotCache.data);
  }

  try {
    const states = await fetchDenncoFlightMeshStates();

    if (shouldUseLastGood(states.length, now)) {
      const payload = {
        states: lastGoodCombined!.states,
        timestamp: now,
        provider: `${providerLabel}-last-good`,
        live: true,
        staleGuard: true,
        rejectedCount: states.length,
      };
      snapshotCache = { data: payload, ts: now, provider: providerLabel };
      res.setHeader('X-Cache', 'LAST-GOOD');
      return res.json(payload);
    }

    const payload = { states, timestamp: now, provider: providerLabel, live: true };
    snapshotCache = { data: payload, ts: now, provider: providerLabel };
    if (states.length >= MIN_GOOD_COUNT) {
      lastGoodCombined = { states, ts: now, provider: providerLabel };
    }
    res.setHeader('X-Cache', 'MISS');
    res.json(payload);
  } catch (error: any) {
    const message = error?.message || 'Unknown flight provider error';
    console.warn(`[Flights] ${providerLabel} provider failed: ${message}`);

    if (lastGoodCombined && now - lastGoodCombined.ts < LAST_GOOD_TTL_MS) {
      const payload = {
        states: lastGoodCombined.states,
        timestamp: now,
        provider: `${lastGoodCombined.provider}-last-good`,
        live: false,
        staleGuard: true,
        details: message,
      };
      snapshotCache = { data: payload, ts: now, provider: providerLabel };
      res.setHeader('X-Cache', 'LAST-GOOD-ERROR');
      return res.json(payload);
    }

    res.status(502).json({
      error: 'Live flight provider unavailable',
      provider: providerLabel,
      live: false,
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
