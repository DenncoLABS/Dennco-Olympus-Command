import maplibregl from 'maplibre-gl';
import { useFlightsStore } from './state/flights.store';

const BOOT_KEY = '__olympusFlightMapClickBridgeReady';
const PATCH_KEY = '__olympusFlightMapClickFirePatched';
const FEATURE_LAYERS = ['aircraft-click-target', 'aircraft-points'];

type ScopedWindow = Window & { [BOOT_KEY]?: boolean };
type PatchedMapPrototype = typeof maplibregl.Map.prototype & { [PATCH_KEY]?: boolean };
type MapClickPayload = { point?: { x: number; y: number }; target?: maplibregl.Map };

function selectRenderedAircraft(map: maplibregl.Map, point: { x: number; y: number }): void {
  const box: [[number, number], [number, number]] = [[point.x - 28, point.y - 28], [point.x + 28, point.y + 28]];
  const feature = map.queryRenderedFeatures(box, { layers: FEATURE_LAYERS }).find((item) => item.properties?.icao24);
  const icao24 = feature?.properties?.icao24;
  if (icao24) useFlightsStore.getState().setSelectedIcao24(String(icao24));
}

function patchMapClicks(): void {
  const prototype = maplibregl.Map.prototype as PatchedMapPrototype;
  if (prototype[PATCH_KEY]) return;

  const originalFire = prototype.fire;
  prototype.fire = function patchedFire(type: string, data?: unknown) {
    if (type === 'click') {
      const payload = data as MapClickPayload | undefined;
      if (payload?.point) selectRenderedAircraft(this as maplibregl.Map, payload.point);
    }
    return originalFire.call(this, type, data);
  } as typeof prototype.fire;

  prototype[PATCH_KEY] = true;
}

if (typeof window !== 'undefined') {
  const scopedWindow = window as ScopedWindow;
  if (!scopedWindow[BOOT_KEY]) {
    scopedWindow[BOOT_KEY] = true;
    patchMapClicks();
  }
}
