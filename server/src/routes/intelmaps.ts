import express from 'express';
import fs from 'fs/promises';
import path from 'path';

const router = express.Router();
const MAPS_DIR = process.env.OLYMPUS_INTEL_MAPS_DIR || '/var/lib/dennco/olympus-command/intel-maps';

function safeMapName(value: unknown): string {
  const raw = typeof value === 'string' && value.trim() ? value.trim() : 'untitled-map';
  return raw.toLowerCase().replace(/[^a-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80) || 'untitled-map';
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

function plainObject(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

router.get('/folder', (_req, res) => {
  res.json({ path: MAPS_DIR });
});

router.get('/custom-maps', async (_req, res) => {
  await fs.mkdir(MAPS_DIR, { recursive: true });
  const files = await fs.readdir(MAPS_DIR).catch(() => []);
  const maps = [];
  for (const file of files.filter((name) => name.endsWith('.json')).slice(-200)) {
    try {
      const raw = await fs.readFile(path.join(MAPS_DIR, file), 'utf8');
      maps.push({ file, ...JSON.parse(raw) });
    } catch {
      // ignore invalid saved map files
    }
  }
  res.json({ folder: MAPS_DIR, maps });
});

router.post('/custom-maps', async (req, res) => {
  const name = safeMapName(req.body?.name);
  const now = new Date().toISOString();
  const fileName = `${name}-${Date.now()}.json`;
  const filePath = path.join(MAPS_DIR, fileName);
  const assetFilters = plainObject(req.body?.assetFilters);
  const movement = plainObject(req.body?.movement);
  const payload = {
    id: req.body?.id || name,
    name,
    title: req.body?.title || req.body?.name || 'Untitled Map',
    savedAt: now,
    updatedAt: now,
    folder: MAPS_DIR,
    appId: req.body?.appId || 'custom',
    description: typeof req.body?.description === 'string' ? req.body.description : '',
    baseLayer: req.body?.baseLayer || req.body?.tools?.baseLayer || 'dark',
    projection: req.body?.projection || 'mercator',
    viewport: req.body?.viewport || null,
    layers: stringArray(req.body?.layers),
    feeds: stringArray(req.body?.feeds),
    widgets: stringArray(req.body?.widgets),
    workflows: stringArray(req.body?.workflows),
    integrations: stringArray(req.body?.integrations),
    assetFilters: {
      assetTypes: stringArray(assetFilters.assetTypes),
      assetIds: stringArray(assetFilters.assetIds),
      statuses: stringArray(assetFilters.statuses),
      sources: stringArray(assetFilters.sources),
      tags: stringArray(assetFilters.tags),
      query: typeof assetFilters.query === 'string' ? assetFilters.query : '',
    },
    trackedAssetIds: stringArray(req.body?.trackedAssetIds),
    movement: {
      showTrails: typeof movement.showTrails === 'boolean' ? movement.showTrails : true,
      trailHours: typeof movement.trailHours === 'number' ? movement.trailHours : 24,
      followSelectedAsset: typeof movement.followSelectedAsset === 'boolean' ? movement.followSelectedAsset : false,
    },
    tools: req.body?.tools || {},
    notes: typeof req.body?.notes === 'string' ? req.body.notes : '',
  };

  await fs.mkdir(MAPS_DIR, { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(payload, null, 2), 'utf8');

  res.json({ ok: true, path: filePath, map: payload });
});

export default router;
