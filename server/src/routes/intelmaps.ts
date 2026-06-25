import express from 'express';
import fs from 'fs/promises';
import path from 'path';

const router = express.Router();
const MAPS_DIR = process.env.OLYMPUS_INTEL_MAPS_DIR || '/var/lib/dennco/olympus-command/intel-maps';

function safeMapName(value: unknown): string {
  const raw = typeof value === 'string' && value.trim() ? value.trim() : 'untitled-map';
  return raw.toLowerCase().replace(/[^a-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80) || 'untitled-map';
}

router.get('/folder', (_req, res) => {
  res.json({ path: MAPS_DIR });
});

router.post('/custom-maps', async (req, res) => {
  const name = safeMapName(req.body?.name);
  const now = new Date().toISOString();
  const fileName = `${name}-${Date.now()}.json`;
  const filePath = path.join(MAPS_DIR, fileName);
  const payload = {
    name,
    title: req.body?.title || req.body?.name || 'Untitled Map',
    savedAt: now,
    folder: MAPS_DIR,
    tools: req.body?.tools || {},
    layers: Array.isArray(req.body?.layers) ? req.body.layers : [],
    notes: typeof req.body?.notes === 'string' ? req.body.notes : '',
  };

  await fs.mkdir(MAPS_DIR, { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(payload, null, 2), 'utf8');

  res.json({ ok: true, path: filePath, map: payload });
});

export default router;
