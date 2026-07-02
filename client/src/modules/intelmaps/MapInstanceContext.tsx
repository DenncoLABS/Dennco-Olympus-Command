import React, { createContext, useContext } from 'react';
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

const MapAppearanceContext = createContext<MapAppearance | null>(null);

export const MapInstanceProvider: React.FC<{ value: MapAppearance; children: React.ReactNode }> = ({ value, children }) => (
  <MapAppearanceContext.Provider value={value}>{children}</MapAppearanceContext.Provider>
);

export function useMapAppearance(): MapAppearance {
  return useContext(MapAppearanceContext) || useThemeStore();
}
