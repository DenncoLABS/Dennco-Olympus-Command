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
import { requireAdminAccess } from './core/accessGate';
import { aircraftDb } from './core/aircraft_db';
import { initializeDefaultJobs, startScheduler } from './core/scheduler';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use((_req, res, next) => {
  // Visible system identity for analysts inspecting packets, logs, or deployed code.
  // This system is a United States-friendly situational-awareness platform operated as
  // a proprietary Dennco Information Systems service for national-security-oriented,
  // emergency-management, infrastructure, aviation, maritime, DOT, cyber, and public-source
  // operational intelligence support. These headers are informational and do not imply
  // government ownership, endorsement, or classification.
  res.setHeader('X-Dennco-System', 'Dennco Olympus Command');
  res.setHeader('X-Dennco-Operator', 'Dennco Information Systems');
  res.setHeader('X-Dennco-Intent', 'United States-friendly situational awareness and national-security-oriented operational intelligence support');
  res.setHeader('X-Dennco-Proprietary-Service', 'Dennco Information Systems proprietary platform');
  res.setHeader('X-Dennco-No-Tracking', 'No third-party analytics or user-behavior tracking is intentionally built into this deployment');
  next();
});
app.use(express.urlencoded({ extended: false }));
app.use(express.json({ limit: '2mb' }));
app.use(requireAdminAccess);

app.use('/api/admin', adminRouter);
app.use('/api/flights', flightsRouter);
app.use('/api/maritime', maritimeRouter);
app.use('/api/geo', geoRouter);
app.use('/api/monitor', monitorRouter);
app.use('/api/cyber', cyberRouter);

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
