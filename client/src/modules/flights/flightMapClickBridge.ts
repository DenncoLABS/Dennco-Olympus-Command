import * as maplibregl from 'maplibre-gl';
import { useFlightsStore } from './state/flights.store';

const PATCH_KEY = '__olympusAircraftClickAndResizePatchV2';
const FEATURE_LAYERS = ['aircraft-points', 'aircraft-click-target'];
const CLICK_RADIUS_PX = 9;
const FALLBACK_RADIUS_PX = 16;

type PatchedWindow = Window & { [PATCH_KEY]?: boolean };
type AnyMap = maplibregl.Map & {
  fire: (...args: any[]) => unknown;
  __olympusLastSize?: string;
};

type Point = { x: number; y: number };

type AircraftHit = {
  feature: maplibregl.MapGeoJSONFeature;
  index: number;
  distance: number;
};

function aircraftQueryBox(point: Point, radius: number): [[number, number], [number, number]] {
  return [[point.x - radius, point.y - radius], [point.x + radius, point.y + radius]];
}

function isAircraftFeature(feature: maplibregl.MapGeoJSONFeature): boolean {
  return Boolean(feature.properties?.icao24 && feature.geometry?.type === 'Point');
}

function distanceFromClick(map: maplibregl.Map, feature: maplibregl.MapGeoJSONFeature, point: Point): number {
  if (feature.geometry?.type !== 'Point') return Number.POSITIVE_INFINITY;
  const [lng, lat] = (feature.geometry as GeoJSON.Point).coordinates;
  const projected = map.project({ lng, lat });
  const dx = projected.x - point.x;
  const dy = projected.y - point.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function nearestAircraft(map: maplibregl.Map, point: Point, radius: number): maplibregl.MapGeoJSONFeature | null {
  const features = map.queryRenderedFeatures(aircraftQueryBox(point, radius), { layers: FEATURE_LAYERS });
  const hits: AircraftHit[] = features
    .filter(isAircraftFeature)
    .map((feature, index) => ({ feature, index, distance: distanceFromClick(map, feature, point) }))
    .sort((a, b) => a.distance - b.distance || a.index - b.index);

  return hits[0]?.feature || null;
}

function selectNearestAircraft(map: maplibregl.Map, point: Point): void {
  const feature = nearestAircraft(map, point, CLICK_RADIUS_PX) || nearestAircraft(map, point, FALLBACK_RADIUS_PX);
  const icao24 = feature?.properties?.icao24;
  if (icao24) useFlightsStore.getState().setSelectedIcao24(String(icao24).trim().toLowerCase());
}

function patchClickFire(): void {
  const prototype = maplibregl.Map.prototype as unknown as AnyMap;
  if ((prototype as any).__olympusClickFirePatchedV2) return;
  const originalFire = prototype.fire;

  prototype.fire = function patchedFire(this: maplibregl.Map, ...args: any[]) {
    const [type, payload] = args;
    if (type === 'click' && payload?.point) selectNearestAircraft(this, payload.point);
    return originalFire.apply(this, args);
  };

  (prototype as any).__olympusClickFirePatchedV2 = true;
}

function patchAircraftQueries(): void {
  const prototype = maplibregl.Map.prototype as unknown as AnyMap;
  if ((prototype as any).__olympusAircraftQueryPatchedV2) return;
  const originalQueryRenderedFeatures = prototype.queryRenderedFeatures;

  prototype.queryRenderedFeatures = function patchedQueryRenderedFeatures(this: maplibregl.Map, ...args: any[]) {
    const options = args[1] as { layers?: string[] } | undefined;
    const isAircraftQuery = Boolean(options?.layers?.some((layer) => FEATURE_LAYERS.includes(layer)));
    const box = args[0];

    if (isAircraftQuery && Array.isArray(box) && Array.isArray(box[0]) && Array.isArray(box[1])) {
      const x = (Number(box[0][0]) + Number(box[1][0])) / 2;
      const y = (Number(box[0][1]) + Number(box[1][1])) / 2;
      if (Number.isFinite(x) && Number.isFinite(y)) {
        const tight = originalQueryRenderedFeatures.call(this, aircraftQueryBox({ x, y }, CLICK_RADIUS_PX), options);
        const result = tight.length ? tight : originalQueryRenderedFeatures.call(this, aircraftQueryBox({ x, y }, FALLBACK_RADIUS_PX), options);
        return [...result].sort((a, b) => distanceFromClick(this, a, { x, y }) - distanceFromClick(this, b, { x, y }));
      }
    }

    return originalQueryRenderedFeatures.apply(this, args);
  };

  (prototype as any).__olympusAircraftQueryPatchedV2 = true;
}

function keepMapsResized(): void {
  window.setInterval(() => {
    const canvases = Array.from(document.querySelectorAll('.maplibregl-canvas')) as HTMLCanvasElement[];
    for (const canvas of canvases) {
      const container = canvas.closest('.maplibregl-map') as HTMLElement | null;
      if (!container) continue;
      const size = `${container.clientWidth}x${container.clientHeight}`;
      const map = (canvas as any).__map || (container as any).__map;
      if (map?.resize && map.__olympusLastSize !== size) {
        map.__olympusLastSize = size;
        map.resize();
      }
    }
    window.dispatchEvent(new Event('resize'));
  }, 1200);
}

if (typeof window !== 'undefined') {
  const scopedWindow = window as PatchedWindow;
  if (!scopedWindow[PATCH_KEY]) {
    scopedWindow[PATCH_KEY] = true;
    patchClickFire();
    patchAircraftQueries();
    keepMapsResized();
  }
}
