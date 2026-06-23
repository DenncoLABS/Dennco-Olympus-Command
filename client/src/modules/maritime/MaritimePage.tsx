import React, { useMemo, useEffect, useState, useCallback, useRef } from 'react';
import Map, { Source, Layer, NavigationControl, Popup } from 'react-map-gl/maplibre';
import type { MapRef } from 'react-map-gl/maplibre';
import { useMaritimeSnapshot } from './hooks/useMaritimeSnapshot';
import { useVesselSelection } from './hooks/useVesselSelection';
import { useVesselDetail } from './hooks/useVesselDetail';
import { useMaritimeStore } from './state/maritime.store';
import { vesselsToPointGeoJSON, vesselHistoryToLineGeoJSON } from './lib/maritime.geojson';
import { useThemeStore } from '../../ui/theme/theme.store';
import { MapLayerControl } from '../flights/components/MapLayerControl';
import { MaritimeToolbar } from './components/MaritimeToolbar';
import { MaritimeRightDrawer } from './components/MaritimeRightDrawer';
import { useOsintStore } from '../osint/osint.store';
import { SATELLITE_STYLE, LIGHT_STYLE, DARK_STYLE, STREET_STYLE } from '../../lib/mapStyles';
import {
  activeMaritimePulseGeoJSON,
  activeMaritimeSweepsGeoJSON,
  activeMaritimeZonesGeoJSON,
  maritimeInstallationsGeoJSON,
  maritimeNodesGeoJSON,
  maritimePortsGeoJSON,
  MARITIME_NODES,
  type MaritimeInstallationPin,
  type MaritimeNode,
  type MaritimePortPin,
} from './data/maritimeInfrastructure';

const ICON_URLS = {
  'ship-white':
    'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="%23ffffff" stroke="%23000000" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>',
  'ship-green':
    'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="%2310b981" stroke="%23042f2e" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>',
  'ship-orange':
    'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="%23f59e0b" stroke="%23451a03" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>',
};

const PRELOADED_ICONS: Record<string, HTMLImageElement> = {};
let iconsLoaded = false;
const iconsPromise = Promise.all(
  Object.entries(ICON_URLS).map(
    ([id, url]) =>
      new Promise<void>((resolve) => {
        const img = new Image(32, 32);
        img.onload = () => {
          PRELOADED_ICONS[id] = img;
          resolve();
        };
        img.src = url;
      }),
  ),
).then(() => {
  iconsLoaded = true;
});

type MaritimePopup =
  | { type: 'port'; item: MaritimePortPin }
  | { type: 'installation'; item: MaritimeInstallationPin }
  | { type: 'node'; item: MaritimeNode };

function popupTitle(popup: MaritimePopup): string {
  return popup.item.name || popup.item.label;
}

function popupSubtitle(popup: MaritimePopup): string {
  if (popup.type === 'node') return `${popup.item.scope} | ${popup.item.radiusNm} NM maritime feed node`;
  if (popup.type === 'installation') return popup.item.kind === 'navy-base' ? 'Navy installation' : 'Coast Guard station';
  return popup.item.kind === 'commercial-port' ? 'Commercial port' : 'Civilian port';
}

export const MaritimePage: React.FC = () => {
  const mapRef = useRef<MapRef>(null);
  const [imagesReady, setImagesReady] = useState(iconsLoaded);
  const [sweepDeg, setSweepDeg] = useState(0);
  const [infrastructurePopup, setInfrastructurePopup] = useState<MaritimePopup | null>(null);
  const mapProjection = useThemeStore((s) => s.mapProjection);
  const mapLayer = useThemeStore((s) => s.mapLayer);
  const osintDrawerOpen = useOsintStore((s) => s.osintDrawerOpen);

  useEffect(() => {
    if (!imagesReady) iconsPromise.then(() => setImagesReady(true));
  }, [imagesReady]);

  useEffect(() => {
    const timer = window.setInterval(() => setSweepDeg((current) => (current + 6) % 360), 100);
    return () => window.clearInterval(timer);
  }, []);

  const { data, isError } = useMaritimeSnapshot();
  const vessels = useMemo(() => data?.vessels || [], [data?.vessels]);
  const timestamp = data?.timestamp || 0;

  const {
    filters,
    showPorts,
    showInstallations,
    showMaritimeNodes,
    activeMaritimeNodeIds,
    toggleMaritimeNode,
  } = useMaritimeStore();
  const { selectedMmsi, setSelectedMmsi, selectedVessel } = useVesselSelection(vessels);

  const filteredVessels = useMemo(() => {
    return vessels.filter((v) => {
      if (v.sog != null && v.sog < filters.speedMin) return false;
      if (v.sog != null && v.sog > filters.speedMax) return false;
      if (filters.name && v.name && !v.name.toLowerCase().includes(filters.name.toLowerCase())) return false;
      const isMoored = v.navigationalStatus === 1 || v.navigationalStatus === 5;
      if (!filters.showUnderway && !isMoored) return false;
      if (!filters.showMoored && isMoored) return false;
      return true;
    });
  }, [vessels, filters]);

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

  const { data: vesselDetail } = useVesselDetail(selectedMmsi);
  const activeVessel = vesselDetail ?? selectedVessel;
  const onClose = useCallback(() => setSelectedMmsi(null), [setSelectedMmsi]);

  const portsGeoJSON = useMemo(() => maritimePortsGeoJSON(), []);
  const installationsGeoJSON = useMemo(() => maritimeInstallationsGeoJSON(), []);
  const nodesGeoJSON = useMemo(() => maritimeNodesGeoJSON(activeMaritimeNodeIds), [activeMaritimeNodeIds]);
  const activeZonesGeoJSON = useMemo(() => activeMaritimeZonesGeoJSON(activeMaritimeNodeIds), [activeMaritimeNodeIds]);
  const activePulseGeoJSON = useMemo(() => activeMaritimePulseGeoJSON(activeMaritimeNodeIds, sweepDeg), [activeMaritimeNodeIds, sweepDeg]);
  const activeSweepsGeoJSON = useMemo(() => activeMaritimeSweepsGeoJSON(activeMaritimeNodeIds, sweepDeg), [activeMaritimeNodeIds, sweepDeg]);

  const historyGeoJSON = useMemo(() => vesselHistoryToLineGeoJSON(activeVessel ?? null), [activeVessel]);
  const EMPTY_FC = useMemo(() => ({ type: 'FeatureCollection' as const, features: [] as never[] }), []);
  const filteredVesselsRef = useRef(filteredVessels);
  const dirtyRef = useRef(true);

  useEffect(() => {
    filteredVesselsRef.current = filteredVessels;
    dirtyRef.current = true;
  }, [filteredVessels]);

  useEffect(() => {
    const interval = setInterval(() => {
      const { osintDrawerOpen } = useOsintStore.getState();
      if (!dirtyRef.current || osintDrawerOpen) return;
      const map = mapRef.current?.getMap();
      if (!map) return;
      dirtyRef.current = false;
      const geojson = vesselsToPointGeoJSON(filteredVesselsRef.current);
      const pointsSource = map.getSource('points') as import('maplibre-gl').GeoJSONSource;
      if (pointsSource?.setData) pointsSource.setData(geojson);
      const haloSource = map.getSource('points-halo') as import('maplibre-gl').GeoJSONSource;
      if (haloSource?.setData) haloSource.setData(geojson);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const onClick = useCallback(
    (e: import('maplibre-gl').MapMouseEvent & { features?: import('maplibre-gl').MapGeoJSONFeature[] }) => {
      const feature = e.features?.[0];
      const layerId = feature?.layer?.id;

      if (layerId === 'maritime-node-points' && feature?.properties?.id) {
        const node = MARITIME_NODES.find((item) => item.id === String(feature.properties?.id));
        if (node) {
          toggleMaritimeNode(node.id);
          setInfrastructurePopup({ type: 'node', item: node });
        }
        return;
      }

      if (layerId === 'maritime-port-points' && feature?.properties?.id) {
        const port = portsGeoJSON.features.find((item) => item.properties.id === String(feature.properties?.id));
        if (port) setInfrastructurePopup({ type: 'port', item: port.properties as MaritimePortPin });
        return;
      }

      if (layerId === 'maritime-installation-points' && feature?.properties?.id) {
        const installation = installationsGeoJSON.features.find((item) => item.properties.id === String(feature.properties?.id));
        if (installation) setInfrastructurePopup({ type: 'installation', item: installation.properties as MaritimeInstallationPin });
        return;
      }

      if (feature && feature.properties?.mmsi) {
        setSelectedMmsi(feature.properties.mmsi);
        setInfrastructurePopup(null);
      } else {
        setSelectedMmsi(null);
        const { osintDrawerOpen, setCurrentRegion } = useOsintStore.getState();
        if (osintDrawerOpen) setCurrentRegion(e.lngLat.lat, e.lngLat.lng);
      }
    },
    [installationsGeoJSON.features, portsGeoJSON.features, setSelectedMmsi, toggleMaritimeNode],
  );

  const onMapLoad = useCallback((e: { target: import('maplibre-gl').Map }) => {
    const map = e.target;
    if (iconsLoaded) {
      Object.entries(PRELOADED_ICONS).forEach(([id, img]) => {
        if (!map.hasImage(id)) map.addImage(id, img);
      });
    }
  }, []);

  const onStyleImageMissing = useCallback((e: { id: string; target: import('maplibre-gl').Map }) => {
    const map = e.target;
    if (PRELOADED_ICONS[e.id] && !map.hasImage(e.id)) map.addImage(e.id, PRELOADED_ICONS[e.id]);
  }, []);

  const onStyleData = useCallback((e: { dataType: string; target: import('maplibre-gl').Map }) => {
    if (e.dataType !== 'style') return;
    const map = e.target;
    if (iconsLoaded) {
      Object.entries(PRELOADED_ICONS).forEach(([id, img]) => {
        if (!map.hasImage(id)) map.addImage(id, img);
      });
    }
  }, []);

  return (
    <div className="absolute inset-0 bg-intel-bg overflow-hidden flex flex-col">
      <MaritimeToolbar
        totalCount={vessels.length}
        filteredCount={filteredVessels.length}
        portCount={portsGeoJSON.features.length}
        installationCount={installationsGeoJSON.features.length}
      />
      <MaritimeRightDrawer vessel={activeVessel ?? null} onClose={onClose} />
      <MapLayerControl />

      <div className="absolute inset-x-0 bottom-8 h-full bg-intel-panel pointer-events-auto z-0" style={{ top: '56px' }}>
        <Map
          ref={mapRef}
          initialViewState={{ longitude: -75, latitude: 36, zoom: 4 }}
          mapStyle={activeMapStyle}
          styleDiffing={false}
          interactiveLayerIds={
            osintDrawerOpen ? [] : ['vessel-points', 'maritime-node-points', 'maritime-port-points', 'maritime-installation-points']
          }
          onClick={onClick}
          cursor={selectedMmsi ? 'pointer' : 'crosshair'}
          onLoad={onMapLoad}
          onStyleData={onStyleData}
          onStyleImageMissing={onStyleImageMissing}
          projection={
            mapProjection === 'globe'
              ? ({ type: 'globe' } as import('maplibre-gl').ProjectionSpecification)
              : ({ type: 'mercator' } as import('maplibre-gl').ProjectionSpecification)
          }
          doubleClickZoom={mapProjection !== 'globe'}
          style={{ width: '100%', height: '100%' }}
        >
          <NavigationControl position="top-right" showCompass={true} visualizePitch={true} />

          {!osintDrawerOpen && (
            <>
              {showMaritimeNodes && (
                <>
                  <Source id="active-maritime-zones" type="geojson" data={activeZonesGeoJSON}>
                    <Layer id="active-maritime-zone-fill" type="fill" paint={{ 'fill-color': '#ffffff', 'fill-opacity': 0.035 }} />
                    <Layer id="active-maritime-zone-ring" type="line" paint={{ 'line-color': '#ffffff', 'line-opacity': 0.85, 'line-width': 2 }} />
                  </Source>
                  <Source id="active-maritime-pulse" type="geojson" data={activePulseGeoJSON}>
                    <Layer id="active-maritime-pulse-ring" type="line" paint={{ 'line-color': '#ffffff', 'line-opacity': 0.45, 'line-width': 1.5, 'line-blur': 1 }} />
                  </Source>
                  <Source id="active-maritime-sweeps" type="geojson" data={activeSweepsGeoJSON}>
                    <Layer id="active-maritime-sweep-line" type="line" paint={{ 'line-color': '#ffffff', 'line-opacity': 0.95, 'line-width': 2, 'line-blur': 1 }} />
                  </Source>
                  <Source id="maritime-nodes" type="geojson" data={nodesGeoJSON}>
                    <Layer
                      id="maritime-node-points"
                      type="circle"
                      paint={{
                        'circle-radius': ['case', ['boolean', ['get', 'active'], false], 8, 6],
                        'circle-color': '#ffffff',
                        'circle-stroke-color': ['case', ['boolean', ['get', 'active'], false], '#ffffff', '#94a3b8'],
                        'circle-stroke-width': ['case', ['boolean', ['get', 'active'], false], 2, 1],
                        'circle-opacity': ['case', ['boolean', ['get', 'active'], false], 1, 0.65],
                      }}
                    />
                    <Layer id="maritime-node-labels" type="symbol" layout={{ 'text-field': ['get', 'shortLabel'], 'text-size': 10, 'text-offset': [0, 1.2], 'text-allow-overlap': true }} paint={{ 'text-color': '#ffffff', 'text-halo-color': '#020617', 'text-halo-width': 1 }} />
                  </Source>
                </>
              )}

              {showPorts && (
                <Source id="maritime-ports" type="geojson" data={portsGeoJSON}>
                  <Layer id="maritime-port-points" type="circle" paint={{ 'circle-radius': 5, 'circle-color': '#facc15', 'circle-stroke-color': '#713f12', 'circle-stroke-width': 1.5, 'circle-opacity': 0.92 }} />
                  <Layer id="maritime-port-labels" type="symbol" layout={{ 'text-field': ['slice', ['get', 'name'], 0, 16], 'text-size': 9, 'text-offset': [0, 1.15], 'text-allow-overlap': false }} paint={{ 'text-color': '#fde68a', 'text-halo-color': '#020617', 'text-halo-width': 1 }} />
                </Source>
              )}

              {showInstallations && (
                <Source id="maritime-installations" type="geojson" data={installationsGeoJSON}>
                  <Layer id="maritime-installation-points" type="circle" paint={{ 'circle-radius': 5.5, 'circle-color': '#facc15', 'circle-stroke-color': '#ef4444', 'circle-stroke-width': 1.8, 'circle-opacity': 0.94 }} />
                  <Layer id="maritime-installation-labels" type="symbol" layout={{ 'text-field': ['slice', ['get', 'name'], 0, 14], 'text-size': 9, 'text-offset': [0, 1.25], 'text-allow-overlap': false }} paint={{ 'text-color': '#fef3c7', 'text-halo-color': '#020617', 'text-halo-width': 1 }} />
                </Source>
              )}

              {activeVessel && activeVessel.history && activeVessel.history.length > 1 && (
                <Source id="vessel-history" type="geojson" data={historyGeoJSON}>
                  <Layer id="vessel-history-line" type="line" paint={{ 'line-color': '#10b981', 'line-width': 2, 'line-opacity': 0.6, 'line-dasharray': [2, 2] }} />
                </Source>
              )}

              <Source id="points-halo" type="geojson" data={EMPTY_FC}>
                <Layer
                  id="vessel-points-halo"
                  type="circle"
                  paint={{
                    'circle-radius': ['case', ['==', ['get', 'mmsi'], selectedMmsi || 0], 12, 0],
                    'circle-color': 'transparent',
                    'circle-stroke-width': ['case', ['==', ['get', 'mmsi'], selectedMmsi || 0], 2, 0],
                    'circle-stroke-color': '#3b82f6',
                  }}
                />
              </Source>

              {imagesReady && (
                <Source id="points" type="geojson" data={EMPTY_FC}>
                  <Layer
                    id="vessel-points"
                    type="symbol"
                    layout={{
                      'icon-image': [
                        'case',
                        ['==', ['get', 'mmsi'], selectedMmsi || 0],
                        'ship-white',
                        ['in', ['get', 'navigationalStatus'], ['literal', [1, 5]]],
                        'ship-orange',
                        'ship-green',
                      ],
                      'icon-size': 0.7,
                      'icon-rotate': ['coalesce', ['get', 'heading'], ['get', 'cog'], 0],
                      'icon-rotation-alignment': 'map',
                      'icon-allow-overlap': true,
                    }}
                  />
                </Source>
              )}
            </>
          )}

          {infrastructurePopup && (
            <Popup longitude={infrastructurePopup.item.lon} latitude={infrastructurePopup.item.lat} anchor="bottom" closeButton={false} onClose={() => setInfrastructurePopup(null)}>
              <div className="bg-[#05070b] border border-white/20 text-white font-mono min-w-[260px]">
                <div className="px-3 py-2 border-b border-white/10 flex items-center justify-between">
                  <span className="text-cyan-300 text-[10px] uppercase tracking-[0.18em]">{infrastructurePopup.type === 'node' ? 'Maritime Feed Node' : infrastructurePopup.type === 'installation' ? 'Installation' : 'Port'}</span>
                  <button onClick={() => setInfrastructurePopup(null)} className="text-white/40 hover:text-white">×</button>
                </div>
                <div className="p-3 space-y-1 text-[11px] text-white/65">
                  <div className="text-white text-sm font-bold">{popupTitle(infrastructurePopup)}</div>
                  <div>{popupSubtitle(infrastructurePopup)}</div>
                  {infrastructurePopup.type === 'node' && <div className="text-white/45">Click node pin to toggle this maritime feed zone.</div>}
                </div>
              </div>
            </Popup>
          )}
        </Map>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-8 bg-intel-panel border-t border-white/10 flex items-center px-4 justify-between text-xs text-intel-text z-50 overflow-hidden shrink-0 font-mono">
        <div className="flex space-x-6 items-center flex-1">
          <span className="flex items-center"><span className="opacity-50 mr-2 uppercase tracking-wide">DATA LINK:</span><span className="text-white font-semibold">AISSTREAM</span></span>
          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${isError ? 'bg-red-500/20 text-red-400' : 'bg-[#10b981]/20 text-[#10b981]'}`}>{isError ? 'CONNECTION_ERROR' : 'SECURE_ACTIVE'}</span>
          <span className="text-white/45 uppercase tracking-wide">ACTIVE NODES: {activeMaritimeNodeIds.length}</span>
        </div>
        <div className="flex space-x-6 shrink-0 opacity-70"><span className="uppercase tracking-wide tabular-nums">LAST UPDATE: {new Date(timestamp).toLocaleTimeString()}</span></div>
      </div>
    </div>
  );
};
