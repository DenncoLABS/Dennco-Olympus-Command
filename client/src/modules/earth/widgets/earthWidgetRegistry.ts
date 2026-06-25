import type { MonitorDeskWidgetId } from '../../monitor/widgets/monitorDeskWidgetManifest';

export type EarthWidgetStage = 'desk-only' | 'staged' | 'earth-overlay-planned';

export interface EarthWidgetRegistryEntry {
  id: MonitorDeskWidgetId;
  title: string;
  source: 'monitor-desk';
  stage: EarthWidgetStage;
  placeholderAction: string;
  plannedOverlayRole: string;
}

export const earthWidgetRegistry: EarthWidgetRegistryEntry[] = [
  {
    id: 'map-layers',
    title: 'Map Layers',
    source: 'monitor-desk',
    stage: 'earth-overlay-planned',
    placeholderAction: 'Pin to Earth will place this as a compact layer-control overlay above the operational map.',
    plannedOverlayRole: 'Layer control window for GPS interference, bases, and map mode controls.',
  },
  {
    id: 'rocket-alerts',
    title: 'Rocket Alerts',
    source: 'monitor-desk',
    stage: 'earth-overlay-planned',
    placeholderAction: 'Pin to Earth will place this as a threat-alert window on the Earth screen.',
    plannedOverlayRole: 'Regional rocket and launch-alert overlay with alert lifecycle actions.',
  },
  {
    id: 'gulf-watch',
    title: 'Gulf Watch',
    source: 'monitor-desk',
    stage: 'earth-overlay-planned',
    placeholderAction: 'Pin to Earth will place this as a regional watch window on the Earth screen.',
    plannedOverlayRole: 'GCC and UAE regional monitoring overlay tied to selected map sectors.',
  },
  {
    id: 'ai-synthesis',
    title: 'AI Synthesis',
    source: 'monitor-desk',
    stage: 'earth-overlay-planned',
    placeholderAction: 'Pin to Earth will place this as a compact intelligence synthesis overlay.',
    plannedOverlayRole: 'AI brief and critical-signal analysis panel for the selected Earth region.',
  },
  {
    id: 'live-intel-feed',
    title: 'Live Intel Feed',
    source: 'monitor-desk',
    stage: 'earth-overlay-planned',
    placeholderAction: 'Pin to Earth will place this as a live feed ticker or scroll window.',
    plannedOverlayRole: 'Live OSINT/news feed overlay following the current map sector.',
  },
  {
    id: 'global-notifications',
    title: 'Global Notifications',
    source: 'monitor-desk',
    stage: 'staged',
    placeholderAction: 'Pin to Earth will place this as a cross-domain notification center.',
    plannedOverlayRole: 'Global event notification overlay for all Olympus modules.',
  },
  {
    id: 'flight-notifications',
    title: 'Flight Notifications',
    source: 'monitor-desk',
    stage: 'staged',
    placeholderAction: 'Pin to Earth will place this as an aircraft alert window.',
    plannedOverlayRole: 'Flight emergency and aircraft-event notification overlay.',
  },
  {
    id: 'maritime-notifications',
    title: 'Maritime Notifications',
    source: 'monitor-desk',
    stage: 'staged',
    placeholderAction: 'Pin to Earth will place this as a maritime incident window.',
    plannedOverlayRole: 'AIS, vessel incident, Mayday, and maritime status notification overlay.',
  },
  {
    id: 'dot-traffic-notifications',
    title: 'Live DOT Traffic Notifications',
    source: 'monitor-desk',
    stage: 'staged',
    placeholderAction: 'Pin to Earth will place this as a road-flow and incident alert window.',
    plannedOverlayRole: 'Traffic event, closure, congestion, and road-flow overlay.',
  },
  {
    id: 'dot-cctv',
    title: 'DOT CCTV',
    source: 'monitor-desk',
    stage: 'staged',
    placeholderAction: 'Pin to Earth will place this as a selected traffic-camera preview.',
    plannedOverlayRole: 'CCTV/camera preview overlay for selected DOT map camera clusters.',
  },
];

export function getEarthWidgetRegistryEntry(id: MonitorDeskWidgetId) {
  return earthWidgetRegistry.find((entry) => entry.id === id);
}
