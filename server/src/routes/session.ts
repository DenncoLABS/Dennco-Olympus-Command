import express from 'express';
import { readSessionState, writeSessionState } from '../core/sessionState';

const router = express.Router();

router.get('/', (_req, res) => {
  res.json({ ok: true, session: readSessionState() });
});

router.post('/', (req, res) => {
  const session = writeSessionState(req.body || {});
  res.json({ ok: true, session });
});

export default router;
