import { create } from 'zustand';
import { MARITIME_NODES } from '../data/maritimeInfrastructure';

const ALL_MARITIME_NODE_IDS = MARITIME_NODES.map((node) => node.id);

export interface MaritimeFilters {
  speedMin: number;
  speedMax: number;
  name: string;
  showUnderway: boolean;
  showMoored: boolean;
}

interface MaritimeState {
  filters: MaritimeFilters;
  setFilter: <K extends keyof MaritimeFilters>(key: K, value: MaritimeFilters[K]) => void;
  selectedMmsi: number | null;
  setSelectedMmsi: (mmsi: number | null) => void;
  showPorts: boolean;
  setShowPorts: (show: boolean) => void;
  showInstallations: boolean;
  setShowInstallations: (show: boolean) => void;
  showMaritimeNodes: boolean;
  setShowMaritimeNodes: (show: boolean) => void;
  activeMaritimeNodeIds: string[];
  toggleMaritimeNode: (nodeId: string) => void;
  activateAllMaritimeNodes: () => void;
  clearMaritimeNodes: () => void;
}

export const useMaritimeStore = create<MaritimeState>((set) => ({
  filters: {
    speedMin: 0,
    speedMax: 100,
    name: '',
    showUnderway: true,
    showMoored: true,
  },
  setFilter: (key, value) => set((state) => ({ filters: { ...state.filters, [key]: value } })),
  selectedMmsi: null,
  setSelectedMmsi: (mmsi) => set({ selectedMmsi: mmsi }),
  showPorts: true,
  setShowPorts: (showPorts) => set({ showPorts }),
  showInstallations: true,
  setShowInstallations: (showInstallations) => set({ showInstallations }),
  showMaritimeNodes: true,
  setShowMaritimeNodes: (showMaritimeNodes) => set({ showMaritimeNodes }),
  activeMaritimeNodeIds: [],
  toggleMaritimeNode: (nodeId) =>
    set((state) => ({
      activeMaritimeNodeIds: state.activeMaritimeNodeIds.includes(nodeId)
        ? state.activeMaritimeNodeIds.filter((id) => id !== nodeId)
        : [...state.activeMaritimeNodeIds, nodeId],
    })),
  activateAllMaritimeNodes: () => set({ activeMaritimeNodeIds: ALL_MARITIME_NODE_IDS }),
  clearMaritimeNodes: () => set({ activeMaritimeNodeIds: [] }),
}));
