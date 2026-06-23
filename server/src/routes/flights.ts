import { Router } from 'express';
import {
  fetchStates as fetchOpenSkyStates,
  fetchTrack as fetchOpenSkyTrack,
} from '../core/source/opensky';
import {
  fetchStates as fetchAdsbLolStates,
  fetchTrack as fetchAdsbLolTrack,
} from '../core/source/adsblol';

const router = Router();

// Simple in-memory TTL cache for the snapshot endpoint.
let snapshotCache: { data: object; ts: number; provider: string } | null = null;
const SNAPSHOT_TTL_MS = 5_000;

function selectedProvider(): 'adsblol' | 'opensky' {
  return process.env.FLIGHT_DATA_SOURCE === 'opensky' ? 'opensky' : 'adsblol';
}

router.get('/snapshot', async (_req, res) => {
  const now = Date.now();
  const provider = selectedProvider();
  if (snapshotCache && snapshotCache.provider === provider && now - snapshotCache.ts < SNAPSHOT_TTL_MS) {
    res.setHeader('X-Cache', 'HIT');
    return res.json(snapshotCache.data);
  }

  try {
    const fetchStates = provider === 'adsblol' ? fetchAdsbLolStates : fetchOpenSkyStates;
    const states = await fetchStates();
    const payload = { states, timestamp: now, provider, live: true };
    snapshotCache = { data: payload, ts: now, provider };
    res.setHeader('X-Cache', 'MISS');
    res.json(payload);
  } catch (error: any) {
    const message = error?.message || 'Unknown flight provider error';
    console.warn(`[Flights] ${provider} provider failed: ${message}`);
    res.status(502).json({
      error: 'Live flight provider unavailable',
      provider,
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
