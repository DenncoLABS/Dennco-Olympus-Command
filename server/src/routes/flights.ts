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
// OpenSky anonymous rate limit is 10 req / 10 s; the client polls every 5 s,
// so without caching multiple browser tabs will quickly exhaust the quota.
let snapshotCache: { data: object; ts: number } | null = null;
const SNAPSHOT_TTL_MS = 5_000;

router.get('/snapshot', async (req, res) => {
  const now = Date.now();
  if (snapshotCache && now - snapshotCache.ts < SNAPSHOT_TTL_MS) {
    res.setHeader('X-Cache', 'HIT');
    return res.json(snapshotCache.data);
  }

  try {
    const provider = process.env.FLIGHT_DATA_SOURCE === 'adsblol' ? 'adsblol' : 'opensky';
    const fetchStates = provider === 'adsblol' ? fetchAdsbLolStates : fetchOpenSkyStates;

    const states = await fetchStates();
    const payload = { states, timestamp: now, provider, live: true };
    snapshotCache = { data: payload, ts: now };
    res.setHeader('X-Cache', 'MISS');
    res.json(payload);
  } catch (error: any) {
    const provider = process.env.FLIGHT_DATA_SOURCE === 'adsblol' ? 'adsblol' : 'opensky';
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
    const useAdsbLol = process.env.FLIGHT_DATA_SOURCE === 'adsblol';
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
