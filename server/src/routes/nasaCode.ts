import express from 'express';
import fs from 'fs/promises';
import path from 'path';

const router = express.Router();
const NASA_CATALOG_URL = 'https://raw.githubusercontent.com/nasa/Open-Source-Catalog/master/catalog.json';
const NASA_APPS_DIR = process.env.OLYMPUS_NASA_CODE_APPS_DIR || '/var/lib/dennco/olympus-command/apps/nasa-code';
const CACHE_FILE = path.join(NASA_APPS_DIR, 'catalog.json');

type NasaCodeEntry = {
  Software?: string;
  Description?: string;
  Categories?: string[];
  License?: string[];
  Languages?: string[];
  'NASA Center'?: string;
  'Public Code Repo'?: string;
  'External Link'?: string;
  Update_Date?: string;
};

function normalize(entry: NasaCodeEntry, index: number) {
  const title = entry.Software || `NASA Code App ${index + 1}`;
  return {
    id: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 96) || `nasa-code-${index + 1}`,
    title,
    description: entry.Description || 'NASA open source software catalog entry.',
    center: entry['NASA Center'] || 'NASA',
    categories: Array.isArray(entry.Categories) ? entry.Categories : [],
    license: Array.isArray(entry.License) ? entry.License : [],
    languages: Array.isArray(entry.Languages) ? entry.Languages : [],
    repo: entry['Public Code Repo'] || entry['External Link'] || 'https://code.nasa.gov/',
    externalLink: entry['External Link'] || entry['Public Code Repo'] || 'https://code.nasa.gov/',
    updated: entry.Update_Date || '',
  };
}

async function fetchCatalog() {
  const response = await fetch(NASA_CATALOG_URL);
  if (!response.ok) throw new Error(`NASA catalog fetch failed: ${response.status}`);
  const raw = await response.json() as NasaCodeEntry[];
  if (!Array.isArray(raw)) throw new Error('NASA catalog payload was not an array');
  return raw.map(normalize);
}

async function readCachedCatalog() {
  try {
    const raw = await fs.readFile(CACHE_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

router.get('/catalog', async (_req, res) => {
  try {
    const catalog = await fetchCatalog();
    res.json({ source: NASA_CATALOG_URL, count: catalog.length, catalog });
  } catch (error) {
    const cached = await readCachedCatalog();
    res.json({ source: CACHE_FILE, count: cached.length, catalog: cached, warning: String(error) });
  }
});

router.post('/install-all', async (_req, res) => {
  const catalog = await fetchCatalog();
  await fs.mkdir(NASA_APPS_DIR, { recursive: true });
  await fs.writeFile(CACHE_FILE, JSON.stringify(catalog, null, 2), 'utf8');

  await Promise.all(catalog.map((entry) => {
    const file = path.join(NASA_APPS_DIR, `${entry.id}.json`);
    return fs.writeFile(file, JSON.stringify(entry, null, 2), 'utf8');
  }));

  res.json({ ok: true, count: catalog.length, folder: NASA_APPS_DIR, source: NASA_CATALOG_URL });
});

export default router;
