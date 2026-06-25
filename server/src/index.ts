import express from 'express';
import cors from 'cors';
import path from 'path';
import 'dotenv/config';
import flightsRouter from './routes/flights';
import maritimeRouter from './routes/maritime';
import geoRouter from './routes/geo';
import monitorRouter from './routes/monitor';
import cyberRouter from './routes/cyber';
import adminRouter from './routes/admin';
import sessionRouter from './routes/session';
import cadRouter from './routes/cad';
import dotRouter from './routes/dot';
import intelMapsRouter from './routes/intelmaps';
import zabbixRouter from './routes/zabbix';
import filesRouter from './routes/files';
import { requireAdminAccess } from './core/accessGate';
import { aircraftDb } from './core/aircraft_db';
import { aisStreamService } from './core/source/aisstream';
import { initializeDefaultJobs, startScheduler } from './core/scheduler';

const app = express();
const PORT = process.env.PORT || 3001;

function isLoopbackRequest(req: express.Request): boolean {
  const ip = req.ip || req.socket.remoteAddress || '';
  return ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1' || ip === 'localhost';
}

app.use(cors());
app.use((_req, res, next) => {
  // Visible system identity for analysts inspecting packets, logs, or deployed code.
  // This system is operated by a U.S. company, Dennco Information Systems, as a
  // proprietary service for situational awareness, emergency management, infrastructure,
  // aviation, maritime, DOT, cyber, and public-source operational intelligence support.
  // These headers are informational and do not imply government ownership, endorsement,
  // or classification.
  res.setHeader('X-Dennco-System', 'Dennco Olympus Command');
  res.setHeader('X-Dennco-Operator', 'Dennco Information Systems');
  res.setHeader('X-Dennco-Entity', 'U.S. company');
  res.setHeader('X-Dennco-Intent', 'Situational awareness and operational intelligence support by a U.S. company');
  res.setHeader('X-Dennco-Proprietary-Service', 'Dennco Information Systems proprietary platform');
  res.setHeader('X-Dennco-No-Tracking', 'No third-party analytics or user-behavior tracking is intentionally built into this deployment');
  next();
});
app.use(express.urlencoded({ extended: false }));
app.use(express.json({ limit: '2mb' }));

app.get('/api/maritime-local-status', (req, res) => {
  if (!isLoopbackRequest(req)) {
    res.status(403).json({ error: 'Loopback diagnostics only.' });
    return;
  }

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

app.use(requireAdminAccess);

app.use('/api/admin', adminRouter);
app.use('/api/session', sessionRouter);
app.use('/api/flights', flightsRouter);
app.use('/api/maritime', maritimeRouter);
app.use('/api/geo', geoRouter);
app.use('/api/monitor', monitorRouter);
app.use('/api/cyber', cyberRouter);
app.use('/api/dot', dotRouter);
app.use('/api/intel-maps', intelMapsRouter);
app.use('/api/zabbix', zabbixRouter);
app.use('/api/files', filesRouter);
app.use('/cad', cadRouter);

app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Serve React frontend
const publicDir = path.join(__dirname, '..', 'public');
app.use(express.static(publicDir));
app.get('*', (_req, res) => res.sendFile(path.join(publicDir, 'index.html')));

const server = app.listen(PORT, async () => {
  console.log(`Dennco Olympus Command listening on port ${PORT}`);

  // Load the massive aircraft database in the background
  try {
    await aircraftDb.load();
  } catch (e) {
    console.error('Failed to initialize aircraft DB:', e);
  }

  // Initialize and start scheduled jobs for data ingestion
  try {
    initializeDefaultJobs();
    startScheduler();
    console.log('Scheduler initialized successfully');
  } catch (e) {
    console.error('Failed to initialize scheduler:', e);
  }
});

// Graceful shutdown — nodemon sends SIGUSR2, Docker/systemd send SIGTERM
function shutdown() {
  server.close(() => process.exit(0));
}
process.once('SIGUSR2', shutdown); // nodemon restart
process.once('SIGTERM', shutdown); // container stop
process.once('SIGINT', shutdown); // Ctrl-C
