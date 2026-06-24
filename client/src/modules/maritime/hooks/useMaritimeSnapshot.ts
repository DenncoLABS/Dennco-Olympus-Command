import { useQuery } from '@tanstack/react-query';
import { useMaritimeStore } from '../state/maritime.store';

export interface VesselState {
  mmsi: number;
  name: string;
  lat: number;
  lon: number;
  sog: number;
  cog: number;
  heading: number;
  navigationalStatus: number;
  lastUpdate: number;
  sourceKind?: 'vessel' | 'base-station' | 'aid-to-navigation' | 'sar-aircraft';
  type?: number;
  callsign?: string;
  dimension?: { a: number; b: number; c: number; d: number };
  destination?: string;
  altitude?: number;
  textMessage?: string;
  history?: [number, number][];
}

interface MaritimeSnapshotResponse {
  timestamp: number;
  vessels: VesselState[];
  maritimeNodes?: string[];
  scanActive?: boolean;
}

export function useMaritimeSnapshot() {
  const activeMaritimeNodeIds = useMaritimeStore((state) => state.activeMaritimeNodeIds);

  return useQuery<MaritimeSnapshotResponse>({
    queryKey: ['maritime', 'snapshot', activeMaritimeNodeIds.slice().sort().join(',')],
    queryFn: async () => {
      const API_URL = import.meta.env.VITE_API_URL || '/api';
      const params = new URLSearchParams();
      params.set('nodes', activeMaritimeNodeIds.join(','));
      const res = await fetch(`${API_URL}/maritime/snapshot?${params.toString()}`);
      if (!res.ok) {
        throw new Error('Network error fetching maritime snapshot');
      }
      return res.json();
    },
    refetchInterval: 5000,
    staleTime: 2000,
  });
}
