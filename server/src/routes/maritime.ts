import { Router } from 'express';
import { aisStreamService } from '../core/source/aisstream';

const router = Router();

const SNAPSHOT_VESSEL_LIMIT = 30_000;
const MARITIME_NODES: Record<string, { lat: number; lon: number; radiusNm: number }> = {
  'atlantic-north': { lat: 42.5, lon: -70.7, radiusNm: 250 },
  'ny-harbor': { lat: 40.6, lon: -73.9, radiusNm: 180 },
  chesapeake: { lat: 36.9, lon: -76.2, radiusNm: 220 },
  'carolina-georgia': { lat: 32.3, lon: -80.4, radiusNm: 250 },
  'florida-straits': { lat: 26.1, lon: -80.2, radiusNm: 250 },
  'eastern-gulf': { lat: 28.1, lon: -84.4, radiusNm: 250 },
  'central-gulf': { lat: 29.2, lon: -90.1, radiusNm: 250 },
  'texas-gulf': { lat: 28.6, lon: -95.2, radiusNm: 250 },
  'southern-california': { lat: 33.5, lon: -118.3, radiusNm: 220 },
  'northern-california': { lat: 37.8, lon: -122.6, radiusNm: 220 },
  'pacific-northwest': { lat: 47.6, lon: -122.6, radiusNm: 230 },
  'alaska-gulf': { lat: 60.6, lon: -149.6, radiusNm: 250 },
  hawaii: { lat: 21.3, lon: -157.9, radiusNm: 250 },
  'great-lakes-west': { lat: 46.5, lon: -87.3, radiusNm: 220 },
  'great-lakes-east': { lat: 42.4, lon: -82.8, radiusNm: 220 },
  'bc-coast': { lat: 49.3, lon: -123.2, radiusNm: 250 },
  'st-lawrence': { lat: 45.6, lon: -73.6, radiusNm: 220 },
  'atlantic-canada': { lat: 44.7, lon: -63.5, radiusNm: 250 },
};

function parseNodeIds(value: unknown): string[] {
  if (typeof value !== 'string') return [];
  return value
    .split(',')
    .map((node) => node.trim())
    .filter((node) => MARITIME_NODES[node]);
}

function distanceNm(aLat: number, aLon: number, bLat: number, bLon: number): number {
  const radiusNm = 3440.065;
  const dLat = ((bLat - aLat) * Math.PI) / 180;
  const dLon = ((bLon - aLon) * Math.PI) / 180;
  const lat1 = (aLat * Math.PI) / 180;
  const lat2 = (bLat * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  return 2 * radiusNm * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

function inAnyNode(vessel: { lat?: number; lon?: number }, nodeIds: string[]): boolean {
  if (vessel.lat == null || vessel.lon == null) return false;
  return nodeIds.some((nodeId) => {
    const node = MARITIME_NODES[nodeId];
    return distanceNm(node.lat, node.lon, vessel.lat!, vessel.lon!) <= node.radiusNm;
  });
}

router.get('/status', (_req, res) => {
  res.json({
    configured: aisStreamService.configured,
    isConnected: aisStreamService.isConnected,
    readyState: aisStreamService.readyState,
    subscribed: aisStreamService.subscribed,
    lastError: aisStreamService.lastError,
    lastRawMessageReceived: aisStreamService.lastRawMessageReceived,
    lastMessageType: aisStreamService.lastMessageType,
    lastIgnoredReason: aisStreamService.lastIgnoredReason,
    vesselCount: aisStreamService.vessels.size,
    totalMessagesReceived: aisStreamService.totalMessagesReceived,
    lastMessageReceived: aisStreamService.lastMessageReceived,
    secondsSinceLastMessage: aisStreamService.lastMessageReceived
      ? Math.floor((Date.now() - aisStreamService.lastMessageReceived) / 1000)
      : null,
  });
});

router.post('/reconnect', (_req, res) => {
  const ok = aisStreamService.reloadCredentialsAndReconnect();
  res.json({
    ok,
    configured: aisStreamService.configured,
    readyState: aisStreamService.readyState,
    subscribed: aisStreamService.subscribed,
    lastError: aisStreamService.lastError,
  });
});

router.get('/snapshot', (req, res) => {
  const nodeIds = parseNodeIds(req.query.nodes);
  if (!nodeIds.length) {
    res.json({
      timestamp: Date.now(),
      vessels: [],
      maritimeNodes: [],
      scanActive: false,
      details: 'No maritime feed node selected. Activate one or more maritime nodes, or use ALL.',
    });
    return;
  }

  const allVessels = aisStreamService.vessels;
  let vessels = Array.from(allVessels.values()).filter((vessel) => inAnyNode(vessel, nodeIds));

  if (vessels.length > SNAPSHOT_VESSEL_LIMIT) {
    vessels.sort((a, b) => b.lastUpdate - a.lastUpdate);
    vessels = vessels.slice(0, SNAPSHOT_VESSEL_LIMIT);
  }

  const stripped = vessels.map(({ history: _h, ...v }) => v);

  res.json({
    timestamp: Date.now(),
    vessels: stripped,
    maritimeNodes: nodeIds,
    scanActive: true,
  });
});

router.get('/vessel/:mmsi', (req, res) => {
  const mmsi = parseInt(req.params.mmsi, 10);
  const vessel = aisStreamService.vessels.get(mmsi);
  if (!vessel) {
    res.status(404).json({ error: 'Vessel not found' });
    return;
  }
  res.json(vessel);
});

export default router;
