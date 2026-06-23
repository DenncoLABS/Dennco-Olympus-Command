import express from 'express';
import { clearAccess, grantAccess, renderLogin, renderSetup } from '../core/accessGate';
import { createFirstRunConfig, getRuntimeBranding, isAdminConfigured, verifyAdminLogin } from '../core/firstRunConfig';

const router = express.Router();

function runtimeSettings() {
  const branding = getRuntimeBranding();

  return {
    auth: {
      provider: process.env.OLYMPUS_AUTH_PROVIDER || 'local',
      directoryProvider: process.env.OLYMPUS_DIRECTORY_PROVIDER || 'none',
      nethserver8Enabled: process.env.OLYMPUS_NETHSERVER8_DIRECTORY === 'true',
      configured: isAdminConfigured(),
    },
    branding: {
      productName: branding.productName,
      shortName: branding.shortName,
      logoUrl: process.env.OLYMPUS_LOGO_URL || '',
      faviconUrl: process.env.OLYMPUS_FAVICON_URL || '',
      footerText: branding.footerText,
    },
    featureToggles: {
      flights: process.env.OLYMPUS_FEATURE_FLIGHTS !== 'false',
      maritime: process.env.OLYMPUS_FEATURE_MARITIME !== 'false',
      monitor: process.env.OLYMPUS_FEATURE_MONITOR !== 'false',
      dot: process.env.OLYMPUS_FEATURE_DOT !== 'false',
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
      dotTraffic: Boolean(process.env.DOT_TRAFFIC_GEOJSON_URL || process.env.VITE_DOT_TRAFFIC_GEOJSON_URL),
      dotCameras: Boolean(process.env.DOT_CAMERAS_GEOJSON_URL || process.env.VITE_DOT_CAMERAS_GEOJSON_URL),
    },
    dotFeeds: {
      nationalTrafficUrl: process.env.DOT_NATIONAL_TRAFFIC_GEOJSON_URL || '',
      trafficUrl: process.env.DOT_TRAFFIC_GEOJSON_URL || process.env.VITE_DOT_TRAFFIC_GEOJSON_URL || '',
      camerasUrl: process.env.DOT_CAMERAS_GEOJSON_URL || process.env.VITE_DOT_CAMERAS_GEOJSON_URL || '',
      roadClosuresUrl: process.env.DOT_ROAD_CLOSURES_GEOJSON_URL || '',
      providerMode: process.env.DOT_PROVIDER_MODE || 'custom',
      states: (process.env.DOT_STATE_FEEDS || '')
        .split(',')
        .map((state) => state.trim().toUpperCase())
        .filter(Boolean),
    },
  };
}

router.get('/runtime-settings', (_req, res) => {
  res.json(runtimeSettings());
});

router.get('/setup/status', (_req, res) => {
  res.json({ configured: isAdminConfigured() });
});

router.post('/setup', (req, res) => {
  if (isAdminConfigured()) {
    grantAccess(res);
    return res.redirect('/');
  }

  try {
    createFirstRunConfig({
      adminUser: req.body?.adminUser,
      accessCode: req.body?.accessCode,
      productName: req.body?.productName,
      shortName: req.body?.shortName,
      footerText: req.body?.footerText,
    });
    grantAccess(res);
    return res.redirect('/');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to complete setup.';
    return renderSetup(res, message);
  }
});

router.post('/login', (req, res) => {
  const { username, accessCode } = req.body || {};
  const wantsHtml = String(req.headers.accept || '').includes('text/html') || req.is('application/x-www-form-urlencoded');

  if (!isAdminConfigured()) {
    if (wantsHtml) return renderSetup(res);
    return res.status(428).json({ error: 'First-time setup required.' });
  }

  if (verifyAdminLogin(username, accessCode)) {
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
