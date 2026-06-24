import fs from 'fs';
import path from 'path';

export interface AdminRuntimeSettings {
  branding?: {
    productName?: string;
    shortName?: string;
    footerText?: string;
    logoDataUrl?: string;
    logoUrl?: string;
    faviconUrl?: string;
    faviconDataUrl?: string;
  };
  apiKeys?: {
    aisstream?: string;
    openskyUsername?: string;
    openskyPassword?: string;
    mapTilesUrl?: string;
    openskyClientId?: string;
    openskyClientSecret?: string;
  };
  dotFeeds?: {
    nationalTrafficUrl?: string;
    trafficUrl?: string;
    camerasUrl?: string;
    roadClosuresUrl?: string;
    providerMode?: string;
    states?: string[];
  };
  cad?: {
    resgridUrl?: string;
    mode?: string;
  };
  vhfAudio?: {
    enabled?: boolean;
    defaultChannelId?: string;
    channels?: Array<{
      id: string;
      label: string;
      type: string;
      streamUrl: string;
      region?: string;
      frequency?: string;
    }>;
  };
}

const configDir = process.env.OLYMPUS_CONFIG_DIR || '/etc/dennco/olympus-command';
const settingsPath = path.join(configDir, 'admin-runtime.json');

export function readAdminRuntimeSettings(): AdminRuntimeSettings {
  if (!fs.existsSync(settingsPath)) return {};
  try {
    return JSON.parse(fs.readFileSync(settingsPath, 'utf8')) as AdminRuntimeSettings;
  } catch {
    return {};
  }
}

export function writeAdminRuntimeSettings(next: AdminRuntimeSettings): AdminRuntimeSettings {
  if (!fs.existsSync(configDir)) fs.mkdirSync(configDir, { recursive: true });
  fs.writeFileSync(settingsPath, JSON.stringify(next, null, 2), { mode: 0o600 });
  return next;
}

export function mergeAdminRuntimeSettings(patch: AdminRuntimeSettings): AdminRuntimeSettings {
  const current = readAdminRuntimeSettings();
  return writeAdminRuntimeSettings({
    ...current,
    ...patch,
    branding: { ...(current.branding || {}), ...(patch.branding || {}) },
    apiKeys: { ...(current.apiKeys || {}), ...(patch.apiKeys || {}) },
    dotFeeds: { ...(current.dotFeeds || {}), ...(patch.dotFeeds || {}) },
    cad: { ...(current.cad || {}), ...(patch.cad || {}) },
    vhfAudio: { ...(current.vhfAudio || {}), ...(patch.vhfAudio || {}) },
  });
}

export function configured(value?: string): boolean {
  return Boolean(value && value.trim());
}
