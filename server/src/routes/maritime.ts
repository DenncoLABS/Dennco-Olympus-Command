import { Router } from 'express';
import { aisStreamService } from '../core/source/aisstream';

const router = Router();

const SNAPSHOT_VESSEL_LIMIT = 30_000;

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

router.get('/snapshot', (_req, res) => {
  const allVessels = aisStreamService.vessels;
  let vessels = Array.from(allVessels.values());

  if (vessels.length > SNAPSHOT_VESSEL_LIMIT) {
    vessels.sort((a, b) => b.lastUpdate - a.lastUpdate);
    vessels = vessels.slice(0, SNAPSHOT_VESSEL_LIMIT);
  }

  const stripped = vessels.map(({ history: _h, ...v }) => v);

  res.json({
    timestamp: Date.now(),
    vessels: stripped,
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
