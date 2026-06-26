import React, { useEffect, useMemo, useState } from 'react';
import { Source, Layer } from 'react-map-gl/maplibre';
import { useFlightsStore } from '../flights/state/flights.store';
import { useMilitaryBases } from '../monitor/hooks/useMilitaryBases';
import { useMapAppearance } from '../intelmaps/MapInstanceContext';
import {
  activeRadarPulseGeoJSON,
  activeRadarSweepsGeoJSON,
  activeRadarZonesGeoJSON,
  airportPinsGeoJSON,
  radarPinsGeoJSON,
} from '../flights/data/aviationInfrastructure';

const DEFAULT_NOAA_WEATHER_WMS =
  'https://opengeo.ncep.noaa.gov/geoserver/conus/conus_bref_qcd/ows?service=WMS&version=1.3.0&request=GetMap&format=image/png&transparent=true&layers=conus_bref_qcd&styles=&crs=EPSG:3857&width=256&height=256&bbox={bbox-epsg-3857}';

function clampOpacity(value: number) {
  if (!Number.isFinite(value)) return 0.45;
  return Math.max(0, Math.min(value, 0.72));
}

export const NoaaWeatherRadarLayer: React.FC = () => {
  const { weatherRadar } = useMapAppearance();
  const { showAirportPins, showRadarPins, activeRadarRegionIds } = useFlightsStore();
  const { data: militaryBasesGeoJSON } = useMilitaryBases();
  const [sweepDeg, setSweepDeg] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => setSweepDeg((current) => (current + 6) % 360), 100);
    return () => window.clearInterval(timer);
  }, []);

  const tileUrl = useMemo(() => {
    if (weatherRadar.product === 'custom' && weatherRadar.customTileUrl.trim()) {
      return weatherRadar.customTileUrl.trim();
    }
    return import.meta.env.VITE_NOAA_RADAR_TILE_URL || DEFAULT_NOAA_WEATHER_WMS;
  }, [weatherRadar.customTileUrl, weatherRadar.product]);

  const opacity = clampOpacity(weatherRadar.opacity);
  const atmosphericOpacity = useMemo(
    () =>
      [
        'interpolate',
        ['linear'],
        ['zoom'],
        2,
        opacity * 0.55,
        4,
        opacity * 0.48,
        6,
        opacity * 0.34,
        8,
        opacity * 0.22,
        10,
        opacity * 0.14,
        12,
        opacity * 0.08,
      ] as unknown as number,
    [opacity],
  );

  const airportGeoJSON = useMemo(() => airportPinsGeoJSON(), []);
  const radarGeoJSON = useMemo(() => radarPinsGeoJSON(activeRadarRegionIds), [activeRadarRegionIds]);
  const activeRadarZones = useMemo(() => activeRadarZonesGeoJSON(activeRadarRegionIds), [activeRadarRegionIds]);
  const activeRadarPulse = useMemo(() => activeRadarPulseGeoJSON(activeRadarRegionIds, sweepDeg), [activeRadarRegionIds, sweepDeg]);
  const activeRadarSweeps = useMemo(() => activeRadarSweepsGeoJSON(activeRadarRegionIds, sweepDeg), [activeRadarRegionIds, sweepDeg]);
  const militaryAirbasesGeoJSON = useMemo(() => {
    if (!militaryBasesGeoJSON) return null;
    return {
      type: 'FeatureCollection' as const,
      features: militaryBasesGeoJSON.features
        .filter((feature) => feature.properties.category === 'air')
        .map((feature, index) => ({ ...feature, properties: { ...feature.properties, id: `monitor-airbase-${index}` } })),
    };
  }, [militaryBasesGeoJSON]);

  return (
    <>
      {weatherRadar.enabled && (
        <Source id="noaa-atmospheric-weather" type="raster" tiles={[tileUrl]} tileSize={256} attribution="NOAA / NWS atmospheric weather layer">
          <Layer id="noaa-atmospheric-weather-layer" type="raster" paint={{ 'raster-opacity': atmosphericOpacity, 'raster-contrast': weatherRadar.contrast, 'raster-brightness-min': weatherRadar.brightnessMin, 'raster-brightness-max': weatherRadar.brightnessMax, 'raster-saturation': -0.15, 'raster-fade-duration': 150 }} metadata={{ 'dennco:layer-role': 'atmospheric-weather-overlay', 'dennco:altitude-band': 'cloud/weather visualization layer; aircraft and ground infrastructure render above it' }} />
        </Source>
      )}
      {showRadarPins && (
        <>
          <Source id="active-radar-zones" type="geojson" data={activeRadarZones as GeoJSON.FeatureCollection}><Layer id="active-radar-zone-fill" type="fill" paint={{ 'fill-color': '#ffffff', 'fill-opacity': 0.035 }} /><Layer id="active-radar-zone-ring" type="line" paint={{ 'line-color': '#ffffff', 'line-opacity': 0.85, 'line-width': 2 }} /></Source>
          <Source id="active-radar-pulse" type="geojson" data={activeRadarPulse as GeoJSON.FeatureCollection}><Layer id="active-radar-pulse-ring" type="line" paint={{ 'line-color': '#ffffff', 'line-opacity': 0.45, 'line-width': 1.5, 'line-blur': 1 }} /></Source>
          <Source id="active-radar-sweeps" type="geojson" data={activeRadarSweeps as GeoJSON.FeatureCollection}><Layer id="active-radar-sweep-line" type="line" paint={{ 'line-color': '#ffffff', 'line-opacity': 0.95, 'line-width': 2, 'line-blur': 1 }} /></Source>
          <Source id="radar-regions" type="geojson" data={radarGeoJSON as GeoJSON.FeatureCollection}><Layer id="radar-region-points" type="circle" paint={{ 'circle-radius': ['case', ['boolean', ['get', 'active'], false], 8, 6], 'circle-color': '#ffffff', 'circle-stroke-color': ['case', ['boolean', ['get', 'active'], false], '#ffffff', '#94a3b8'], 'circle-stroke-width': ['case', ['boolean', ['get', 'active'], false], 2, 1], 'circle-opacity': ['case', ['boolean', ['get', 'active'], false], 1, 0.65] }} /><Layer id="radar-region-labels" type="symbol" layout={{ 'text-field': ['get', 'shortLabel'], 'text-size': 10, 'text-offset': [0, 1.2], 'text-allow-overlap': true }} paint={{ 'text-color': '#ffffff', 'text-halo-color': '#020617', 'text-halo-width': 1 }} /></Source>
        </>
      )}
      {showAirportPins && (
        <>
          <Source id="airports" type="geojson" data={airportGeoJSON as GeoJSON.FeatureCollection}><Layer id="airport-points" type="circle" paint={{ 'circle-radius': 4.8, 'circle-color': '#facc15', 'circle-stroke-color': '#713f12', 'circle-stroke-width': 1.5, 'circle-opacity': 0.92 }} /><Layer id="airport-labels" type="symbol" layout={{ 'text-field': ['get', 'code'], 'text-size': 10, 'text-offset': [0, 1.1], 'text-allow-overlap': false }} paint={{ 'text-color': '#fde68a', 'text-halo-color': '#020617', 'text-halo-width': 1 }} /></Source>
          {militaryAirbasesGeoJSON && <Source id="flight-airbases" type="geojson" data={militaryAirbasesGeoJSON as GeoJSON.FeatureCollection}><Layer id="flight-airbase-points" type="circle" paint={{ 'circle-radius': 5.6, 'circle-color': '#facc15', 'circle-stroke-color': '#ef4444', 'circle-stroke-width': 1.8, 'circle-opacity': 0.94 }} /><Layer id="flight-airbase-labels" type="symbol" layout={{ 'text-field': ['get', 'name'], 'text-size': 9, 'text-offset': [0, 1.25], 'text-allow-overlap': false }} paint={{ 'text-color': '#fef3c7', 'text-halo-color': '#020617', 'text-halo-width': 1 }} /></Source>}
        </>
      )}
    </>
  );
};
