import { useFlightsStore } from './state/flights.store';

const BOOT_KEY = '__olympusFlightsPerformanceReady';
const MAX_ACTIVE_NODES = 4;

type ScopedWindow = Window & { [BOOT_KEY]?: boolean };

function trimActiveNodes() {
  const state = useFlightsStore.getState();
  if (state.activeRadarRegionIds.length <= MAX_ACTIVE_NODES) return;
  state.setActiveRadarRegionIds(state.activeRadarRegionIds.slice(0, MAX_ACTIVE_NODES));
}

if (typeof window !== 'undefined') {
  const scopedWindow = window as ScopedWindow;
  if (!scopedWindow[BOOT_KEY]) {
    scopedWindow[BOOT_KEY] = true;
    window.setInterval(trimActiveNodes, 1200);
  }
}
