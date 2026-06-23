import { create } from 'zustand';
import { RADAR_REGIONS } from '../data/aviationInfrastructure';

const ALL_RADAR_REGION_IDS = RADAR_REGIONS.map((region) => region.id);

export interface FlightsFilters {
  altitudeMin: number;
  altitudeMax: number;
  speedMin: number;
  speedMax: number;
  callsign: string;
  showOnGround: boolean;
}

interface FlightsState {
  filters: FlightsFilters;
  setFilter: <K extends keyof FlightsFilters>(key: K, value: FlightsFilters[K]) => void;
  selectedIcao24: string | null;
  setSelectedIcao24: (icao: string | null) => void;
  cameraTrackMode: boolean;
  setCameraTrackMode: (track: boolean) => void;
  onboardMode: boolean;
  setOnboardMode: (onboard: boolean) => void;
  showAirportPins: boolean;
  setShowAirportPins: (show: boolean) => void;
  showRadarPins: boolean;
  setShowRadarPins: (show: boolean) => void;
  activeRadarRegionIds: string[];
  toggleRadarRegion: (regionId: string) => void;
  setActiveRadarRegionIds: (regionIds: string[]) => void;
  activateAllRadarRegions: () => void;
  clearRadarRegions: () => void;
}

export const useFlightsStore = create<FlightsState>((set) => ({
  filters: {
    altitudeMin: 0,
    altitudeMax: 50000,
    speedMin: 0,
    speedMax: 1200,
    callsign: '',
    showOnGround: true,
  },
  setFilter: (key, value) => set((state) => ({ filters: { ...state.filters, [key]: value } })),
  selectedIcao24: null,
  setSelectedIcao24: (icao) => set({ selectedIcao24: icao }),
  cameraTrackMode: false,
  setCameraTrackMode: (track) => set({ cameraTrackMode: track, onboardMode: false }),
  onboardMode: false,
  setOnboardMode: (onboard) => set({ onboardMode: onboard, cameraTrackMode: false }),
  showAirportPins: true,
  setShowAirportPins: (show) => set({ showAirportPins: show }),
  showRadarPins: true,
  setShowRadarPins: (show) => set({ showRadarPins: show }),
  activeRadarRegionIds: [],
  toggleRadarRegion: (regionId) =>
    set((state) => ({
      activeRadarRegionIds: state.activeRadarRegionIds.includes(regionId)
        ? state.activeRadarRegionIds.filter((id) => id !== regionId)
        : [...state.activeRadarRegionIds, regionId],
    })),
  setActiveRadarRegionIds: (regionIds) =>
    set({ activeRadarRegionIds: regionIds.filter((id) => ALL_RADAR_REGION_IDS.includes(id)) }),
  activateAllRadarRegions: () => set({ activeRadarRegionIds: ALL_RADAR_REGION_IDS }),
  clearRadarRegions: () => set({ activeRadarRegionIds: [] }),
}));
