import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Map, { Layer, NavigationControl, Popup, Source } from 'react-map-gl/maplibre';
import type * as maplibre from 'maplibre-gl';
import { MapLayerControl } from '../flights/components/MapLayerControl';
import { useThemeStore } from '../../ui/theme/theme.store';
import { SATELLITE_STYLE, LIGHT_STYLE, DARK_STYLE, STREET_STYLE } from '../../lib/mapStyles';
import { useMaritimeSnapshot, type VesselState } from './hooks/useMaritimeSnapshot';
import { maritimeFeedHealth, useMaritimeFeedStatus } from './hooks/useMaritimeFeedStatus';
import { useVesselSelection } from './hooks/useVesselSelection';
import { useVesselDetail } from './hooks/useVesselDetail';
import { useMaritimeStore } from './state/maritime.store';
import { vesselsToPointGeoJSON, vesselHistoryToLineGeoJSON } from './lib/maritime.geojson';
import { MaritimeToolbar } from './components/MaritimeToolbar';
import { MaritimeRightDrawer } from './components/MaritimeRightDrawer';
import { useOsintStore } from '../osint/osint.store';
import {
  MARITIME_NODES,
  activeMaritimePulseGeoJSON,
  activeMaritimeSweepsGeoJSON,
  activeMaritimeZonesGeoJSON,
  maritimeInstallationsGeoJSON,
  maritimeNodesGeoJSON,
  maritimePortsGeoJSON,
  type MaritimeInstallationPin,
  type MaritimeNode,
  type MaritimePortPin,
} from './data/maritimeInfrastructure';

type StaticMaritimeLocation = {
  id: string;
  name: string;
  lat: number;
  lon: number;
  kind: 'lock' | 'base-station' | 'aid-to-navigation';
  description: string;
};

type MaritimePopup =
  | { type: 'port'; item: MaritimePortPin }
  | { type: 'installation'; item: MaritimeInstallationPin }
  | { type: 'node'; item: MaritimeNode }
  | { type: 'static'; item: StaticMaritimeLocation };

const STATIC_MARITIME_LOCATIONS: StaticMaritimeLocation[] = [
  {
    id: 'sault-ste-marie-locks',
    name: 'SAULT STE. MARIE LOCKS',
    lat: 46.5023,
    lon: -84.3722,
    kind: 'lock',
    description: 'Static maritime infrastructure: Soo Locks / Sault Ste. Marie Locks navigation chokepoint.',
  },
];

function distanceNm(aLat: number, aLon: number, bLat: number, bLon: number) {
  const r = 3440.065;
  const dLat = ((bLat - aLat) * Math.PI) / 180;
  const dLon = ((bLon - aLon) * Math.PI) / 180;
  const lat1 = (aLat * Math.PI) / 180;
  const lat2 = (bLat * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * r * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function isMoored(v: VesselState) {
  return v.navigationalStatus === 1 || v.navigationalStatus === 5;
}

function isMovingVessel(v: VesselState) {
  return !v.sourceKind || v.sourceKind === 'vessel' || v.sourceKind === 'sar-aircraft';
}

function nodeCount(node: MaritimeNode, vessels: Array<{ lat?: number; lon?: number }>) {
  return vessels.filter((v) => v.lat != null && v.lon != null && distanceNm(node.lat, node.lon, v.lat, v.lon) <= node.radiusNm).length;
}

function staticLocationsGeoJSON(staticVessels: VesselState[]) {
  const aisStatic = staticVessels.map((v) => ({
    id: `ais-static-${v.mmsi}`,
    name: v.name || `AIS STATIC ${v.mmsi}`,
    lat: v.lat,
    lon: v.lon,
    kind: v.sourceKind === 'aid-to-navigation' ? 'aid-to-navigation' : 'base-station',
    description: `${v.sourceKind === 'aid-to-navigation' ? 'AIS navigation aid' : 'AIS base station'} | MMSI ${v.mmsi}`,
  })) as StaticMaritimeLocation[];

  return {
    type: 'FeatureCollection' as const,
    features: [...STATIC_MARITIME_LOCATIONS, ...aisStatic].map((item) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [item.lon, item.lat] },
      properties: item,
    })),
  };
}

function popupTitle(popup: MaritimePopup) {
  if (popup.type === 'node') return popup.item.label;
  if (popup.type === 'static') return popup.item.name;
  return popup.item.name;
}

function popupSubtitle(popup: MaritimePopup) {
  if (popup.type === 'node') return `${popup.item.scope} | ${popup.item.radiusNm} NM maritime feed node`;
  if (popup.type === 'static') return popup.item.description;
  if (popup.type === 'installation') return popup.item.kind === 'navy-base' ? 'Navy installation' : 'Coast Guard station';
  return popup.item.kind === 'commercial-port' ? 'Commercial port' : 'Civilian port';
}

function loadMapImage(map: maplibre.Map, id: string, url: string) {
  if (map.hasImage(id)) return;
  map.loadImage(url, (error, image) => {
    if (!error && image && !map.hasImage(id)) map.addImage(id, image);
  });
}

export const MaritimePage: React.FC = () => {
  const [sweepDeg, setSweepDeg] = useState(0);
  const [popup, setPopup] = useState<MaritimePopup | null>(null);
  const { mapProjection, mapLayer } = useThemeStore();
  const osintDrawerOpen = useOsintStore((s) => s.osintDrawerOpen);
  const feedStatus = useMaritimeFeedStatus();
  const { data, isError } = useMaritimeSnapshot();
  const feed = maritimeFeedHealth(feedStatus, isError);
  const vessels = useMemo(() => data?.vessels || [], [data?.vessels]);
  const movingVessels = useMemo(() => vessels.filter(isMovingVessel), [vessels]);
  const staticVessels = useMemo(() => vessels.filter((v) => !isMovingVessel(v)), [vessels]);
  const timestamp = data?.timestamp || 0;

  const { filters, showPorts, showInstallations, showMaritimeNodes, activeMaritimeNodeIds, toggleMaritimeNode } = useMaritimeStore();

  const filteredVessels = useMemo(() => {
    return movingVessels.filter((v) => {
      if (v.sog != null && v.sog < filters.speedMin) return false;
      if (v.sog != null && v.sog > filters.speedMax) return false;
      if (filters.name && v.name && !v.name.toLowerCase().includes(filters.name.toLowerCase())) return false;
      const moored = isMoored(v);
      if (!filters.showUnderway && !moored) return false;
      if (!filters.showMoored && moored) return false;
      return true;
    });
  }, [movingVessels, filters]);

  const mooredCount = useMemo(() => movingVessels.filter(isMoored).length, [movingVessels]);
  const { selectedMmsi, setSelectedMmsi, selectedVessel } = useVesselSelection(movingVessels);
  const { data: vesselDetail } = useVesselDetail(selectedMmsi);
  const activeVessel = vesselDetail ?? selectedVessel;

  useEffect(() => {
    const timer = window.setInterval(() => setSweepDeg((x) => (x + 6) % 360), 100);
    return () => window.clearInterval(timer);
  }, []);

  const mapStyle = useMemo(() => {
    if (mapLayer === 'light') return LIGHT_STYLE;
    if (mapLayer === 'street') return STREET_STYLE;
    if (mapLayer === 'satellite') return SATELLITE_STYLE;
    return DARK_STYLE;
  }, [mapLayer]);

  const ports = useMemo(() => maritimePortsGeoJSON(), []);
  const installations = useMemo(() => maritimeInstallationsGeoJSON(), []);
  const nodes = useMemo(() => maritimeNodesGeoJSON(activeMaritimeNodeIds), [activeMaritimeNodeIds]);
  const zones = useMemo(() => activeMaritimeZonesGeoJSON(activeMaritimeNodeIds), [activeMaritimeNodeIds]);
  const pulses = useMemo(() => activeMaritimePulseGeoJSON(activeMaritimeNodeIds, sweepDeg), [activeMaritimeNodeIds, sweepDeg]);
  const sweeps = useMemo(() => activeMaritimeSweepsGeoJSON(activeMaritimeNodeIds, sweepDeg), [activeMaritimeNodeIds, sweepDeg]);
  const vesselPoints = useMemo(() => vesselsToPointGeoJSON(filteredVessels), [filteredVessels]);
  const staticPoints = useMemo(() => staticLocationsGeoJSON(staticVessels), [staticVessels]);
  const history = useMemo(() => vesselHistoryToLineGeoJSON(activeVessel ?? null), [activeVessel]);

  const onLoad = useCallback((e: { target: maplibre.Map }) => {
    loadMapImage(e.target, 'maritime-vessel', '/assets/icons/maritime-vessel.svg');
    loadMapImage(e.target, 'maritime-vessel-moored', '/assets/icons/maritime-vessel-moored.svg');
    loadMapImage(e.target, 'maritime-static', '/assets/icons/maritime-static.svg');
  }, []);

  const onClick = useCallback(
    (e: import('maplibre-gl').MapMouseEvent & { features?: import('maplibre-gl').MapGeoJSONFeature[] }) => {
      const f = e.features?.[0];
      const layerId = f?.layer?.id;
      if (layerId === 'maritime-node-points' && f?.properties?.id) {
        const node = MARITIME_NODES.find((n) => n.id === String(f.properties?.id));
        if (node) {
          toggleMaritimeNode(node.id);
          setPopup({ type: 'node', item: node });
        }
        return;
      }
      if (layerId === 'maritime-static-points' && f?.properties?.id) {
        setPopup({ type: 'static', item: f.properties as unknown as StaticMaritimeLocation });
        return;
      }
      if (layerId === 'maritime-port-points' && f?.properties?.id) {
        const port = ports.features.find((p) => p.properties.id === String(f.properties?.id));
        if (port) setPopup({ type: 'port', item: port.properties as MaritimePortPin });
        return;
      }
      if (layerId === 'maritime-installation-points' && f?.properties?.id) {
        const pin = installations.features.find((p) => p.properties.id === String(f.properties?.id));
        if (pin) setPopup({ type: 'installation', item: pin.properties as MaritimeInstallationPin });
        return;
      }
      if (f?.properties?.mmsi) {
        setSelectedMmsi(Number(f.properties.mmsi));
        setPopup(null);
        return;
      }
      setSelectedMmsi(null);
    },
    [installations.features, ports.features, setSelectedMmsi, toggleMaritimeNode],
  );

  const nodeActive = popup?.type === 'node' && activeMaritimeNodeIds.includes(popup.item.id);
  const nodeSeen = popup?.type === 'node' ? nodeCount(popup.item, vessels) : 0;

  return (
    <div className="absolute inset-0 bg-intel-bg overflow-hidden flex flex-col">
      <MaritimeToolbar totalCount={movingVessels.length} filteredCount={filteredVessels.length} mooredCount={mooredCount} portCount={ports.features.length} installationCount={installations.features.length} />
      <MaritimeRightDrawer vessel={activeVessel ?? null} onClose={() => setSelectedMmsi(null)} />
      <MapLayerControl />
      <div className="absolute inset-x-0 bottom-8 h-full bg-intel-panel pointer-events-auto z-0" style={{ top: '56px' }}>
        <Map initialViewState={{ longitude: -75, latitude: 36, zoom: 4 }} mapStyle={mapStyle} styleDiffing={false} interactiveLayerIds={osintDrawerOpen ? [] : ['vessel-points', 'maritime-static-points', 'maritime-node-points', 'maritime-port-points', 'maritime-installation-points']} onClick={onClick} onLoad={onLoad} cursor={selectedMmsi ? 'pointer' : 'crosshair'} projection={mapProjection === 'globe' ? ({ type: 'globe' } as import('maplibre-gl').ProjectionSpecification) : ({ type: 'mercator' } as import('maplibre-gl').ProjectionSpecification)} doubleClickZoom={mapProjection !== 'globe'} style={{ width: '100%', height: '100%' }}>
          <NavigationControl position="top-right" showCompass visualizePitch />
          {!osintDrawerOpen && showMaritimeNodes && <><Source id="active-maritime-zones" type="geojson" data={zones}><Layer id="active-maritime-zone-fill" type="fill" paint={{ 'fill-color': '#ffffff', 'fill-opacity': 0.035 }} /><Layer id="active-maritime-zone-ring" type="line" paint={{ 'line-color': '#ffffff', 'line-opacity': 0.85, 'line-width': 2 }} /></Source><Source id="active-maritime-pulse" type="geojson" data={pulses}><Layer id="active-maritime-pulse-ring" type="line" paint={{ 'line-color': '#ffffff', 'line-opacity': 0.45, 'line-width': 1.5, 'line-blur': 1 }} /></Source><Source id="active-maritime-sweeps" type="geojson" data={sweeps}><Layer id="active-maritime-sweep-line" type="line" paint={{ 'line-color': '#ffffff', 'line-opacity': 0.95, 'line-width': 2, 'line-blur': 1 }} /></Source><Source id="maritime-nodes" type="geojson" data={nodes}><Layer id="maritime-node-points" type="circle" paint={{ 'circle-radius': ['case', ['boolean', ['get', 'active'], false], 8, 6], 'circle-color': '#ffffff', 'circle-stroke-color': ['case', ['boolean', ['get', 'active'], false], '#ffffff', '#94a3b8'], 'circle-stroke-width': ['case', ['boolean', ['get', 'active'], false], 2, 1], 'circle-opacity': ['case', ['boolean', ['get', 'active'], false], 1, 0.65] }} /><Layer id="maritime-node-labels" type="symbol" layout={{ 'text-field': ['get', 'shortLabel'], 'text-size': 10, 'text-offset': [0, 1.2], 'text-allow-overlap': true }} paint={{ 'text-color': '#ffffff', 'text-halo-color': '#020617', 'text-halo-width': 1 }} /></Source></>}
          {!osintDrawerOpen && showPorts && <Source id="maritime-ports" type="geojson" data={ports}><Layer id="maritime-port-points" type="circle" paint={{ 'circle-radius': 5, 'circle-color': '#facc15', 'circle-stroke-color': '#713f12', 'circle-stroke-width': 1.5, 'circle-opacity': 0.92 }} /><Layer id="maritime-port-labels" type="symbol" layout={{ 'text-field': ['slice', ['get', 'name'], 0, 16], 'text-size': 9, 'text-offset': [0, 1.15], 'text-allow-overlap': false }} paint={{ 'text-color': '#fde68a', 'text-halo-color': '#020617', 'text-halo-width': 1 }} /></Source>}
          {!osintDrawerOpen && showInstallations && <Source id="maritime-installations" type="geojson" data={installations}><Layer id="maritime-installation-points" type="circle" paint={{ 'circle-radius': 5.5, 'circle-color': '#facc15', 'circle-stroke-color': '#ef4444', 'circle-stroke-width': 1.8, 'circle-opacity': 0.94 }} /><Layer id="maritime-installation-labels" type="symbol" layout={{ 'text-field': ['slice', ['get', 'name'], 0, 14], 'text-size': 9, 'text-offset': [0, 1.25], 'text-allow-overlap': false }} paint={{ 'text-color': '#fef3c7', 'text-halo-color': '#020617', 'text-halo-width': 1 }} /></Source>}
          <Source id="maritime-static" type="geojson" data={staticPoints}><Layer id="maritime-static-points" type="symbol" layout={{ 'icon-image': 'maritime-static', 'icon-size': 0.34, 'icon-allow-overlap': true }} /><Layer id="maritime-static-labels" type="symbol" layout={{ 'text-field': ['slice', ['get', 'name'], 0, 18], 'text-size': 9, 'text-offset': [0, 1.3], 'text-allow-overlap': false }} paint={{ 'text-color': '#bae6fd', 'text-halo-color': '#020617', 'text-halo-width': 1 }} /></Source>
          {activeVessel?.history && activeVessel.history.length > 1 && <Source id="vessel-history" type="geojson" data={history}><Layer id="vessel-history-line" type="line" paint={{ 'line-color': '#10b981', 'line-width': 2, 'line-opacity': 0.6, 'line-dasharray': [2, 2] }} /></Source>}
          <Source id="points-halo" type="geojson" data={vesselPoints}><Layer id="vessel-points-halo" type="circle" paint={{ 'circle-radius': ['case', ['==', ['get', 'mmsi'], selectedMmsi || 0], 12, 0], 'circle-color': 'transparent', 'circle-stroke-width': ['case', ['==', ['get', 'mmsi'], selectedMmsi || 0], 2, 0], 'circle-stroke-color': '#3b82f6' }} /></Source>
          <Source id="points" type="geojson" data={vesselPoints}><Layer id="vessel-points" type="symbol" layout={{ 'icon-image': ['case', ['in', ['get', 'navigationalStatus'], ['literal', [1, 5]]], 'maritime-vessel-moored', 'maritime-vessel'], 'icon-size': 0.38, 'icon-rotate': ['coalesce', ['get', 'heading'], ['get', 'cog'], 0], 'icon-rotation-alignment': 'map', 'icon-allow-overlap': true }} /></Source>
          {popup && <Popup longitude={popup.item.lon} latitude={popup.item.lat} anchor="bottom" closeButton={false} onClose={() => setPopup(null)}><div className="bg-[#05070b] border border-white/20 text-white font-mono min-w-[260px]"><div className="px-3 py-2 border-b border-white/10 flex items-center justify-between"><span className="text-cyan-300 text-[10px] uppercase tracking-[0.18em]">{popup.type === 'node' ? 'Maritime Feed Node' : popup.type === 'installation' ? 'Installation' : popup.type === 'static' ? 'Static Location' : 'Port'}</span><button onClick={() => setPopup(null)} className="text-white/40 hover:text-white">×</button></div><div className="p-3 space-y-1 text-[11px] text-white/65"><div className="text-white text-sm font-bold">{popupTitle(popup)}</div><div>{popupSubtitle(popup)}</div>{popup.type === 'node' && <div className={nodeActive ? 'text-cyan-200' : 'text-red-300'}>{nodeActive ? `Node diagnostic: ${nodeSeen} vessels in this region.` : 'Node diagnostic: inactive.'}</div>}</div></div></Popup>}
        </Map>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-8 bg-intel-panel border-t border-white/10 flex items-center px-4 justify-between text-xs text-intel-text z-50 overflow-hidden shrink-0 font-mono"><div className="flex space-x-6 items-center flex-1"><span className="flex items-center"><span className="opacity-50 mr-2 uppercase tracking-wide">DATA LINK:</span><span className="text-white font-semibold">AISSTREAM</span></span><span title={feed.detail} className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${feed.className}`}>{feed.label}</span><span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${activeMaritimeNodeIds.length ? 'bg-cyan-500/15 text-cyan-200 border border-cyan-500/25' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>{activeMaritimeNodeIds.length ? `ACTIVE NODES: ${activeMaritimeNodeIds.length}` : 'NO NODES AVAILABLE'}</span>{feedStatus && <span className="text-white/35 uppercase tracking-wide">MAIN CACHE: {feedStatus.vesselCount} | MSGS: {feedStatus.totalMessagesReceived}</span>}</div><div className="flex space-x-6 shrink-0 opacity-70"><span className="uppercase tracking-wide tabular-nums">LAST UPDATE: {new Date(timestamp).toLocaleTimeString()}</span></div></div>
    </div>
  );
};
