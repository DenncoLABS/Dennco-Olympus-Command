import React, { useCallback, useMemo } from 'react';
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

const aircraftPath =
  'M9.123 30.464l-1.33-6.268-6.318-1.397 1.291-2.475 5.785-0.316c0.297-0.386 0.96-1.234 1.374-1.648l5.271-5.271-10.989-5.388 2.782-2.782 13.932 2.444 4.933-4.933c0.585-0.585 1.496-0.894 2.634-0.894 0.776 0 1.395 0.143 1.421 0.149l0.3 0.070 0.089 0.295c0.469 1.55 0.187 3.298-0.67 4.155l-4.956 4.956 2.434 13.875-2.782 2.782-5.367-10.945-4.923 4.924c-0.518 0.517-1.623 1.536-2.033 1.912l-0.431 5.425-2.449 1.329zM3.065 22.059l5.63 1.244 1.176 5.544 0.685-0.372 0.418-5.268 0.155-0.142c0.016-0.014 1.542-1.409 2.153-2.020l5.978-5.979 5.367 10.945 1.334-1.335-2.434-13.876 5.349-5.348c0.464-0.464 0.745-1.598 0.484-2.783-0.216-0.032-0.526-0.066-0.87-0.066-0.593 0-1.399 0.101-1.881 0.582l-5.325 5.325-13.933-2.444-1.335 1.334 10.989 5.388-6.326 6.326c-0.483 0.482-1.418 1.722-1.428 1.734l-0.149 0.198-5.672 0.31-0.366 0.702z';

const planeSvg = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 32 32"><path fill="#ffffff" d="${aircraftPath}"/></svg>`,
)}`;
let planeImage: HTMLImageElement | null = null;
const planeImagePromise = new Promise<HTMLImageElement>((resolve) => {
  const image = new Image(64, 64);
  image.onload = () => {
    planeImage = image;
    resolve(image);
  };
  image.src = planeSvg;
});

function addPlaneImage(map: import('maplibre-gl').Map) {
  if (planeImage && !map.hasImage('olympus-plane')) {
    map.addImage('olympus-plane', planeImage, { sdf: true });
    return;
  }
  if (!planeImage) {
    void planeImagePromise.then((image) => {
      if (!map.hasImage('olympus-plane')) map.addImage('olympus-plane', image, { sdf: true });
    });
  }
}

function valueOrDash(value: unknown, suffix = '') {
  if (value === null || value === undefined || value === '') return '—';
  return `${value}${suffix}`;
}

export const FlightsPage: React.FC = () => {
  const { mapProjection, mapLayer } = useThemeStore();
  const { data, isError } = useFlightsSnapshot();
  const states = useMemo(() => data?.states || [], [data?.states]);
  const timestamp = data?.timestamp || 0;
  const provider = data?.provider || 'adsblol';
  const { filters } = useFlightsStore();
  const { selectedIcao24, setSelectedIcao24, selectedFlight } = useFlightSelection(states);

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
      if (feature?.properties?.icao24) {
        setSelectedIcao24(String(feature.properties.icao24));
        return;
      }
      setSelectedIcao24(null);
    },
    [setSelectedIcao24],
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
          interactiveLayerIds={['aircraft-points']}
          onClick={onClick}
          onLoad={(event: { target: import('maplibre-gl').Map }) => addPlaneImage(event.target)}
          onStyleData={(event: { target: import('maplibre-gl').Map }) => addPlaneImage(event.target)}
          onStyleImageMissing={(event: { id: string; target: import('maplibre-gl').Map }) => {
            if (event.id === 'olympus-plane') addPlaneImage(event.target);
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

          <Source id="aircraft" type="geojson" data={pointsGeoJSON}>
            <Layer
              id="aircraft-halo"
              type="circle"
              paint={{
                'circle-radius': [
                  'case',
                  ['==', ['get', 'icao24'], selectedIcao24 || ''],
                  12,
                  0,
                ],
                'circle-color': 'transparent',
                'circle-stroke-width': [
                  'case',
                  ['==', ['get', 'icao24'], selectedIcao24 || ''],
                  2,
                  0,
                ],
                'circle-stroke-color': '#38bdf8',
              }}
            />
            <Layer
              id="aircraft-points"
              type="symbol"
              layout={{
                'icon-image': 'olympus-plane',
                'icon-size': 0.42,
                'icon-rotate': ['-', ['coalesce', ['get', 'heading'], 0], 45],
                'icon-rotation-alignment': 'map',
                'icon-allow-overlap': true,
                'icon-ignore-placement': true,
              }}
              paint={{
                'icon-color': [
                  'case',
                  ['==', ['get', 'icao24'], selectedIcao24 || ''],
                  '#ffffff',
                  ['boolean', ['get', 'onGround'], false],
                  '#f59e0b',
                  '#10b981',
                ],
                'icon-halo-color': '#020617',
                'icon-halo-width': 1.25,
                'icon-opacity': 0.95,
              }}
            />
          </Source>

          {selectedFlight?.lat != null && selectedFlight?.lon != null && (
            <Popup
              longitude={selectedFlight.lon}
              latitude={selectedFlight.lat}
              anchor="bottom"
              closeButton={false}
              onClose={() => setSelectedIcao24(null)}
            >
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
                  {selectedFlight.nav_modes?.length ? (
                    <div className="border-t border-white/10 pt-2">
                      <div className="text-white/35 uppercase tracking-[0.16em] mb-1">NAV Modes</div>
                      <div className="text-white/70">{selectedFlight.nav_modes.join(', ')}</div>
                    </div>
                  ) : null}
                </div>
              </div>
            </Popup>
          )}
        </Map>

        <MapLayerControl />
        <VhfAudioPanel />
      </div>

      <FlightsStatusBar
        lastUpdated={timestamp}
        isError={isError}
        provider={provider}
      />
    </div>
  );
};

function Detail({ label, value }: { label: string; value: unknown }) {
  return (
    <div>
      <div className="text-white/35 uppercase tracking-[0.14em]">{label}</div>
      <div className="text-white/75 truncate">{valueOrDash(value)}</div>
    </div>
  );
}
