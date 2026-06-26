import React, { createContext, useContext } from 'react';
import { useThemeStore, type MapLayer, type MapProjection, type WeatherRadarProduct } from '../../ui/theme/theme.store';

type WeatherRadarState = ReturnType<typeof useThemeStore.getState>['weatherRadar'];

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

const MapInstanceContext = createContext<MapAppearance | null>(null);

export const MapInstanceProvider: React.FC<{ value: MapAppearance; children: React.ReactNode }> = ({ value, children }) => (
  <MapInstanceContext.Provider value={value}>{children}</MapInstanceContext.Provider>
);

export function useMapAppearance(): MapAppearance {
  const scoped = useContext(MapInstanceContext);
  const globalStore = useThemeStore();
  return scoped || globalStore;
}
