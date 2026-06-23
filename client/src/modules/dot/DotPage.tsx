import React, { useEffect, useMemo, useState } from 'react';
import Map, { Layer, NavigationControl, Popup, Source } from 'react-map-gl/maplibre';
import type { MapLayerMouseEvent } from 'maplibre-gl';
import { Camera, CarFront, RefreshCcw, TriangleAlert } from 'lucide-react';
import { useThemeStore } from '../../ui/theme/theme.store';
import { SATELLITE_STYLE, LIGHT_STYLE, DARK_STYLE, STREET_STYLE } from '../../lib/mapStyles';
import { MapLayerControl } from '../flights/components/MapLayerControl';
import { NoaaWeatherRadarLayer } from '../weather/NoaaWeatherRadarLayer';

type TrafficCamera = {
  id: string;
  name: string;
  lat: number;
  lon: number;
  imageUrl?: string;
  streamUrl?: string;
  roadway?: string;
  direction?: string;
  status?: string;
};

type TrafficUpdate = {
  id: string;
  title: string;
  description?: string;
  lat?: number;
  lon?: number;
  severity?: string;
  type?: string;
  updatedAt?: string;
};

const DEFAULT_VIEW = { longitude: -98.5795, latitude: 39.8283, zoom: 4 };

function normalizeCameraFeature(feature: GeoJSON.Feature, index: number): TrafficCamera | null {
  if (feature.geometry?.type !== 'Point') return null;
  const coords = feature.geometry.coordinates;
  const p = (feature.properties || {}) as Record<string, unknown>;
  const imageUrl = String(p.imageUrl || p.image_url || p.snapshot || p.snapshotUrl || p.url || p.CameraURL || '');
  const streamUrl = String(p.streamUrl || p.stream_url || p.videoUrl || p.VideoURL || imageUrl || '');
  return {
    id: String(p.id || p.ID || p.objectid || p.OBJECTID || `camera-${index}`),
    name: String(p.name || p.Name || p.title || p.Title || p.location || p.Location || `Traffic Camera ${index + 1}`),
    lon: coords[0],
    lat: coords[1],
    imageUrl,
    streamUrl,
    roadway: String(p.roadway || p.road || p.route || p.Route || ''),
    direction: String(p.direction || p.Direction || ''),
    status: String(p.status || p.Status || ''),
  };
}

function normalizeUpdateFeature(feature: GeoJSON.Feature, index: number): TrafficUpdate | null {
  const p = (feature.properties || {}) as Record<string, unknown>;
  let lat: number | undefined;
  let lon: number | undefined;
  if (feature.geometry?.type === 'Point') {
    lon = feature.geometry.coordinates[0];
    lat = feature.geometry.coordinates[1];
  }
  return {
    id: String(p.id || p.ID || p.objectid || p.OBJECTID || `update-${index}`),
    title: String(p.title || p.Title || p.name || p.Name || p.event || p.Event || `Traffic Update ${index + 1}`),
    description: String(p.description || p.Description || p.details || p.Details || p.comments || ''),
    lat,
    lon,
    severity: String(p.severity || p.Severity || p.impact || p.Impact || ''),
    type: String(p.type || p.Type || p.category || p.Category || ''),
    updatedAt: String(p.updatedAt || p.updated_at || p.lastUpdated || p.LastUpdated || ''),
  };
}

async function fetchGeoJson<T>(url: string, normalizer: (feature: GeoJSON.Feature, index: number) => T | null): Promise<T[]> {
  if (!url) return [];
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Feed failed: ${response.status}`);
  const body = (await response.json()) as GeoJSON.FeatureCollection;
  return (body.features || []).map(normalizer).filter(Boolean) as T[];
}

function camerasToGeoJson(cameras: TrafficCamera[]): GeoJSON.FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: cameras.map((camera) => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [camera.lon, camera.lat] },
      properties: { id: camera.id, name: camera.name, status: camera.status || '' },
    })),
  };
}

function updatesToGeoJson(updates: TrafficUpdate[]): GeoJSON.FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: updates
      .filter((update) => update.lat != null && update.lon != null)
      .map((update) => ({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [update.lon as number, update.lat as number] },
        properties: { id: update.id, title: update.title, severity: update.severity || '', type: update.type || '' },
      })),
  };
}

export const DotPage: React.FC = () => {
  const { mapLayer, mapProjection } = useThemeStore();
  const [cameras, setCameras] = useState<TrafficCamera[]>([]);
  const [updates, setUpdates] = useState<TrafficUpdate[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<TrafficCamera | null>(null);
  const [selectedUpdate, setSelectedUpdate] = useState<TrafficUpdate | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const cameraFeedUrl = import.meta.env.VITE_DOT_CAMERAS_GEOJSON_URL || '';
  const updatesFeedUrl = import.meta.env.VITE_DOT_TRAFFIC_GEOJSON_URL || '';

  const activeMapStyle = useMemo(() => {
    switch (mapLayer) {
      case 'light':
        return LIGHT_STYLE;
      case 'street':
        return STREET_STYLE;
      case 'satellite':
        return SATELLITE_STYLE;
      case 'dark':
      default:
        return DARK_STYLE;
    }
  }, [mapLayer]);

  const reload = async () => {
    setIsLoading(true);
    setError('');
    try {
      const [nextCameras, nextUpdates] = await Promise.all([
        fetchGeoJson<TrafficCamera>(cameraFeedUrl, normalizeCameraFeature),
        fetchGeoJson<TrafficUpdate>(updatesFeedUrl, normalizeUpdateFeature),
      ]);
      setCameras(nextCameras);
      setUpdates(nextUpdates);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load DOT feeds.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void reload();
    const interval = setInterval(() => void reload(), 60_000);
    return () => clearInterval(interval);
  }, []);

  const cameraGeoJson = useMemo(() => camerasToGeoJson(cameras), [cameras]);
  const updatesGeoJson = useMemo(() => updatesToGeoJson(updates), [updates]);

  const handleMapClick = (event: MapLayerMouseEvent) => {
    const feature = event.features?.[0];
    if (!feature) {
      setSelectedCamera(null);
      setSelectedUpdate(null);
      return;
    }
    const id = String(feature.properties?.id || '');
    if (feature.layer.id === 'dot-camera-points') {
      setSelectedUpdate(null);
      setSelectedCamera(cameras.find((camera) => camera.id === id) || null);
    }
    if (feature.layer.id === 'dot-traffic-update-points') {
      setSelectedCamera(null);
      setSelectedUpdate(updates.find((update) => update.id === id) || null);
    }
  };

  return (
    <div className="absolute inset-0 bg-intel-bg overflow-hidden flex flex-col">
      <div className="h-10 border-b border-intel-accent/25 bg-black/70 flex items-center justify-between px-4 font-mono z-20">
        <div className="flex items-center gap-3">
          <CarFront size={16} className="text-intel-accent" />
          <span className="text-xs uppercase tracking-[0.24em] text-intel-text-light">DOT Traffic Command</span>
          <span className="text-[10px] text-white/35">Updates: {updates.length}</span>
          <span className="text-[10px] text-white/35">Cameras: {cameras.length}</span>
        </div>
        <button onClick={() => void reload()} className="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-intel-accent border border-intel-accent/35 px-3 py-1 hover:bg-intel-accent/10">
          <RefreshCcw size={12} className={isLoading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      <div className="relative flex-1">
        <Map
          initialViewState={DEFAULT_VIEW}
          mapStyle={activeMapStyle}
          styleDiffing={false}
          interactiveLayerIds={['dot-camera-points', 'dot-traffic-update-points']}
          onClick={handleMapClick}
          projection={
            mapProjection === 'globe'
              ? ({ type: 'globe' } as import('maplibre-gl').ProjectionSpecification)
              : ({ type: 'mercator' } as import('maplibre-gl').ProjectionSpecification)
          }
          style={{ width: '100%', height: '100%' }}
        >
          <NavigationControl position="top-right" showCompass={true} visualizePitch={true} />
          <NoaaWeatherRadarLayer />

          <Source id="dot-traffic-updates" type="geojson" data={updatesGeoJson}>
            <Layer
              id="dot-traffic-update-points"
              type="circle"
              paint={{
                'circle-radius': 7,
                'circle-color': '#f97316',
                'circle-stroke-width': 2,
                'circle-stroke-color': '#111827',
                'circle-opacity': 0.9,
              }}
            />
          </Source>

          <Source id="dot-cameras" type="geojson" data={cameraGeoJson}>
            <Layer
              id="dot-camera-points"
              type="circle"
              paint={{
                'circle-radius': 6,
                'circle-color': '#38bdf8',
                'circle-stroke-width': 2,
                'circle-stroke-color': '#020617',
                'circle-opacity': 0.92,
              }}
            />
          </Source>

          {selectedCamera && (
            <Popup longitude={selectedCamera.lon} latitude={selectedCamera.lat} anchor="bottom" closeButton={false} onClose={() => setSelectedCamera(null)}>
              <div className="bg-[#05070b] border border-sky-400/30 text-white font-mono min-w-[260px] max-w-[360px]">
                <div className="px-3 py-2 border-b border-sky-400/20 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sky-300 text-[10px] uppercase tracking-[0.18em]"><Camera size={13} /> DOT Camera</div>
                  <button onClick={() => setSelectedCamera(null)} className="text-white/40 hover:text-white">×</button>
                </div>
                <div className="p-3 space-y-2">
                  <div className="text-sm font-bold text-white">{selectedCamera.name}</div>
                  {(selectedCamera.roadway || selectedCamera.direction) && <div className="text-[10px] text-white/45">{selectedCamera.roadway} {selectedCamera.direction}</div>}
                  {selectedCamera.imageUrl ? (
                    <img src={selectedCamera.imageUrl} alt={selectedCamera.name} className="w-full border border-white/10 bg-black" />
                  ) : selectedCamera.streamUrl ? (
                    <a href={selectedCamera.streamUrl} target="_blank" rel="noreferrer" className="block border border-sky-400/30 px-3 py-2 text-sky-300 text-xs hover:bg-sky-400/10">Open live camera</a>
                  ) : (
                    <div className="text-[11px] text-white/40 border border-white/10 p-3">No image URL in camera feed.</div>
                  )}
                </div>
              </div>
            </Popup>
          )}

          {selectedUpdate && selectedUpdate.lat != null && selectedUpdate.lon != null && (
            <Popup longitude={selectedUpdate.lon} latitude={selectedUpdate.lat} anchor="bottom" closeButton={false} onClose={() => setSelectedUpdate(null)}>
              <div className="bg-[#05070b] border border-orange-400/30 text-white font-mono min-w-[240px] max-w-[330px]">
                <div className="px-3 py-2 border-b border-orange-400/20 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-orange-300 text-[10px] uppercase tracking-[0.18em]"><TriangleAlert size={13} /> Traffic Update</div>
                  <button onClick={() => setSelectedUpdate(null)} className="text-white/40 hover:text-white">×</button>
                </div>
                <div className="p-3 space-y-2">
                  <div className="text-sm font-bold text-white">{selectedUpdate.title}</div>
                  {selectedUpdate.description && <div className="text-[11px] text-white/55 leading-relaxed">{selectedUpdate.description}</div>}
                  <div className="text-[10px] text-white/35">{selectedUpdate.type} {selectedUpdate.severity}</div>
                </div>
              </div>
            </Popup>
          )}
        </Map>

        <MapLayerControl />

        <aside className="absolute left-3 top-3 bottom-3 w-[340px] pointer-events-auto bg-black/75 border border-white/10 font-mono text-white overflow-hidden z-10">
          <div className="px-3 py-2 border-b border-white/10 text-[10px] uppercase tracking-[0.24em] text-intel-accent">Live Traffic Updates</div>
          {error && <div className="m-3 border border-red-400/30 bg-red-950/30 p-2 text-xs text-red-200">{error}</div>}
          {!cameraFeedUrl && !updatesFeedUrl && (
            <div className="m-3 border border-amber-300/30 bg-amber-950/20 p-3 text-xs text-amber-100/70 leading-relaxed">
              DOT feeds are not configured yet. Set VITE_DOT_TRAFFIC_GEOJSON_URL and VITE_DOT_CAMERAS_GEOJSON_URL during build to show live incidents and cameras.
            </div>
          )}
          <div className="h-full overflow-y-auto pb-16">
            {updates.slice(0, 100).map((update) => (
              <button key={update.id} onClick={() => setSelectedUpdate(update)} className="block w-full text-left px-3 py-3 border-b border-white/8 hover:bg-white/5">
                <div className="text-xs text-white/90 font-bold">{update.title}</div>
                {update.description && <div className="text-[10px] text-white/45 line-clamp-2 mt-1">{update.description}</div>}
                <div className="text-[9px] text-orange-300/65 mt-1 uppercase tracking-wide">{update.type || 'Update'} {update.severity ? `· ${update.severity}` : ''}</div>
              </button>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
};
