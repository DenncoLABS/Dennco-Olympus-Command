import React, { useEffect, useMemo, useState } from 'react';
import MapGl, { Layer, NavigationControl, Popup, Source } from 'react-map-gl/maplibre';
import type { MapLayerMouseEvent } from 'maplibre-gl';
import { Camera, CarFront, RefreshCcw, TriangleAlert } from 'lucide-react';
import { useThemeStore } from '../../ui/theme/theme.store';
import { SATELLITE_STYLE, LIGHT_STYLE, DARK_STYLE, STREET_STYLE } from '../../lib/mapStyles';
import { MapLayerControl } from '../flights/components/MapLayerControl';

type TrafficCamera = {
  id: string;
  name: string;
  lat: number;
  lon: number;
  imageUrl?: string;
  streamUrl?: string;
  streamType?: string;
  externalUrl?: string;
  roadway?: string;
  direction?: string;
  status?: string;
  city?: string;
  country?: string;
  source?: string;
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
  source?: string;
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
    source: String(p.source || p.Source || 'DOT feed'),
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
    source: String(p.source || p.Source || 'DOT feed'),
  };
}

async function fetchGeoJson<T>(url: string, normalizer: (feature: GeoJSON.Feature, index: number) => T | null): Promise<T[]> {
  if (!url) return [];
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Feed failed: ${response.status}`);
  const body = (await response.json()) as GeoJSON.FeatureCollection;
  return (body.features || []).map(normalizer).filter(Boolean) as T[];
}

async function fetchOlympusCctv(): Promise<TrafficCamera[]> {
  const response = await fetch('/api/dot/cctv');
  if (!response.ok) throw new Error(`CCTV feed failed: ${response.status}`);
  const body = (await response.json()) as { cameras?: TrafficCamera[] };
  return (body.cameras || []).filter((camera) => Number.isFinite(camera.lat) && Number.isFinite(camera.lon));
}

async function fetchOlympusTraffic(): Promise<TrafficUpdate[]> {
  const response = await fetch('/api/dot/traffic');
  if (!response.ok) throw new Error(`Traffic feed failed: ${response.status}`);
  const body = (await response.json()) as { events?: TrafficUpdate[] };
  return (body.events || []).filter((event) => event.lat != null && event.lon != null);
}

function camerasToGeoJson(cameras: TrafficCamera[]): GeoJSON.FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: cameras.map((camera) => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [camera.lon, camera.lat] },
      properties: { id: camera.id, name: camera.name, status: camera.status || '', source: camera.source || '' },
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

function trafficFlowToGeoJson(updates: TrafficUpdate[], cameras: TrafficCamera[], tick: number): GeoJSON.FeatureCollection {
  const bases = [
    ...updates.filter((item) => item.lat != null && item.lon != null).map((item) => ({ id: item.id, lat: item.lat as number, lon: item.lon as number, label: item.title })),
    ...cameras.slice(0, 100).map((item) => ({ id: item.id, lat: item.lat, lon: item.lon, label: item.name })),
  ].slice(0, 220);

  return {
    type: 'FeatureCollection',
    features: bases.flatMap((base, index) => {
      const vehicles = index % 2 === 0 ? 3 : 2;
      return Array.from({ length: vehicles }).map((_, lane) => {
        const bearing = ((index * 37 + lane * 91) % 360);
        const radians = (bearing * Math.PI) / 180;
        const phase = ((tick + index * 11 + lane * 17) % 100) / 100;
        const distance = 0.0015 + phase * 0.018;
        const sideOffset = (lane - 1) * 0.0014;
        const lon = base.lon + Math.cos(radians) * distance - Math.sin(radians) * sideOffset;
        const lat = base.lat + Math.sin(radians) * distance + Math.cos(radians) * sideOffset;
        return {
          type: 'Feature' as const,
          geometry: { type: 'Point' as const, coordinates: [lon, lat] },
          properties: {
            id: `flow-${base.id}-${lane}`,
            bearing,
            label: base.label,
          },
        };
      });
    }),
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
  const [trafficTick, setTrafficTick] = useState(0);

  const cameraFeedUrl = import.meta.env.VITE_DOT_CAMERAS_GEOJSON_URL || '';
  const updatesFeedUrl = import.meta.env.VITE_DOT_TRAFFIC_GEOJSON_URL || '';

  const activeMapStyle = useMemo(() => {
    switch (mapLayer) {
      case 'light': return LIGHT_STYLE;
      case 'street': return STREET_STYLE;
      case 'satellite': return SATELLITE_STYLE;
      case 'dark':
      default: return DARK_STYLE;
    }
  }, [mapLayer]);

  const reload = async () => {
    setIsLoading(true);
    setError('');
    try {
      const [envCameras, osirisCameras, envUpdates, liveUpdates] = await Promise.all([
        fetchGeoJson<TrafficCamera>(cameraFeedUrl, normalizeCameraFeature).catch(() => []),
        fetchOlympusCctv().catch(() => []),
        fetchGeoJson<TrafficUpdate>(updatesFeedUrl, normalizeUpdateFeature).catch(() => []),
        fetchOlympusTraffic().catch(() => []),
      ]);
      const cameraDedup = new globalThis.Map<string, TrafficCamera>();
      [...envCameras, ...osirisCameras].forEach((camera) => cameraDedup.set(camera.id, camera));
      const updateDedup = new globalThis.Map<string, TrafficUpdate>();
      [...envUpdates, ...liveUpdates].forEach((update) => updateDedup.set(update.id, update));
      setCameras([...cameraDedup.values()]);
      setUpdates([...updateDedup.values()]);
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

  useEffect(() => {
    const interval = setInterval(() => setTrafficTick((value) => (value + 1) % 100), 500);
    return () => clearInterval(interval);
  }, []);

  const cameraGeoJson = useMemo(() => camerasToGeoJson(cameras), [cameras]);
  const updatesGeoJson = useMemo(() => updatesToGeoJson(updates), [updates]);
  const trafficFlowGeoJson = useMemo(() => trafficFlowToGeoJson(updates, cameras, trafficTick), [updates, cameras, trafficTick]);

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
          <span className="text-[10px] text-white/35">Traffic: {updates.length}</span>
          <span className="text-[10px] text-white/35">Cameras: {cameras.length}</span>
          <span className="text-[10px] text-emerald-300/70">Road flow appears at zoom 6+</span>
        </div>
        <button onClick={() => void reload()} className="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-intel-accent border border-intel-accent/35 px-3 py-1 hover:bg-intel-accent/10">
          <RefreshCcw size={12} className={isLoading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      <div className="relative flex-1">
        <MapGl
          initialViewState={DEFAULT_VIEW}
          mapStyle={activeMapStyle}
          styleDiffing={false}
          interactiveLayerIds={['dot-camera-points', 'dot-traffic-update-points']}
          onClick={handleMapClick}
          projection={mapProjection === 'globe' ? ({ type: 'globe' } as import('maplibre-gl').ProjectionSpecification) : ({ type: 'mercator' } as import('maplibre-gl').ProjectionSpecification)}
          style={{ width: '100%', height: '100%' }}
        >
          <NavigationControl position="top-right" showCompass={true} visualizePitch={true} />
          <Source id="dot-traffic-updates" type="geojson" data={updatesGeoJson}>
            <Layer id="dot-traffic-update-points" type="circle" paint={{ 'circle-radius': 7, 'circle-color': '#f97316', 'circle-stroke-width': 2, 'circle-stroke-color': '#111827', 'circle-opacity': 0.9 }} />
          </Source>
          <Source id="dot-cameras" type="geojson" data={cameraGeoJson}>
            <Layer id="dot-camera-points" type="circle" paint={{ 'circle-radius': 6, 'circle-color': '#38bdf8', 'circle-stroke-width': 2, 'circle-stroke-color': '#020617', 'circle-opacity': 0.92 }} />
          </Source>
          <Source id="dot-traffic-flow" type="geojson" data={trafficFlowGeoJson}>
            <Layer id="dot-traffic-flow-glow" type="circle" minzoom={6} paint={{ 'circle-radius': ['interpolate', ['linear'], ['zoom'], 6, 8, 12, 18], 'circle-color': '#22c55e', 'circle-opacity': 0.22 }} />
            <Layer id="dot-traffic-flow-cars" type="circle" minzoom={6} paint={{ 'circle-radius': ['interpolate', ['linear'], ['zoom'], 6, 4, 12, 8], 'circle-color': '#22c55e', 'circle-stroke-width': 2, 'circle-stroke-color': '#052e16', 'circle-opacity': 0.95 }} />
          </Source>
          {selectedCamera && (
            <Popup longitude={selectedCamera.lon} latitude={selectedCamera.lat} anchor="bottom" closeButton={false} onClose={() => setSelectedCamera(null)}>
              <div className="bg-[#05070b] border border-sky-400/30 text-white font-mono min-w-[260px] max-w-[360px]"><div className="px-3 py-2 border-b border-sky-400/20 flex items-center justify-between"><div className="flex items-center gap-2 text-sky-300 text-[10px] uppercase tracking-[0.18em]"><Camera size={13} /> DOT CCTV</div><button onClick={() => setSelectedCamera(null)} className="text-white/40 hover:text-white">×</button></div><div className="p-3 space-y-2"><div className="text-sm font-bold text-white">{selectedCamera.name}</div><div className="text-[10px] text-white/45">{selectedCamera.city || selectedCamera.roadway} {selectedCamera.country || selectedCamera.direction}</div>{selectedCamera.source && <div className="text-[10px] text-sky-300/65 uppercase tracking-wide">{selectedCamera.source}</div>}{selectedCamera.imageUrl ? (<img src={selectedCamera.imageUrl} alt={selectedCamera.name} className="w-full border border-white/10 bg-black" />) : selectedCamera.streamUrl ? (<a href={selectedCamera.streamUrl} target="_blank" rel="noreferrer" className="block border border-sky-400/30 px-3 py-2 text-sky-300 text-xs hover:bg-sky-400/10">Open live camera</a>) : selectedCamera.externalUrl ? (<a href={selectedCamera.externalUrl} target="_blank" rel="noreferrer" className="block border border-sky-400/30 px-3 py-2 text-sky-300 text-xs hover:bg-sky-400/10">Open external camera</a>) : (<div className="text-[11px] text-white/40 border border-white/10 p-3">No image URL in camera feed.</div>)}</div></div>
            </Popup>
          )}
          {selectedUpdate && selectedUpdate.lat != null && selectedUpdate.lon != null && (
            <Popup longitude={selectedUpdate.lon} latitude={selectedUpdate.lat} anchor="bottom" closeButton={false} onClose={() => setSelectedUpdate(null)}>
              <div className="bg-[#05070b] border border-orange-400/30 text-white font-mono min-w-[240px] max-w-[330px]"><div className="px-3 py-2 border-b border-orange-400/20 flex items-center justify-between"><div className="flex items-center gap-2 text-orange-300 text-[10px] uppercase tracking-[0.18em]"><TriangleAlert size={13} /> Traffic Update</div><button onClick={() => setSelectedUpdate(null)} className="text-white/40 hover:text-white">×</button></div><div className="p-3 space-y-2"><div className="text-sm font-bold text-white">{selectedUpdate.title}</div>{selectedUpdate.description && <div className="text-[11px] text-white/55 leading-relaxed">{selectedUpdate.description}</div>}<div className="text-[10px] text-white/35">{selectedUpdate.type} {selectedUpdate.severity}</div>{selectedUpdate.source && <div className="text-[10px] text-orange-300/65 uppercase tracking-wide">{selectedUpdate.source}</div>}</div></div>
            </Popup>
          )}
        </MapGl>
        <MapLayerControl />
        <aside className="absolute left-3 top-3 bottom-3 w-[340px] pointer-events-auto bg-black/75 border border-white/10 font-mono text-white overflow-hidden z-10">
          <div className="px-3 py-2 border-b border-white/10 text-[10px] uppercase tracking-[0.24em] text-intel-accent">Live DOT Traffic + CCTV</div>
          {error && <div className="m-3 border border-red-400/30 bg-red-950/30 p-2 text-xs text-red-200">{error}</div>}
          {!cameraFeedUrl && !updatesFeedUrl && <div className="m-3 border border-sky-300/30 bg-sky-950/20 p-3 text-xs text-sky-100/70 leading-relaxed">Live traffic is loaded through /api/dot/traffic. Global CCTV is loaded through /api/dot/cctv. Zoom into roads to see animated traffic-flow dots.</div>}
          <div className="h-full overflow-y-auto pb-16">
            {updates.slice(0, 100).map((update) => <button key={update.id} onClick={() => setSelectedUpdate(update)} className="block w-full text-left px-3 py-3 border-b border-white/8 hover:bg-white/5"><div className="text-xs text-white/90 font-bold">{update.title}</div>{update.description && <div className="text-[10px] text-white/45 line-clamp-2 mt-1">{update.description}</div>}<div className="text-[9px] text-orange-300/65 mt-1 uppercase tracking-wide">{update.type || 'Update'} {update.severity ? `· ${update.severity}` : ''} {update.source ? `· ${update.source}` : ''}</div></button>)}
            {cameras.slice(0, 80).map((camera) => <button key={camera.id} onClick={() => setSelectedCamera(camera)} className="block w-full text-left px-3 py-3 border-b border-white/8 hover:bg-white/5"><div className="text-xs text-white/90 font-bold">{camera.name}</div><div className="text-[10px] text-white/45 mt-1">{camera.city || camera.roadway} {camera.country || camera.direction}</div><div className="text-[9px] text-sky-300/65 mt-1 uppercase tracking-wide">{camera.source || 'Camera'}</div></button>)}
          </div>
        </aside>
      </div>
    </div>
  );
};
