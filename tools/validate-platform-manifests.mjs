#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const lanes = [
  { dir: 'extensions', manifest: 'extension.manifest.json', kind: 'extension' },
  { dir: 'mirrors', manifest: 'mirror.manifest.json', kind: 'mirror' },
  { dir: 'apps', manifest: 'app.manifest.json', kind: 'app' },
];

const idPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const statuses = new Set(['draft', 'active', 'deprecated', 'archived']);
let failures = 0;

for (const lane of lanes) {
  const laneDir = path.join(root, lane.dir);
  if (!fs.existsSync(laneDir)) continue;

  for (const entry of fs.readdirSync(laneDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;

    const manifestPath = path.join(laneDir, entry.name, lane.manifest);
    const relativePath = path.relative(root, manifestPath);

    if (!fs.existsSync(manifestPath)) {
      console.error(`Missing manifest: ${relativePath}`);
      failures += 1;
      continue;
    }

    let manifest;
    try {
      manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    } catch (error) {
      console.error(`Invalid JSON: ${relativePath}`);
      console.error(`  ${error.message}`);
      failures += 1;
      continue;
    }

    for (const field of ['id', 'name', 'version', 'kind', 'status']) {
      if (!manifest[field]) {
        console.error(`Missing ${field}: ${relativePath}`);
        failures += 1;
      }
    }

    if (manifest.id && !idPattern.test(manifest.id)) {
      console.error(`Invalid id '${manifest.id}' in ${relativePath}`);
      failures += 1;
    }

    if (manifest.kind && manifest.kind !== lane.kind) {
      console.error(`Invalid kind '${manifest.kind}' in ${relativePath}; expected '${lane.kind}'`);
      failures += 1;
    }

    if (manifest.status && !statuses.has(manifest.status)) {
      console.error(`Invalid status '${manifest.status}' in ${relativePath}`);
      failures += 1;
    }
  }
}

if (failures > 0) {
  console.error(`Manifest validation failed with ${failures} issue(s).`);
  process.exit(1);
}

console.log('Platform manifests validated successfully.');
