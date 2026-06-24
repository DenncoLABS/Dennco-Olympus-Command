import express from 'express';
import { readAdminRuntimeSettings } from '../core/adminRuntimeSettings';

const router = express.Router();

function trimSlash(value: string) {
  return value.replace(/\/+$/, '');
}

function serviceUrl() {
  const saved = readAdminRuntimeSettings();
  const cad = saved.cad || {};
  return trimSlash(cad.serviceUrl || process.env.OLYMPUS_CAD_SERVICE_URL || 'http://127.0.0.1:5050');
}

router.use(async (req, res) => {
  const target = serviceUrl();
  const path = req.originalUrl.replace(/^\/cad/, '') || '/';
  const url = `${target}${path.startsWith('/') ? path : `/${path}`}`;

  try {
    const upstream = await fetch(url, {
      method: req.method,
      headers: {
        'x-olympus-authenticated': 'true',
        'x-olympus-user': 'admin',
        'x-forwarded-host': req.headers.host || '',
        'x-forwarded-proto': req.protocol,
      },
      body: ['GET', 'HEAD'].includes(req.method) ? undefined : JSON.stringify(req.body || {}),
      redirect: 'manual',
    });

    const contentType = upstream.headers.get('content-type') || 'application/octet-stream';
    res.status(upstream.status);
    res.setHeader('content-type', contentType);
    const location = upstream.headers.get('location');
    if (location) res.setHeader('location', location.replace(target, '/cad'));

    const buffer = Buffer.from(await upstream.arrayBuffer());
    res.send(buffer);
  } catch (error) {
    res.status(502).send(`<!doctype html><html><body style="background:#05070b;color:#dbeafe;font-family:monospace;padding:32px"><h1>Olympus CAD service offline</h1><p>The local CAD service is not reachable at ${target}.</p><p>Run <code>bash /opt/dennco/olympus-command/scripts/install-cad-services.sh</code>.</p></body></html>`);
  }
});

export default router;
