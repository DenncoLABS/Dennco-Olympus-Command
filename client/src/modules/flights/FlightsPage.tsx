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

const planeSvg = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><path fill="#ffffff" d="M32 3 20 29 4 36v6l18-3 5 22h10l5-22 18 3v-6l-16-7L32 3z"/></svg>',
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

  const onMapLoad = useCallback((event: { target: import('maplibre-gl').Map }) => {
    addPlaneImage(event.target);
  }, []);

  const onStyleData = useCallback((event: { target: import('maplibre-gl').Map }) => {
    addPlaneImage(event.target);
  }, []);

  const onStyleImageMissing = useCallback((event: { id: string; target: import('maplibre-gl').Map }) => {
    if (event.id === 'olympus-plane') addPlaneImage(event.target);
  }, []);

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
          onLoad={onMapLoad}
          onStyleData={onStyleData}
          onStyleImageMissing={onStyleImageMissing}
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
                'icon-size': 0.34,
                'icon-rotate': ['coalesce', ['get', 'heading'], 0],
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
              <div className="bg-[#05070b] border border-cyan-400/30 text-white font-mono min-w-[220px]">
                <div className="px-3 py-2 border-b border-cyan-400/20 flex items-center justify-between">
                  <span className="text-cyan-300 text-[10px] uppercase tracking-[0.18em]">Aircraft</span>
                  <button onClick={() => setSelectedIcao24(null)} className="text-white/40 hover:text-white">×</button>
                </div>
                <div className="p-3 space-y-1 text-[11px] text-white/60">
                  <div className="text-sm text-white font-bold">{selectedFlight.callsign || selectedFlight.icao24}</div>
                  <div>Country: {selectedFlight.originCountry || 'Unknown'}</div>
                  <div>Altitude: {selectedFlight.baroAltitude ?? '—'} m</div>
                  <div>Speed: {selectedFlight.velocity ?? '—'} m/s</div>
                  <div>Heading: {selectedFlight.heading ?? '—'}°</div>
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
