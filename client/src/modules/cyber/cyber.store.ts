import { create } from 'zustand';

export interface CyberState {
  activeCategory: string;
  setActiveCategory: (category: string) => void;
  activeEndpoint: string;
  setActiveEndpoint: (endpoint: string) => void;
  timeRange: string;
  setTimeRange: (range: string) => void;
}

export const useCyberStore = create<CyberState>((set) => ({
  activeCategory: 'Attacks',
  setActiveCategory: (activeCategory) => set({ activeCategory }),
  activeEndpoint: '/radar/attacks/layer7/top/locations/origin',
  setActiveEndpoint: (activeEndpoint) => set({ activeEndpoint }),
  timeRange: '7d', // Default to 7 days
  setTimeRange: (timeRange) => set({ timeRange }),
}));
