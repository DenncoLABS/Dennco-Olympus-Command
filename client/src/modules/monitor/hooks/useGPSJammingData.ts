import { useEffect } from 'react';
import { useGPSJammingStore } from '../gpsJamming.store';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

/**
 * Hook to fetch and manage GPS jamming data
 */
export function useGPSJammingData() {
  const { enabled, selectedDate, setAvailableDates, setData, setLoading, setError } =
    useGPSJammingStore();

  // Fetch available dates on mount
  useEffect(() => {
    async function fetchDates() {
      try {
        const response = await fetch(`${API_BASE}/monitor/gps-jamming/dates`);
        if (!response.ok) throw new Error('Failed to fetch dates');
        const json = await response.json();
        setAvailableDates(json.dates || []);
      } catch (error) {
        console.error('[GPS Jamming] Error fetching dates:', error);
        setError('Failed to load available dates');
      }
    }

    fetchDates();
  }, [setAvailableDates, setError]);

  // Fetch data when enabled or date changes
  useEffect(() => {
    if (!enabled) {
      setData(null);
      return;
    }

    async function fetchData() {
      setLoading(true);
      setError(null);

      try {
        const url = selectedDate
          ? `${API_BASE}/monitor/gps-jamming?date=${selectedDate}`
          : `${API_BASE}/monitor/gps-jamming`;

        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const json = await response.json();
        setData(json);
      } catch (error) {
        console.error('[GPS Jamming] Error fetching data:', error);
        const message = error instanceof Error ? error.message : 'Failed to load GPS jamming data';
        setError(message);
        setData(null);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [enabled, selectedDate, setData, setLoading, setError]);

  return useGPSJammingStore();
}
