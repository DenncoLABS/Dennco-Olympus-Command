import fs from 'fs';
import path from 'path';

export interface OlympusSessionState {
  activeModule?: string;
  mode?: string;
  mapProjection?: string;
  mapLayer?: string;
  weatherRadar?: {
    enabled?: boolean;
    product?: string;
    opacity?: number;
    contrast?: number;
    brightnessMin?: number;
    brightnessMax?: number;
    customTileUrl?: string;
  };
  updatedAt?: string;
}

const configDir = process.env.OLYMPUS_CONFIG_DIR || '/etc/dennco/olympus-command';
const sessionPath = path.join(configDir, 'session-state.json');

function cleanSessionState(input: unknown): OlympusSessionState {
  const body = (input || {}) as Record<string, any>;
  const next: OlympusSessionState = {};

  if (typeof body.activeModule === 'string') next.activeModule = body.activeModule;
  if (typeof body.mode === 'string') next.mode = body.mode;
  if (typeof body.mapProjection === 'string') next.mapProjection = body.mapProjection;
  if (typeof body.mapLayer === 'string') next.mapLayer = body.mapLayer;

  if (body.weatherRadar && typeof body.weatherRadar === 'object') {
    const radar = body.weatherRadar as Record<string, any>;
    next.weatherRadar = {
      ...(typeof radar.enabled === 'boolean' ? { enabled: radar.enabled } : {}),
      ...(typeof radar.product === 'string' ? { product: radar.product } : {}),
      ...(typeof radar.opacity === 'number' ? { opacity: radar.opacity } : {}),
      ...(typeof radar.contrast === 'number' ? { contrast: radar.contrast } : {}),
      ...(typeof radar.brightnessMin === 'number' ? { brightnessMin: radar.brightnessMin } : {}),
      ...(typeof radar.brightnessMax === 'number' ? { brightnessMax: radar.brightnessMax } : {}),
      ...(typeof radar.customTileUrl === 'string' ? { customTileUrl: radar.customTileUrl } : {}),
    };
  }

  next.updatedAt = new Date().toISOString();
  return next;
}

export function readSessionState(): OlympusSessionState {
  if (!fs.existsSync(sessionPath)) return {};
  try {
    return JSON.parse(fs.readFileSync(sessionPath, 'utf8')) as OlympusSessionState;
  } catch {
    return {};
  }
}

export function writeSessionState(input: unknown): OlympusSessionState {
  const current = readSessionState();
  const patch = cleanSessionState(input);
  const next: OlympusSessionState = {
    ...current,
    ...patch,
    weatherRadar: {
      ...(current.weatherRadar || {}),
      ...(patch.weatherRadar || {}),
    },
    updatedAt: patch.updatedAt,
  };

  if (!fs.existsSync(configDir)) fs.mkdirSync(configDir, { recursive: true });
  fs.writeFileSync(sessionPath, JSON.stringify(next, null, 2), { mode: 0o600 });
  return next;
}
