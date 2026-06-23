import { create } from 'zustand';

interface GPSJammingCell {
  h3: string;
  interference: number;
  good: number;
  bad: number;
}

interface GPSJammingData {
  date: string;
  suspect: boolean;
  totalCells: number;
  cells: GPSJammingCell[];
}

interface GPSJammingStore {
  enabled: boolean;
  selectedDate: string | null;
  availableDates: string[];
  data: GPSJammingData | null;
  loading: boolean;
  error: string | null;

  // Filter options
  showCleanSignals: boolean;
  showInterferedSignals: boolean;
  showMixedSignals: boolean;

  // Actions
  setEnabled: (enabled: boolean) => void;
  setSelectedDate: (date: string | null) => void;
  setAvailableDates: (dates: string[]) => void;
  setData: (data: GPSJammingData | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setShowCleanSignals: (show: boolean) => void;
  setShowInterferedSignals: (show: boolean) => void;
  setShowMixedSignals: (show: boolean) => void;
}

export const useGPSJammingStore = create<GPSJammingStore>((set) => ({
  enabled: false,
  selectedDate: null,
  availableDates: [],
  data: null,
  loading: false,
  error: null,

  // Default: show all signal types
  showCleanSignals: true,
  showInterferedSignals: true,
  showMixedSignals: true,

  setEnabled: (enabled) => set({ enabled }),
  setSelectedDate: (date) => set({ selectedDate: date }),
  setAvailableDates: (dates) => set({ availableDates: dates }),
  setData: (data) => set({ data }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setShowCleanSignals: (show) => set({ showCleanSignals: show }),
  setShowInterferedSignals: (show) => set({ showInterferedSignals: show }),
  setShowMixedSignals: (show) => set({ showMixedSignals: show }),
}));
