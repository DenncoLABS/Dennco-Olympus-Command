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

export const FlightsPage: React.FC = () => {
  const { mapProjection, mapLayer } = useThemeStore();
  const { data, isError } = useFlightsSnapshot();
  const states = useMemo(() => data?.states || [], [data?.states]);
  const timestamp = data?.timestamp || 0;
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
                  10,
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
              type="circle"
              paint={{
                'circle-radius': 5,
                'circle-color': [
                  'case',
                  ['==', ['get', 'icao24'], selectedIcao24 || ''],
                  '#ffffff',
                  ['boolean', ['get', 'onGround'], false],
                  '#f59e0b',
                  '#10b981',
                ],
                'circle-stroke-width': 1,
                'circle-stroke-color': '#020617',
                'circle-opacity': 0.95,
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
        provider={import.meta.env.VITE_FLIGHT_PROVIDER || 'opensky'}
      />
    </div>
  );
};
