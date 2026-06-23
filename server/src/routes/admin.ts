import express from 'express';
import { clearAccess, grantAccess, renderLogin, renderSetup } from '../core/accessGate';
import { createFirstRunConfig, getRuntimeBranding, isAdminConfigured, verifyAdminLogin } from '../core/firstRunConfig';
import { configured, mergeAdminRuntimeSettings, readAdminRuntimeSettings } from '../core/adminRuntimeSettings';

const router = express.Router();

function runtimeSettings() {
  const saved = readAdminRuntimeSettings();
  const savedBranding = saved.branding || {};
  const savedKeys = saved.apiKeys || {};
  const savedDot = saved.dotFeeds || {};
  const savedVhf = saved.vhfAudio || {};
  const branding = getRuntimeBranding();

  return {
    auth: {
      provider: process.env.OLYMPUS_AUTH_PROVIDER || 'local',
      directoryProvider: process.env.OLYMPUS_DIRECTORY_PROVIDER || 'none',
      nethserver8Enabled: process.env.OLYMPUS_NETHSERVER8_DIRECTORY === 'true',
      configured: isAdminConfigured(),
    },
    branding: {
      productName: savedBranding.productName || branding.productName,
      shortName: savedBranding.shortName || branding.shortName,
      logoUrl: process.env.OLYMPUS_LOGO_URL || savedBranding.logoUrl || '',
      logoDataUrl: savedBranding.logoDataUrl || '',
      faviconUrl: process.env.OLYMPUS_FAVICON_URL || savedBranding.faviconUrl || '',
      faviconDataUrl: savedBranding.faviconDataUrl || '',
      footerText: savedBranding.footerText || branding.footerText,
    },
    apiKeys: {
      openskyUsername: savedKeys.openskyUsername || process.env.OPENSKY_USERNAME || '',
      openskyClientId: savedKeys.openskyClientId || process.env.OPENSKY_CLIENT_ID || '',
      mapTilesUrl: savedKeys.mapTilesUrl || process.env.MAP_TILES_URL || '',
      aisstreamConfigured: configured(process.env.AISSTREAM_API_KEY) || configured(savedKeys.aisstream),
      openskyPasswordConfigured: configured(process.env.OPENSKY_PASSWORD) || configured(savedKeys.openskyPassword),
      openskyClientSecretConfigured: configured(process.env.OPENSKY_CLIENT_SECRET) || configured(savedKeys.openskyClientSecret),
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
      aisstream: configured(process.env.AISSTREAM_API_KEY) || configured(savedKeys.aisstream),
      opensky: configured(process.env.OPENSKY_USERNAME) || configured(process.env.OPENSKY_PASSWORD) || configured(savedKeys.openskyUsername) || configured(savedKeys.openskyPassword) || configured(savedKeys.openskyClientId),
      mapTiles: configured(process.env.MAP_TILES_URL) || configured(savedKeys.mapTilesUrl),
      dotTraffic: configured(process.env.DOT_TRAFFIC_GEOJSON_URL) || configured(process.env.VITE_DOT_TRAFFIC_GEOJSON_URL) || configured(savedDot.trafficUrl),
      dotCameras: configured(process.env.DOT_CAMERAS_GEOJSON_URL) || configured(process.env.VITE_DOT_CAMERAS_GEOJSON_URL) || configured(savedDot.camerasUrl),
      vhfAudio: Boolean(savedVhf.enabled && (savedVhf.channels || []).some((channel) => configured(channel.streamUrl))),
    },
    dotFeeds: {
      nationalTrafficUrl: savedDot.nationalTrafficUrl || process.env.DOT_NATIONAL_TRAFFIC_GEOJSON_URL || '',
      trafficUrl: savedDot.trafficUrl || process.env.DOT_TRAFFIC_GEOJSON_URL || process.env.VITE_DOT_TRAFFIC_GEOJSON_URL || '',
      camerasUrl: savedDot.camerasUrl || process.env.DOT_CAMERAS_GEOJSON_URL || process.env.VITE_DOT_CAMERAS_GEOJSON_URL || '',
      roadClosuresUrl: savedDot.roadClosuresUrl || process.env.DOT_ROAD_CLOSURES_GEOJSON_URL || '',
      providerMode: savedDot.providerMode || process.env.DOT_PROVIDER_MODE || 'custom',
      states: savedDot.states || (process.env.DOT_STATE_FEEDS || '')
        .split(',')
        .map((state) => state.trim().toUpperCase())
        .filter(Boolean),
    },
    vhfAudio: {
      enabled: savedVhf.enabled !== false,
      defaultChannelId: savedVhf.defaultChannelId || savedVhf.channels?.[0]?.id || '',
      channels: savedVhf.channels || [],
    },
  };
}

router.get('/runtime-settings', (_req, res) => {
  res.json(runtimeSettings());
});

router.get('/settings', (_req, res) => {
  res.json(runtimeSettings());
});

router.post('/settings', (req, res) => {
  const body = req.body || {};
  const apiKeys = body.apiKeys || {};
  mergeAdminRuntimeSettings({
    branding: body.branding || {},
    dotFeeds: body.dotFeeds || {},
    vhfAudio: body.vhfAudio || {},
    apiKeys: {
      ...(apiKeys.aisstream ? { aisstream: apiKeys.aisstream } : {}),
      ...(apiKeys.openskyUsername ? { openskyUsername: apiKeys.openskyUsername } : {}),
      ...(apiKeys.openskyPassword ? { openskyPassword: apiKeys.openskyPassword } : {}),
      ...(apiKeys.openskyClientId ? { openskyClientId: apiKeys.openskyClientId } : {}),
      ...(apiKeys.openskyClientSecret ? { openskyClientSecret: apiKeys.openskyClientSecret } : {}),
      ...(apiKeys.mapTilesUrl ? { mapTilesUrl: apiKeys.mapTilesUrl } : {}),
    },
  });
  res.json({ ok: true, settings: runtimeSettings() });
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
