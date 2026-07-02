import { Router } from 'express';
import { mapAssetStore, type MapAssetType } from '../core/map_assets';

const router = Router();

function normalizeType(value: unknown): MapAssetType | undefined {
  if (value === 'aircraft' || value === 'vessel' || value === 'vehicle' || value === 'custom') return value;
  return undefined;
}

router.get('/', (req, res) => {
  const assetType = normalizeType(req.query.type);
  res.json({ assets: mapAssetStore.list(assetType) });
});

router.get('/:assetId', (req, res) => {
  const asset = mapAssetStore.get(req.params.assetId);
  if (!asset) {
    res.status(404).json({ error: 'Asset not found' });
    return;
  }
  res.json({ asset });
});

router.get('/:assetId/movement', (req, res) => {
  const asset = mapAssetStore.get(req.params.assetId);
  if (!asset) {
    res.status(404).json({ error: 'Asset not found' });
    return;
  }
  res.json({ assetId: asset.assetId, movement: mapAssetStore.getMovement(asset.assetId) });
});

router.post('/', (req, res) => {
  const assetType = normalizeType(req.body.assetType);
  const uniqueId = typeof req.body.uniqueId === 'string' ? req.body.uniqueId : '';
  if (!assetType || !uniqueId.trim()) {
    res.status(400).json({ error: 'assetType and uniqueId are required.' });
    return;
  }
  const asset = mapAssetStore.upsert({
    assetType,
    uniqueId,
    label: typeof req.body.label === 'string' ? req.body.label : undefined,
    photoPath: typeof req.body.photoPath === 'string' ? req.body.photoPath : undefined,
    details: req.body.details && typeof req.body.details === 'object' ? req.body.details : {},
    tracking: req.body.tracking && typeof req.body.tracking === 'object' ? req.body.tracking : undefined,
  });
  res.status(201).json({ asset });
});

router.post('/:assetId/tracking', (req, res) => {
  const asset = mapAssetStore.get(req.params.assetId);
  if (!asset) {
    res.status(404).json({ error: 'Asset not found' });
    return;
  }
  const updated = mapAssetStore.upsert({
    assetType: asset.assetType,
    uniqueId: asset.uniqueId,
    tracking: req.body && typeof req.body === 'object' ? req.body : {},
  });
  res.json({ asset: updated });
});

export default router;
