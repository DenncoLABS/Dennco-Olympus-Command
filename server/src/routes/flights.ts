import { Router } from 'express';
import type { AircraftState } from '../types/flights';
import {
  fetchStates as fetchOpenSkyStates,
  fetchTrack as fetchOpenSkyTrack,
} from '../core/source/opensky';
import {
  fetchStates as fetchAdsbLolStates,
  fetchTrack as fetchAdsbLolTrack,
} from '../core/source/adsblol';

const router = Router();

let snapshotCache: { data: object; ts: number; provider: string } | null = null;
const SNAPSHOT_TTL_MS = 5_000;

function selectedProvider(): 'adsblol' | 'opensky' {
  return process.env.FLIGHT_DATA_SOURCE === 'opensky' ? 'opensky' : 'adsblol';
}

function mergeStates(...groups: AircraftState[][]): AircraftState[] {
  const merged = new Map<string, AircraftState>();
  for (const group of groups) {
    for (const aircraft of group) {
      if (!aircraft.icao24) continue;
      const existing = merged.get(aircraft.icao24);
      merged.set(aircraft.icao24, { ...(existing || {}), ...aircraft });
    }
  }
  return [...merged.values()];
}

async function fetchCombinedStates(): Promise<AircraftState[]> {
  const results = await Promise.allSettled([fetchAdsbLolStates(), fetchOpenSkyStates()]);
  const successful = results
    .filter((result): result is PromiseFulfilledResult<AircraftState[]> => result.status === 'fulfilled')
    .map((result) => result.value);

  if (successful.length === 0) {
    const errors = results
      .filter((result): result is PromiseRejectedResult => result.status === 'rejected')
      .map((result) => result.reason?.message || String(result.reason))
      .join('; ');
    throw new Error(errors || 'No live aircraft providers returned data');
  }

  return mergeStates(...successful);
}

router.get('/snapshot', async (_req, res) => {
  const now = Date.now();
  const provider = selectedProvider();
  const providerLabel = provider === 'adsblol' ? 'adsblol+opensky' : 'opensky';

  if (snapshotCache && snapshotCache.provider === providerLabel && now - snapshotCache.ts < SNAPSHOT_TTL_MS) {
    res.setHeader('X-Cache', 'HIT');
    return res.json(snapshotCache.data);
  }

  try {
    const states = provider === 'adsblol' ? await fetchCombinedStates() : await fetchOpenSkyStates();
    const payload = { states, timestamp: now, provider: providerLabel, live: true };
    snapshotCache = { data: payload, ts: now, provider: providerLabel };
    res.setHeader('X-Cache', 'MISS');
    res.json(payload);
  } catch (error: any) {
    const message = error?.message || 'Unknown flight provider error';
    console.warn(`[Flights] ${providerLabel} provider failed: ${message}`);
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
    const useAdsbLol = selectedProvider() === 'adsblol';
    const fetchTrack = useAdsbLol ? fetchAdsbLolTrack : fetchOpenSkyTrack;

    const track = await fetchTrack(req.params.icao24);
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
