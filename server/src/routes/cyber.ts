import { Router } from 'express';
import { fetchCloudflareRadar } from '../core/source/cloudflare';

const router = Router();

// Generic endpoint proxy for frontend to easily access any Radar metric
router.get('/radar/*', async (req, res) => {
  try {
    // e.g., /api/cyber/radar/bots/summary/bot_class
    // -> endpoint: /radar/bots/summary/bot_class
    const endpoint = req.path;

    // Pass query params along
    const params: Record<string, string> = {};
    for (const [key, value] of Object.entries(req.query)) {
      if (typeof value === 'string') {
        params[key] = value;
      } else if (Array.isArray(value)) {
        params[key] = value[0] as string;
      }
    }

    const data = await fetchCloudflareRadar(endpoint, params);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
