#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const lane = process.argv[2];
const validLanes = new Set(['extensions', 'mirrors', 'apps']);

if (!validLanes.has(lane)) {
  console.error('Usage: node tools/list-platform-modules.mjs <extensions|mirrors|apps>');
  process.exit(1);
}

const manifestName = {
  extensions: 'extension.manifest.json',
  mirrors: 'mirror.manifest.json',
  apps: 'app.manifest.json',
}[lane];

const laneDir = path.join(root, lane);

if (!fs.existsSync(laneDir)) {
  console.log(`No ${lane} directory found.`);
  process.exit(0);
}

const modules = fs
  .readdirSync(laneDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => {
    const manifestPath = path.join(laneDir, entry.name, manifestName);
    if (!fs.existsSync(manifestPath)) {
      return {
        id: entry.name,
        name: entry.name,
        status: 'missing-manifest',
        manifest: path.relative(root, manifestPath),
      };
    }

    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    return {
      id: manifest.id ?? entry.name,
      name: manifest.name ?? entry.name,
      kind: manifest.kind ?? lane.slice(0, -1),
      version: manifest.version ?? '0.0.0',
      status: manifest.status ?? 'draft',
      manifest: path.relative(root, manifestPath),
    };
  });

if (modules.length === 0) {
  console.log(`No ${lane} found.`);
  process.exit(0);
}

for (const module of modules) {
  console.log(`${module.kind ?? lane}: ${module.id} (${module.version ?? 'n/a'}) - ${module.status}`);
  console.log(`  ${module.manifest}`);
}
