import { useQuery } from '@tanstack/react-query';
import { OpenSkyClient } from '../../../core/providers/opensky.client';
import { MockClient } from '../../../core/providers/mock.client';
import type { FlightProvider } from '../../../core/providers/provider.types';
import { useFlightsStore } from '../state/flights.store';

const provider: FlightProvider =
  import.meta.env.VITE_FLIGHT_PROVIDER === 'mock' ? new MockClient() : new OpenSkyClient();

export function useFlightsSnapshot() {
  const activeRadarRegionIds = useFlightsStore((state) => state.activeRadarRegionIds);

  return useQuery({
    queryKey: ['flights-snapshot', activeRadarRegionIds.slice().sort().join(',')],
    queryFn: () => provider.snapshot(activeRadarRegionIds),
    refetchInterval: 5000,
    staleTime: 2000,
  });
}
