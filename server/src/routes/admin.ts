import express from 'express';
import { clearAccess, grantAccess, renderLogin } from '../core/accessGate';

const router = express.Router();

const runtimeSettings = {
  auth: {
    provider: process.env.OLYMPUS_AUTH_PROVIDER || 'local',
    directoryProvider: process.env.OLYMPUS_DIRECTORY_PROVIDER || 'none',
    nethserver8Enabled: process.env.OLYMPUS_NETHSERVER8_DIRECTORY === 'true',
  },
  branding: {
    productName: process.env.OLYMPUS_PRODUCT_NAME || 'Dennco Olympus Command',
    shortName: process.env.OLYMPUS_SHORT_NAME || 'OLYMPUS',
    logoUrl: process.env.OLYMPUS_LOGO_URL || '',
    faviconUrl: process.env.OLYMPUS_FAVICON_URL || '',
    footerText: process.env.OLYMPUS_FOOTER_TEXT || 'Dennco Olympus Command',
  },
  featureToggles: {
    flights: process.env.OLYMPUS_FEATURE_FLIGHTS !== 'false',
    maritime: process.env.OLYMPUS_FEATURE_MARITIME !== 'false',
    monitor: process.env.OLYMPUS_FEATURE_MONITOR !== 'false',
    cyber: process.env.OLYMPUS_FEATURE_CYBER !== 'false',
    cssInjector: process.env.OLYMPUS_FEATURE_CSS_INJECTOR !== 'false',
  },
  theme: {
    customCss: process.env.OLYMPUS_CUSTOM_CSS || '',
  },
  providers: {
    aisstream: Boolean(process.env.AISSTREAM_API_KEY),
    opensky: Boolean(process.env.OPENSKY_USERNAME || process.env.OPENSKY_PASSWORD),
    mapTiles: Boolean(process.env.MAP_TILES_URL),
  },
};

router.get('/runtime-settings', (_req, res) => {
  res.json(runtimeSettings);
});

router.post('/login', (req, res) => {
  const { username, accessCode } = req.body || {};
  const expectedUser = process.env.OLYMPUS_ADMIN_USER || 'admin';
  const expectedCode = process.env.OLYMPUS_ADMIN_ACCESS_CODE;
  const wantsHtml = String(req.headers.accept || '').includes('text/html') || req.is('application/x-www-form-urlencoded');

  if (!expectedCode) {
    const message = 'Admin login is not configured. Set OLYMPUS_ADMIN_ACCESS_CODE in the server environment.';
    if (wantsHtml) return renderLogin(res, message);
    return res.status(503).json({ error: message });
  }

  if (username === expectedUser && accessCode === expectedCode) {
    grantAccess(res);
    if (wantsHtml) return res.redirect('/');
    return res.json({ ok: true, user: { username, role: 'admin' } });
  }

  if (wantsHtml) return renderLogin(res, 'Invalid login.');
  return res.status(401).json({ error: 'Invalid login.' });
});

router.post('/logout', (_req, res) => {
  clearAccess(res);
  res.json({ ok: true });
});

export default router;
