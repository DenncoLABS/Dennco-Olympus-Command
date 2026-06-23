import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Map, { Layer, NavigationControl, Popup, Source } from 'react-map-gl/maplibre';
import { useFlightsSnapshot } from './hooks/useFlightsSnapshot';
import { useFlightSelection } from './hooks/useFlightSelection';
import { useFlightsStore } from './state/flights.store';
import { statesToPointGeoJSON } from './lib/flights.geojson';
import { FlightsToolbar } from './components/FlightsToolbar';
import { FlightsStatusBar } from './components/FlightsStatusBar';
import { MapLayerControl } from './components/MapLayerControl';
import { VhfAudioPanel } from '../audio/VhfAudioPanel';
import { NoaaWeatherRadarLayer } from '../weather/NoaaWeatherRadarLayer';
import { useThemeStore } from '../../ui/theme/theme.store';
import { SATELLITE_STYLE, LIGHT_STYLE, DARK_STYLE, STREET_STYLE } from '../../lib/mapStyles';
import {
  activeRadarSweepsGeoJSON,
  activeRadarZonesGeoJSON,
  airportPinsGeoJSON,
  radarPinsGeoJSON,
  RADAR_REGIONS,
  type AirportPin,
  type RadarRegionPin,
} from './data/aviationInfrastructure';

const aircraftPath =
  'M9.123 30.464l-1.33-6.268-6.318-1.397 1.291-2.475 5.785-0.316c0.297-0.386 0.96-1.234 1.374-1.648l5.271-5.271-10.989-5.388 2.782-2.782 13.932 2.444 4.933-4.933c0.585-0.585 1.496-0.894 2.634-0.894 0.776 0 1.395 0.143 1.421 0.149l0.3 0.070 0.089 0.295c0.469 1.55 0.187 3.298-0.67 4.155l-4.956 4.956 2.434 13.875-2.782 2.782-5.367-10.945-4.923 4.924c-0.518 0.517-1.623 1.536-2.033 1.912l-0.431 5.425-2.449 1.329z';

function makePlaneSvg(fill: string) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 32 32"><path fill="${fill}" stroke="#020617" stroke-width="0.8" d="${aircraftPath}"/></svg>`,
  )}`;
}

const aircraftImages = {
  'olympus-plane-airborne': makePlaneSvg('#10b981'),
  'olympus-plane-ground': makePlaneSvg('#f59e0b'),
  'olympus-plane-selected': makePlaneSvg('#ffffff'),
};

const loadedImages: Record<string, HTMLImageElement> = {};
const imagePromises = Object.entries(aircraftImages).map(
  ([id, src]) =>
    new Promise<void>((resolve) => {
      const image = new Image(64, 64);
      image.onload = () => {
        loadedImages[id] = image;
        resolve();
      };
      image.src = src;
    }),
);

function addPlaneImages(map: import('maplibre-gl').Map) {
  for (const [id, image] of Object.entries(loadedImages)) {
    if (!map.hasImage(id)) map.addImage(id, image);
  }

  void Promise.all(imagePromises).then(() => {
    for (const [id, image] of Object.entries(loadedImages)) {
      if (!map.hasImage(id)) map.addImage(id, image);
    }
  });
}

function valueOrDash(value: unknown, suffix = '') {
  if (value === null || value === undefined || value === '') return '—';
  return `${value}${suffix}`;
}

type InfrastructurePopup =
  | { type: 'airport'; item: AirportPin }
  | { type: 'radar'; item: RadarRegionPin };

export const FlightsPage: React.FC = () => {
  const { mapProjection, mapLayer } = useThemeStore();
  const { data, isError } = useFlightsSnapshot();
  const states = useMemo(() => data?.states || [], [data?.states]);
  const timestamp = data?.timestamp || 0;
  const provider = data?.provider || 'adsblol';
  const {
    filters,
    showAirportPins,
    showRadarPins,
    activeRadarRegionIds,
    toggleRadarRegion,
  } = useFlightsStore();
  const { selectedIcao24, setSelectedIcao24, selectedFlight } = useFlightSelection(states);
  const [sweepDeg, setSweepDeg] = useState(0);
  const [infrastructurePopup, setInfrastructurePopup] = useState<InfrastructurePopup | null>(null);

  useEffect(() => {
    const timer = window.setInterval(() => setSweepDeg((current) => (current + 6) % 360), 100);
    return () => window.clearInterval(timer);
  }, []);

  const filteredStates = useMemo(() => {
    return states.filter((state) => {
      if (!filters.showOnGround && state.onGround) return false;
      if (state.baroAltitude != null && state.baroAltitude > filters.altitudeMax) return false;
      if (state.velocity != null && state.velocity > filters.speedMax) return false;
      if (filters.callsign && state.callsign && !state.callsign.includes(filters.callsign)) return false;
      return true;
    });
  }, [states, filters]);

  const airborneCount = useMemo(
    () => filteredStates.filter((state) => !state.onGround).length,
    [filteredStates],
  );
  const onGroundCount = useMemo(
    () => filteredStates.filter((state) => state.onGround).length,
    [filteredStates],
  );

  const pointsGeoJSON = useMemo(() => statesToPointGeoJSON(filteredStates), [filteredStates]);
  const airportGeoJSON = useMemo(() => airportPinsGeoJSON(), []);
  const radarGeoJSON = useMemo(() => radarPinsGeoJSON(), []);
  const activeRadarZones = useMemo(
    () => activeRadarZonesGeoJSON(activeRadarRegionIds),
    [activeRadarRegionIds],
  );
  const activeRadarSweeps = useMemo(
    () => activeRadarSweepsGeoJSON(activeRadarRegionIds, sweepDeg),
    [activeRadarRegionIds, sweepDeg],
  );

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

  const onClick = useCallback(
    (
      event: import('maplibre-gl').MapMouseEvent & {
        features?: import('maplibre-gl').MapGeoJSONFeature[];
      },
    ) => {
      const feature = event.features?.[0];
      const layerId = feature?.layer?.id;

      if (layerId === 'radar-region-points' && feature?.properties?.id) {
        const region = RADAR_REGIONS.find((item) => item.id === String(feature.properties?.id));
        if (region) {
          toggleRadarRegion(region.id);
          setInfrastructurePopup({ type: 'radar', item: region });
        }
        return;
      }

      if (layerId === 'airport-points' && feature?.properties?.id) {
        const item = airportGeoJSON.features.find((pin) => pin.properties.id === String(feature.properties?.id));
        if (item) setInfrastructurePopup({ type: 'airport', item: item.properties as AirportPin });
        return;
      }

      if (feature?.properties?.icao24) {
        setSelectedIcao24(String(feature.properties.icao24));
        setInfrastructurePopup(null);
        return;
      }
      setSelectedIcao24(null);
    },
    [airportGeoJSON.features, setSelectedIcao24, toggleRadarRegion],
  );

  return (
    <div className="absolute inset-0 bg-intel-bg overflow-hidden flex flex-col">
      <FlightsToolbar
        totalCount={states.length}
        filteredCount={filteredStates.length}
        airborneCount={airborneCount}
        onGroundCount={onGroundCount}
      />

      <div className="relative flex-1 min-h-0">
        <Map
          initialViewState={{ latitude: 39.8283, longitude: -98.5795, zoom: 4 }}
          mapStyle={activeMapStyle}
          styleDiffing={false}
          interactiveLayerIds={['aircraft-points', 'radar-region-points', 'airport-points']}
          onClick={onClick}
          onLoad={(event: { target: import('maplibre-gl').Map }) => addPlaneImages(event.target)}
          onStyleData={(event: { target: import('maplibre-gl').Map }) => addPlaneImages(event.target)}
          onStyleImageMissing={(event: { id: string; target: import('maplibre-gl').Map }) => {
            if (event.id.startsWith('olympus-plane')) addPlaneImages(event.target);
          }}
          projection={
            mapProjection === 'globe'
              ? ({ type: 'globe' } as import('maplibre-gl').ProjectionSpecification)
              : ({ type: 'mercator' } as import('maplibre-gl').ProjectionSpecification)
          }
          style={{ width: '100%', height: '100%' }}
        >
          <NavigationControl position="top-right" showCompass={true} visualizePitch={true} />
          <NoaaWeatherRadarLayer />

          {showRadarPins && (
            <>
              <Source id="active-radar-zones" type="geojson" data={activeRadarZones}>
                <Layer
                  id="active-radar-zone-fill"
                  type="fill"
                  paint={{ 'fill-color': '#ffffff', 'fill-opacity': 0.035 }}
                />
                <Layer
                  id="active-radar-zone-ring"
                  type="line"
                  paint={{ 'line-color': '#ffffff', 'line-opacity': 0.85, 'line-width': 2 }}
                />
              </Source>
              <Source id="active-radar-sweeps" type="geojson" data={activeRadarSweeps}>
                <Layer
                  id="active-radar-sweep-line"
                  type="line"
                  paint={{
                    'line-color': '#ffffff',
                    'line-opacity': 0.95,
                    'line-width': 2,
                    'line-blur': 1,
                  }}
                />
              </Source>
              <Source id="radar-regions" type="geojson" data={radarGeoJSON}>
                <Layer
                  id="radar-region-points"
                  type="circle"
                  paint={{
                    'circle-radius': ['case', ['in', ['get', 'id'], ['literal', activeRadarRegionIds]], 8, 6],
                    'circle-color': ['case', ['in', ['get', 'id'], ['literal', activeRadarRegionIds]], '#ffffff', '#0f172a'],
                    'circle-stroke-color': '#ffffff',
                    'circle-stroke-width': 1.5,
                    'circle-opacity': 0.9,
                  }}
                />
                <Layer
                  id="radar-region-labels"
                  type="symbol"
                  layout={{
                    'text-field': ['get', 'shortLabel'],
                    'text-size': 10,
                    'text-offset': [0, 1.2],
                    'text-allow-overlap': true,
                  }}
                  paint={{ 'text-color': '#ffffff', 'text-halo-color': '#020617', 'text-halo-width': 1 }}
                />
              </Source>
            </>
          )}

          {showAirportPins && (
            <Source id="airports" type="geojson" data={airportGeoJSON}>
              <Layer
                id="airport-points"
                type="circle"
                paint={{
                  'circle-radius': ['case', ['==', ['get', 'kind'], 'airbase'], 5.5, 4.5],
                  'circle-color': ['case', ['==', ['get', 'kind'], 'airbase'], '#f8fafc', '#38bdf8'],
                  'circle-stroke-color': ['case', ['==', ['get', 'kind'], 'airbase'], '#ef4444', '#0f172a'],
                  'circle-stroke-width': 1.5,
                  'circle-opacity': 0.9,
                }}
              />
              <Layer
                id="airport-labels"
                type="symbol"
                layout={{
                  'text-field': ['get', 'code'],
                  'text-size': 10,
                  'text-offset': [0, 1.1],
                  'text-allow-overlap': false,
                }}
                paint={{ 'text-color': '#e0f2fe', 'text-halo-color': '#020617', 'text-halo-width': 1 }}
              />
            </Source>
          )}

          <Source id="aircraft" type="geojson" data={pointsGeoJSON}>
            <Layer
              id="aircraft-halo"
              type="circle"
              paint={{
                'circle-radius': ['case', ['==', ['get', 'icao24'], selectedIcao24 || ''], 12, 0],
                'circle-color': 'transparent',
                'circle-stroke-width': ['case', ['==', ['get', 'icao24'], selectedIcao24 || ''], 2, 0],
                'circle-stroke-color': '#38bdf8',
              }}
            />
            <Layer
              id="aircraft-points"
              type="symbol"
              layout={{
                'icon-image': [
                  'case',
                  ['==', ['get', 'icao24'], selectedIcao24 || ''],
                  'olympus-plane-selected',
                  ['boolean', ['get', 'onGround'], false],
                  'olympus-plane-ground',
                  'olympus-plane-airborne',
                ],
                'icon-size': 0.42,
                'icon-rotate': ['-', ['coalesce', ['get', 'heading'], 0], 45],
                'icon-rotation-alignment': 'map',
                'icon-allow-overlap': true,
                'icon-ignore-placement': true,
              }}
              paint={{ 'icon-opacity': 0.98 }}
            />
          </Source>

          {infrastructurePopup && (
            <Popup
              longitude={infrastructurePopup.item.lon}
              latitude={infrastructurePopup.item.lat}
              anchor="bottom"
              closeButton={false}
              onClose={() => setInfrastructurePopup(null)}
            >
              <div className="bg-[#05070b] border border-white/20 text-white font-mono min-w-[260px]">
                <div className="px-3 py-2 border-b border-white/10 flex items-center justify-between">
                  <span className="text-cyan-300 text-[10px] uppercase tracking-[0.18em]">
                    {infrastructurePopup.type === 'radar' ? 'Radar Region' : infrastructurePopup.item.kind === 'airbase' ? 'Air Base' : 'Airport'}
                  </span>
                  <button onClick={() => setInfrastructurePopup(null)} className="text-white/40 hover:text-white">×</button>
                </div>
                <div className="p-3 space-y-1 text-[11px] text-white/65">
                  <div className="text-white text-sm font-bold">{infrastructurePopup.item.name || infrastructurePopup.item.label}</div>
                  <div>{infrastructurePopup.type === 'radar' ? infrastructurePopup.item.label : infrastructurePopup.item.code}</div>
                  {infrastructurePopup.type === 'radar' && (
                    <div className="text-white/45">Click radar pin to toggle this region feed. Radius: {infrastructurePopup.item.radiusNm} NM.</div>
                  )}
                </div>
              </div>
            </Popup>
          )}

          {selectedFlight?.lat != null && selectedFlight?.lon != null && (
            <Popup longitude={selectedFlight.lon} latitude={selectedFlight.lat} anchor="bottom" closeButton={false} onClose={() => setSelectedIcao24(null)}>
              <div className="bg-[#05070b] border border-cyan-400/30 text-white font-mono min-w-[320px] max-w-[380px]">
                <div className="px-3 py-2 border-b border-cyan-400/20 flex items-center justify-between">
                  <span className="text-cyan-300 text-[10px] uppercase tracking-[0.18em]">Aircraft Detail</span>
                  <button onClick={() => setSelectedIcao24(null)} className="text-white/40 hover:text-white">×</button>
                </div>
                <div className="p-3 space-y-3 text-[11px] text-white/60">
                  <div>
                    <div className="text-lg text-white font-bold leading-none">{selectedFlight.callsign || selectedFlight.registration || selectedFlight.icao24}</div>
                    <div className="text-cyan-300/70 mt-1 uppercase tracking-[0.16em]">{selectedFlight.icao24}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                    <Detail label="Registration" value={selectedFlight.registration} />
                    <Detail label="Country" value={selectedFlight.originCountry} />
                    <Detail label="Manufacturer" value={selectedFlight.manufacturerName} />
                    <Detail label="Model" value={selectedFlight.model} />
                    <Detail label="Operator" value={selectedFlight.operator} />
                    <Detail label="Type" value={selectedFlight.typecode} />
                    <Detail label="Built" value={selectedFlight.built} />
                    <Detail label="Squawk" value={selectedFlight.squawk} />
                    <Detail label="Baro Alt" value={valueOrDash(selectedFlight.baroAltitude, ' m')} />
                    <Detail label="Geo Alt" value={valueOrDash(selectedFlight.geoAltitude, ' m')} />
                    <Detail label="Speed" value={valueOrDash(selectedFlight.velocity, ' m/s')} />
                    <Detail label="Heading" value={valueOrDash(selectedFlight.heading, '°')} />
                    <Detail label="Vertical" value={valueOrDash(selectedFlight.verticalRate, ' m/s')} />
                    <Detail label="RSSI" value={selectedFlight.rssi} />
                    <Detail label="IAS" value={selectedFlight.ias} />
                    <Detail label="TAS" value={selectedFlight.tas} />
                    <Detail label="Mach" value={selectedFlight.mach} />
                    <Detail label="Emergency" value={selectedFlight.emergency || 'none'} />
                  </div>
                </div>
              </div>
            </Popup>
          )}
        </Map>

        <MapLayerControl />
        <VhfAudioPanel />
      </div>

      <FlightsStatusBar lastUpdated={timestamp} isError={isError} provider={provider} />
    </div>
  );
};

function Detail({ label, value }: { label: string; value: unknown }) {
  return (
    <div>
      <div className="text-white/35 uppercase tracking-[0.16em]">{label}</div>
      <div className="text-white/75">{valueOrDash(value)}</div>
    </div>
  );
}
