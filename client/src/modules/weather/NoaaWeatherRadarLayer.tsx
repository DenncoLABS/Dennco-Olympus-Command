import React, { useMemo } from 'react';
import { Source, Layer } from 'react-map-gl/maplibre';
import { useThemeStore } from '../../ui/theme/theme.store';

const DEFAULT_NOAA_RADAR_WMS =
  'https://opengeo.ncep.noaa.gov/geoserver/conus/conus_bref_qcd/ows?service=WMS&version=1.3.0&request=GetMap&format=image/png&transparent=true&layers=conus_bref_qcd&styles=&crs=EPSG:3857&width=256&height=256&bbox={bbox-epsg-3857}';

export const NoaaWeatherRadarLayer: React.FC = () => {
  const weatherRadar = useThemeStore((s) => s.weatherRadar);

  const tileUrl = useMemo(() => {
    if (weatherRadar.product === 'custom' && weatherRadar.customTileUrl.trim()) {
      return weatherRadar.customTileUrl.trim();
    }
    return import.meta.env.VITE_NOAA_RADAR_TILE_URL || DEFAULT_NOAA_RADAR_WMS;
  }, [weatherRadar.customTileUrl, weatherRadar.product]);

  if (!weatherRadar.enabled) return null;

  return (
    <Source
      id="noaa-weather-radar"
      type="raster"
      tiles={[tileUrl]}
      tileSize={256}
      attribution="NOAA / NWS"
    >
      <Layer
        id="noaa-weather-radar-layer"
        type="raster"
        paint={{
          'raster-opacity': weatherRadar.opacity,
          'raster-contrast': weatherRadar.contrast,
          'raster-brightness-min': weatherRadar.brightnessMin,
          'raster-brightness-max': weatherRadar.brightnessMax,
          'raster-fade-duration': 0,
        }}
      />
    </Source>
  );
};
