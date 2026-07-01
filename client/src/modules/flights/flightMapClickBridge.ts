import maplibregl from 'maplibre-gl';

const PATCH_KEY = '__olympusNearestAircraftClickPatch';

type PatchedWindow = Window & { [PATCH_KEY]?: boolean };

type QueryArgs = Parameters<maplibregl.Map['queryRenderedFeatures']>;
type QueryResult = ReturnType<maplibregl.Map['queryRenderedFeatures']>;

function isPointGeometry(feature: maplibregl.MapGeoJSONFeature): feature is maplibregl.MapGeoJSONFeature & { geometry: GeoJSON.Point } {
  return feature.geometry?.type === 'Point';
}

function boxCenter(box: unknown): { x: number; y: number } | null {
  if (!Array.isArray(box) || box.length !== 2) return null;
  const first = box[0];
  const second = box[1];
  if (!Array.isArray(first) || !Array.isArray(second)) return null;
  const [x1, y1] = first.map(Number);
  const [x2, y2] = second.map(Number);
  if (![x1, y1, x2, y2].every(Number.isFinite)) return null;
  return { x: (x1 + x2) / 2, y: (y1 + y2) / 2 };
}

function shouldSortAircraftFeatures(args: QueryArgs): boolean {
  const options = args[1] as { layers?: string[] } | undefined;
  return Boolean(options?.layers?.some((layer) => layer === 'aircraft-click-target' || layer === 'aircraft-points'));
}

function sortAircraftByDistance(map: maplibregl.Map, features: QueryResult, center: { x: number; y: number }): QueryResult {
  const indexed = features.map((feature, index) => {
    if (!feature.properties?.icao24 || !isPointGeometry(feature)) return { feature, index, distance: Number.POSITIVE_INFINITY };
    const [lng, lat] = feature.geometry.coordinates;
    const projected = map.project({ lng, lat });
    const dx = projected.x - center.x;
    const dy = projected.y - center.y;
    return { feature, index, distance: Math.sqrt(dx * dx + dy * dy) };
  });

  return indexed
    .sort((a, b) => a.distance - b.distance || a.index - b.index)
    .map((entry) => entry.feature) as QueryResult;
}

if (typeof window !== 'undefined') {
  const scopedWindow = window as PatchedWindow;
  if (!scopedWindow[PATCH_KEY]) {
    scopedWindow[PATCH_KEY] = true;
    const originalQueryRenderedFeatures = maplibregl.Map.prototype.queryRenderedFeatures;

    maplibregl.Map.prototype.queryRenderedFeatures = function patchedQueryRenderedFeatures(...args: QueryArgs): QueryResult {
      const result = originalQueryRenderedFeatures.apply(this, args) as QueryResult;
      const center = boxCenter(args[0]);
      if (!center || !shouldSortAircraftFeatures(args)) return result;
      return sortAircraftByDistance(this, result, center);
    };
  }
}
