import express from 'express';
import fs from 'fs/promises';
import path from 'path';

const router = express.Router();
const MAX_READ_BYTES = 512 * 1024;

function normalizePath(value: unknown) {
  const raw = typeof value === 'string' && value.trim() ? value.trim() : '/';
  return path.resolve(raw);
}

function isTextLike(filePath: string) {
  return /\.(txt|log|json|js|ts|tsx|jsx|css|html|md|yml|yaml|env|conf|ini|service|sh|py|xml|csv)$/i.test(filePath);
}

router.get('/list', async (req, res) => {
  const target = normalizePath(req.query.path);
  const entries = await fs.readdir(target, { withFileTypes: true });
  const rows = await Promise.all(entries.map(async (entry) => {
    const fullPath = path.join(target, entry.name);
    try {
      const stat = await fs.stat(fullPath);
      return {
        name: entry.name,
        path: fullPath,
        type: entry.isDirectory() ? 'directory' : entry.isFile() ? 'file' : 'other',
        size: stat.size,
        modified: stat.mtime.toISOString(),
      };
    } catch {
      return {
        name: entry.name,
        path: fullPath,
        type: entry.isDirectory() ? 'directory' : entry.isFile() ? 'file' : 'other',
        size: 0,
        modified: '',
      };
    }
  }));

  rows.sort((a, b) => {
    if (a.type !== b.type) return a.type === 'directory' ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

  res.json({ path: target, parent: path.dirname(target), entries: rows });
});

router.get('/read', async (req, res) => {
  const target = normalizePath(req.query.path);
  const stat = await fs.stat(target);
  if (!stat.isFile()) {
    res.status(400).json({ error: 'Path is not a file.' });
    return;
  }
  if (stat.size > MAX_READ_BYTES) {
    res.status(413).json({ error: 'File is too large to preview.', size: stat.size, maxBytes: MAX_READ_BYTES });
    return;
  }
  if (!isTextLike(target)) {
    res.status(415).json({ error: 'File type is not previewed as text.', size: stat.size });
    return;
  }
  const content = await fs.readFile(target, 'utf8');
  res.json({ path: target, size: stat.size, modified: stat.mtime.toISOString(), content });
});

export default router;
