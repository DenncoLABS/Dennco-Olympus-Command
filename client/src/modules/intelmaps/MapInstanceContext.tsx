import React, { createContext, useContext } from 'react';
import { MapAppearanceOverrideProvider, useThemeStore, type MapAppearanceOverride } from '../../ui/theme/theme.store';

export type MapAppearance = MapAppearanceOverride;

const MapInstanceContext = createContext<MapAppearance | null>(null);

export const MapInstanceProvider: React.FC<{ value: MapAppearance; children: React.ReactNode }> = ({ value, children }) => (
  <MapInstanceContext.Provider value={value}>
    <MapAppearanceOverrideProvider value={value}>{children}</MapAppearanceOverrideProvider>
  </MapInstanceContext.Provider>
);

export function useMapAppearance(): MapAppearance {
  const scoped = useContext(MapInstanceContext);
  const globalStore = useThemeStore();
  return scoped || globalStore;
}
