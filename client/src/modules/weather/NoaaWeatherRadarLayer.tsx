import React, { useMemo } from 'react';
import { Source, Layer } from 'react-map-gl/maplibre';
import { useThemeStore } from '../../ui/theme/theme.store';

const DEFAULT_NOAA_RADAR_WMS =
  'https://opengeo.ncep.noaa.gov/geoserver/conus/conus_bref_qcd/ows?service=WMS&version=1.3.0&request=GetMap&format=image/png&transparent=true&layers=conus_bref_qcd&styles=&crs=EPSG:3857&width=256&height=256&bbox={bbox-epsg-3857}';

function clampOpacity(value: number) {
  if (!Number.isFinite(value)) return 0.45;
  return Math.max(0, Math.min(value, 0.72));
}

export const NoaaWeatherRadarLayer: React.FC = () => {
  const weatherRadar = useThemeStore((s) => s.weatherRadar);

  const tileUrl = useMemo(() => {
    if (weatherRadar.product === 'custom' && weatherRadar.customTileUrl.trim()) {
      return weatherRadar.customTileUrl.trim();
    }
    return import.meta.env.VITE_NOAA_RADAR_TILE_URL || DEFAULT_NOAA_RADAR_WMS;
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

  if (!weatherRadar.enabled) return null;

  return (
    <Source
      id="noaa-weather-radar"
      type="raster"
      tiles={[tileUrl]}
      tileSize={256}
      attribution="NOAA / NWS atmospheric radar layer"
    >
      <Layer
        id="noaa-weather-radar-layer"
        type="raster"
        paint={{
          'raster-opacity': atmosphericOpacity,
          'raster-contrast': weatherRadar.contrast,
          'raster-brightness-min': weatherRadar.brightnessMin,
          'raster-brightness-max': weatherRadar.brightnessMax,
          'raster-saturation': -0.15,
          'raster-fade-duration': 150,
        }}
        metadata={{
          'dennco:layer-role': 'atmospheric-weather-overlay',
          'dennco:altitude-band': 'cloud/radar visualization layer; aircraft and ground infrastructure render above it',
        }}
      />
    </Source>
  );
};
