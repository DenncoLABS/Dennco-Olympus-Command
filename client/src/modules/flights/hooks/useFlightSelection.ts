import { useFlightsStore } from '../state/flights.store';
import type { AircraftState } from '../lib/flights.types';

function normalizeIcao(value: string | null | undefined): string {
  return (value || '').trim().toLowerCase();
}

export function useFlightSelection(states: AircraftState[] = []) {
  const selectedIcao24 = useFlightsStore((s) => s.selectedIcao24);
  const setSelectedIcao24 = useFlightsStore((s) => s.setSelectedIcao24);
  const setCameraTrackMode = useFlightsStore((s) => s.setCameraTrackMode);
  const setOnboardMode = useFlightsStore((s) => s.setOnboardMode);

  const handleSetSelectedIcao24 = (icao: string | null) => {
    const normalized = icao ? icao.trim().toLowerCase() : null;
    setSelectedIcao24(normalized);
    if (!normalized) {
      setCameraTrackMode(false);
      setOnboardMode(false);
    }
  };

  const selectedKey = normalizeIcao(selectedIcao24);
  const selectedFlight = selectedKey ? states.find((s) => normalizeIcao(s.icao24) === selectedKey) || null : null;

  return { selectedIcao24, setSelectedIcao24: handleSetSelectedIcao24, selectedFlight };
}
