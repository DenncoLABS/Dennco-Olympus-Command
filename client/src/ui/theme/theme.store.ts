import { create } from 'zustand';

export type ThemeMode = 'eo' | 'flir' | 'crt';
export type MapProjection = 'mercator' | 'globe';
export type MapLayer = 'dark' | 'light' | 'street' | 'satellite';
export type ActiveModule = 'flights' | 'maritime' | 'monitor' | 'dot' | 'cyber' | 'admin';
export type WeatherRadarProduct = 'base-reflectivity' | 'custom';

interface WeatherRadarState {
  enabled: boolean;
  product: WeatherRadarProduct;
  opacity: number;
  contrast: number;
  brightnessMin: number;
  brightnessMax: number;
  customTileUrl: string;
}

interface ThemeState {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  mapProjection: MapProjection;
  setMapProjection: (proj: MapProjection) => void;
  mapLayer: MapLayer;
  setMapLayer: (layer: MapLayer) => void;
  activeModule: ActiveModule;
  setActiveModule: (module: ActiveModule) => void;
  weatherRadar: WeatherRadarState;
  setWeatherRadarEnabled: (enabled: boolean) => void;
  setWeatherRadarProduct: (product: WeatherRadarProduct) => void;
  setWeatherRadarOpacity: (opacity: number) => void;
  setWeatherRadarContrast: (contrast: number) => void;
  setWeatherRadarBrightness: (brightnessMin: number, brightnessMax: number) => void;
  setWeatherRadarCustomTileUrl: (customTileUrl: string) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  mode: 'eo',
  setMode: (mode) => set({ mode }),
  mapProjection: 'mercator',
  setMapProjection: (mapProjection) => set({ mapProjection }),
  mapLayer: 'dark',
  setMapLayer: (mapLayer) => set({ mapLayer }),
  activeModule: 'flights',
  setActiveModule: (activeModule) => set({ activeModule }),
  weatherRadar: {
    enabled: false,
    product: 'base-reflectivity',
    opacity: 0.72,
    contrast: 0.15,
    brightnessMin: 0,
    brightnessMax: 1,
    customTileUrl: '',
  },
  setWeatherRadarEnabled: (enabled) =>
    set((state) => ({ weatherRadar: { ...state.weatherRadar, enabled } })),
  setWeatherRadarProduct: (product) =>
    set((state) => ({ weatherRadar: { ...state.weatherRadar, product } })),
  setWeatherRadarOpacity: (opacity) =>
    set((state) => ({ weatherRadar: { ...state.weatherRadar, opacity } })),
  setWeatherRadarContrast: (contrast) =>
    set((state) => ({ weatherRadar: { ...state.weatherRadar, contrast } })),
  setWeatherRadarBrightness: (brightnessMin, brightnessMax) =>
    set((state) => ({ weatherRadar: { ...state.weatherRadar, brightnessMin, brightnessMax } })),
  setWeatherRadarCustomTileUrl: (customTileUrl) =>
    set((state) => ({ weatherRadar: { ...state.weatherRadar, customTileUrl } })),
}));
