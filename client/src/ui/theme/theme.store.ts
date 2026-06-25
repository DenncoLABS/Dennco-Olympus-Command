import { create } from 'zustand';

export type ThemeMode = 'eo' | 'flir' | 'crt';
export type MapProjection = 'mercator' | 'globe';
export type MapLayer = 'dark' | 'light' | 'street' | 'satellite';
export type ActiveModule = 'core' | 'intelmaps' | 'flights' | 'maritime' | 'monitor' | 'dot' | 'cyber' | 'cad' | 'admin' | 'zbx' | 'svc' | 'labnode';
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

export interface OlympusShellSessionState {
  mode?: ThemeMode;
  mapProjection?: MapProjection;
  mapLayer?: MapLayer;
  activeModule?: ActiveModule;
  weatherRadar?: Partial<WeatherRadarState>;
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
  hydrateShellSession: (session: OlympusShellSessionState) => void;
  getShellSession: () => OlympusShellSessionState;
  setWeatherRadarEnabled: (enabled: boolean) => void;
  setWeatherRadarProduct: (product: WeatherRadarProduct) => void;
  setWeatherRadarOpacity: (opacity: number) => void;
  setWeatherRadarContrast: (contrast: number) => void;
  setWeatherRadarBrightness: (brightnessMin: number, brightnessMax: number) => void;
  setWeatherRadarCustomTileUrl: (customTileUrl: string) => void;
}

const validModules: ActiveModule[] = ['core', 'intelmaps', 'flights', 'maritime', 'monitor', 'dot', 'cyber', 'cad', 'admin', 'zbx', 'svc', 'labnode'];
const validModes: ThemeMode[] = ['eo', 'flir', 'crt'];
const validProjections: MapProjection[] = ['mercator', 'globe'];
const validLayers: MapLayer[] = ['dark', 'light', 'street', 'satellite'];
const validRadarProducts: WeatherRadarProduct[] = ['base-reflectivity', 'custom'];

export const useThemeStore = create<ThemeState>((set, get) => ({
  mode: 'eo',
  setMode: (mode) => set({ mode }),
  mapProjection: 'mercator',
  setMapProjection: (mapProjection) => set({ mapProjection }),
  mapLayer: 'dark',
  setMapLayer: (mapLayer) => set({ mapLayer }),
  activeModule: 'core',
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
  hydrateShellSession: (session) => {
    const patch: Partial<ThemeState> = {};
    if (session.activeModule && validModules.includes(session.activeModule)) patch.activeModule = session.activeModule;
    if (session.mode && validModes.includes(session.mode)) patch.mode = session.mode;
    if (session.mapProjection && validProjections.includes(session.mapProjection)) patch.mapProjection = session.mapProjection;
    if (session.mapLayer && validLayers.includes(session.mapLayer)) patch.mapLayer = session.mapLayer;

    if (session.weatherRadar) {
      const radar = session.weatherRadar;
      patch.weatherRadar = {
        ...get().weatherRadar,
        ...(typeof radar.enabled === 'boolean' ? { enabled: radar.enabled } : {}),
        ...(radar.product && validRadarProducts.includes(radar.product) ? { product: radar.product } : {}),
        ...(typeof radar.opacity === 'number' ? { opacity: radar.opacity } : {}),
        ...(typeof radar.contrast === 'number' ? { contrast: radar.contrast } : {}),
        ...(typeof radar.brightnessMin === 'number' ? { brightnessMin: radar.brightnessMin } : {}),
        ...(typeof radar.brightnessMax === 'number' ? { brightnessMax: radar.brightnessMax } : {}),
        ...(typeof radar.customTileUrl === 'string' ? { customTileUrl: radar.customTileUrl } : {}),
      };
    }

    set(patch);
  },
  getShellSession: () => {
    const state = get();
    return {
      activeModule: state.activeModule,
      mode: state.mode,
      mapProjection: state.mapProjection,
      mapLayer: state.mapLayer,
      weatherRadar: state.weatherRadar,
    };
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
