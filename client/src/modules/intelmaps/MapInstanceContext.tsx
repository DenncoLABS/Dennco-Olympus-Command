import React from 'react';
import { useThemeStore, type MapLayer, type MapProjection, type WeatherRadarProduct, type WeatherRadarState } from '../../ui/theme/theme.store';

export type MapAppearance = {
  mapLayer: MapLayer;
  setMapLayer: (layer: MapLayer) => void;
  mapProjection: MapProjection;
  setMapProjection: (projection: MapProjection) => void;
  weatherRadar: WeatherRadarState;
  setWeatherRadarEnabled: (enabled: boolean) => void;
  setWeatherRadarProduct: (product: WeatherRadarProduct) => void;
  setWeatherRadarOpacity: (opacity: number) => void;
  setWeatherRadarContrast: (contrast: number) => void;
  setWeatherRadarBrightness: (min: number, max: number) => void;
  setWeatherRadarCustomTileUrl: (url: string) => void;
};

export const MapInstanceProvider: React.FC<{ value: MapAppearance; children: React.ReactNode }> = ({ children }) => <>{children}</>;

export function useMapAppearance(): MapAppearance {
  return useThemeStore();
}
