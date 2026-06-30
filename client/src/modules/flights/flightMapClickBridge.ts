import { useFlightsStore } from './state/flights.store';

const BOOT_KEY = '__olympusFlightMapClickBridgeReady';
const CANVAS_SELECTOR = '.maplibregl-canvas';
const FEATURE_LAYERS = ['aircraft-click-target', 'aircraft-points'];

type ScopedWindow = Window & { [BOOT_KEY]?: boolean };

type MapLibreCanvas = HTMLCanvasElement & {
  __map?: {
    queryRenderedFeatures?: (box: [[number, number], [number, number]], options?: { layers?: string[] }) => Array<{ properties?: Record<string, unknown> }>;
  };
};

function findMapFromCanvas(canvas: MapLibreCanvas) {
  return canvas.__map;
}

function selectFeatureAt(canvas: MapLibreCanvas, event: MouseEvent): boolean {
  const map = findMapFromCanvas(canvas);
  if (!map?.queryRenderedFeatures) return false;

  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  const box: [[number, number], [number, number]] = [[x - 24, y - 24], [x + 24, y + 24]];
  const feature = map.queryRenderedFeatures(box, { layers: FEATURE_LAYERS }).find((item) => item.properties?.icao24);
  const icao24 = feature?.properties?.icao24;
  if (!icao24) return false;

  useFlightsStore.getState().setSelectedIcao24(String(icao24));
  return true;
}

function handleDocumentClick(event: MouseEvent): void {
  const target = event.target as HTMLElement | null;
  const canvas = target?.closest(CANVAS_SELECTOR) as MapLibreCanvas | null;
  if (!canvas) return;
  selectFeatureAt(canvas, event);
}

if (typeof window !== 'undefined') {
  const scopedWindow = window as ScopedWindow;
  if (!scopedWindow[BOOT_KEY]) {
    scopedWindow[BOOT_KEY] = true;
    document.addEventListener('click', handleDocumentClick, true);
  }
}
