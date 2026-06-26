import { Router } from 'express';
import { execFile } from 'child_process';
import { promises as fs } from 'fs';
import os from 'os';
import path from 'path';

const router = Router();
const root = process.env.OLYMPUS_PVE_LAB_ROOT || '/var/lib/dennco/olympus-lab-node/proxmox';
const objectsDir = path.join(root, 'objects');
const overlaysDir = path.join(root, 'overlays');
const browserBin = process.env.OLYMPUS_SYSTEM_BROWSER || '/usr/bin/chromium';

type LabType = 'qm' | 'ct';
type LabObject = { type: LabType; id: string; name: string; stage: string; ready: boolean; overlay: string; updated: string; values: Record<string, string> };

async function ensureDirs() {
  await fs.mkdir(objectsDir, { recursive: true });
  await fs.mkdir(overlaysDir, { recursive: true });
}

function objectFile(type: string, id: string) {
  const safeType = type === 'ct' ? 'ct' : 'qm';
  const safeId = String(id).replace(/[^0-9a-zA-Z._-]/g, '');
  return path.join(objectsDir, `${safeType}-${safeId}.env`);
}

function parseEnv(raw: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const line of raw.split('\n')) {
    const idx = line.indexOf('=');
    if (idx < 1) continue;
    out[line.slice(0, idx)] = line.slice(idx + 1);
  }
  return out;
}

function safeUrl(value: unknown) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  if (/^https?:\/\//i.test(raw)) return raw;
  return `https://${raw}`;
}

function toObject(values: Record<string, string>): LabObject {
  return {
    type: values.TYPE === 'ct' ? 'ct' : 'qm',
    id: values.ID || '',
    name: values.NAME || '',
    stage: values.STAGE || 'imported',
    ready: values.READY === 'true',
    overlay: values.OVERLAY || '',
    updated: values.UPDATED || '',
    values,
  };
}

async function readObject(type: string, id: string) {
  const raw = await fs.readFile(objectFile(type, id), 'utf8');
  return toObject(parseEnv(raw));
}

async function writeObject(type: LabType, id: string, values: Record<string, string>) {
  await ensureDirs();
  const lines = Object.entries(values).map(([key, value]) => `${key}=${value}`);
  await fs.writeFile(objectFile(type, id), `${lines.join('\n')}\n`, 'utf8');
}

router.get('/browser-screen', async (req, res) => {
  const url = safeUrl(req.query.url);
  if (!url) {
    res.status(400).json({ error: 'Missing url' });
    return;
  }
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'olympus-pve-browser-'));
  const out = path.join(dir, 'screen.png');
  execFile(browserBin, ['--headless=new', '--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage', '--ignore-certificate-errors', '--window-size=1440,920', `--screenshot=${out}`, url], { timeout: 20000 }, async (error) => {
    try {
      if (error) {
        res.status(502).json({ error: String(error) });
        return;
      }
      const png = await fs.readFile(out);
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Cache-Control', 'no-store');
      res.send(png);
    } catch (readError) {
      res.status(500).json({ error: String(readError) });
    } finally {
      fs.rm(dir, { recursive: true, force: true }).catch(() => undefined);
    }
  });
});

router.get('/objects', async (_req, res) => {
  try {
    await ensureDirs();
    const files = await fs.readdir(objectsDir);
    const objects = await Promise.all(files.filter((file) => file.endsWith('.env')).map(async (file) => {
      const raw = await fs.readFile(path.join(objectsDir, file), 'utf8');
      return toObject(parseEnv(raw));
    }));
    res.json({ root, objects });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

router.post('/objects', async (req, res) => {
  try {
    const type: LabType = req.body?.type === 'ct' ? 'ct' : 'qm';
    const id = String(req.body?.id || Date.now()).replace(/[^0-9a-zA-Z._-]/g, '');
    const name = String(req.body?.name || `${type}-${id}`);
    const overlay = path.join(overlaysDir, `${type}-${id}`);
    await fs.mkdir(path.join(overlay, 'rootfs'), { recursive: true });
    await fs.mkdir(path.join(overlay, 'config'), { recursive: true });
    const now = new Date().toISOString();
    const values: Record<string, string> = { TYPE: type, ID: id, NAME: name, STAGE: 'imported', SOURCE: 'production-copy', OVERLAY: overlay, CREATED: now, UPDATED: now, READY: 'false' };
    await writeObject(type, id, values);
    res.json({ object: toObject(values) });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

router.patch('/objects/:type/:id', async (req, res) => {
  try {
    const current = await readObject(req.params.type, req.params.id);
    const values = { ...current.values };
    for (const [key, value] of Object.entries(req.body || {})) {
      values[key.toUpperCase()] = String(value);
    }
    values.UPDATED = new Date().toISOString();
    await writeObject(current.type, current.id, values);
    res.json({ object: toObject(values) });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

router.get('/objects/:type/:id/plan', async (req, res) => {
  try {
    const object = await readObject(req.params.type, req.params.id);
    res.json({ object, plan: ['Review lab overlay and metadata changes.', 'Create final lab snapshot/checkpoint.', 'Schedule production maintenance window.', 'Use approved Proxmox or NS8 tooling for final migration.', 'Keep Olympus lab record for rollback notes.'] });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

export default router;
