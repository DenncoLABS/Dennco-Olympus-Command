import { Router } from 'express';
import { execFile } from 'child_process';
import { promises as fs } from 'fs';
import os from 'os';
import path from 'path';

const router = Router();
const browserBin = process.env.OLYMPUS_SYSTEM_BROWSER || '/usr/bin/chromium';

function safeUrl(value: unknown) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  if (!/^https?:\/\//i.test(raw)) return `https://${raw}`;
  return raw;
}

router.get('/screen', async (req, res) => {
  const url = safeUrl(req.query.url);
  if (!url) {
    res.status(400).json({ error: 'Missing url' });
    return;
  }

  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'olympus-browser-'));
  const out = path.join(dir, 'screen.png');
  const args = [
    '--headless=new',
    '--no-sandbox',
    '--disable-gpu',
    '--disable-dev-shm-usage',
    '--ignore-certificate-errors',
    '--window-size=1440,920',
    `--screenshot=${out}`,
    url,
  ];

  execFile(browserBin, args, { timeout: 20000 }, async (error) => {
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

export default router;
