import { useFlightsStore } from '../state/flights.store';
import type { AircraftState } from '../lib/flights.types';

function normalizeIcao(value: string | null | undefined): string {
  return (value || '').trim().toLowerCase();
}

function resolveSelectedFlight(states: AircraftState[], selectedIcao24: string | null | undefined): AircraftState | null {
  const selectedKey = normalizeIcao(selectedIcao24);
  if (!selectedKey) return null;

  return states.find((state) => {
    const keys = [state.icao24, state.registration, state.callsign].map(normalizeIcao).filter(Boolean);
    return keys.includes(selectedKey);
  }) || null;
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

  const selectedFlight = resolveSelectedFlight(states, selectedIcao24);

  return { selectedIcao24, setSelectedIcao24: handleSetSelectedIcao24, selectedFlight };
}
