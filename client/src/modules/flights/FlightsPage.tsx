import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Map, { Layer, NavigationControl, Popup, Source } from 'react-map-gl/maplibre';
import { useFlightsSnapshot } from './hooks/useFlightsSnapshot';
import { useFlightSelection } from './hooks/useFlightSelection';
import { useFlightsStore } from './state/flights.store';
import { statesToPointGeoJSON } from './lib/flights.geojson';
import { FlightsToolbar } from './components/FlightsToolbar';
import { FlightsStatusBar } from './components/FlightsStatusBar';
import { MapLayerControl } from './components/MapLayerControl';
import { VhfAudioPanel } from '../audio/VhfAudioPanel';
import { NoaaWeatherRadarLayer } from '../weather/NoaaWeatherRadarLayer';
import { useThemeStore } from '../../ui/theme/theme.store';
import { useGlobalNotificationsStore } from '../../notifications/globalNotifications.store';
import { SATELLITE_STYLE, LIGHT_STYLE, DARK_STYLE, STREET_STYLE } from '../../lib/mapStyles';
import { airportPinsGeoJSON, RADAR_REGIONS, type AirportPin, type RadarRegionPin } from './data/aviationInfrastructure';

const aircraftPath =
  'M9.123 30.464l-1.33-6.268-6.318-1.397 1.291-2.475 5.785-0.316c0.297-0.386 0.96-1.234 1.374-1.648l5.271-5.271-10.989-5.388 2.782-2.782 13.932 2.444 4.933-4.933c0.585-0.585 1.496-0.894 2.634-0.894 0.776 0 1.395 0.143 1.421 0.149l0.3 0.070 0.089 0.295c0.469 1.55 0.187 3.298-0.67 4.155l-4.956 4.956 2.434 13.875-2.782 2.782-5.367-10.945-4.923 4.924c-0.518 0.517-1.623 1.536-2.033 1.912l-0.431 5.425-2.449 1.329z';

function makePlaneSvg(fill: string) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 32 32"><path fill="${fill}" stroke="#020617" stroke-width="0.8" d="${aircraftPath}"/></svg>`,
  )}`;
}

const aircraftImages = {
  'olympus-plane-airborne': makePlaneSvg('#10b981'),
  'olympus-plane-ground': makePlaneSvg('#f59e0b'),
  'olympus-plane-emergency': makePlaneSvg('#ef4444'),
  'olympus-plane-selected': makePlaneSvg('#ffffff'),
};

const loadedImages: Record<string, HTMLImageElement> = {};
const imagePromises = Object.entries(aircraftImages).map(
  ([id, src]) =>
    new Promise<void>((resolve) => {
      const image = new Image(64, 64);
      image.onload = () => {
        loadedImages[id] = image;
        resolve();
      };
      image.src = src;
    }),
);

function addPlaneImages(map: import('maplibre-gl').Map) {
  for (const [id, image] of Object.entries(loadedImages)) if (!map.hasImage(id)) map.addImage(id, image);
  void Promise.all(imagePromises).then(() => {
    for (const [id, image] of Object.entries(loadedImages)) if (!map.hasImage(id)) map.addImage(id, image);
  });
}

function valueOrDash(value: unknown, suffix = '') {
  if (value === null || value === undefined || value === '') return '—';
  return `${value}${suffix}`;
}

function emergencyLabel(value: unknown) {
  const code = String(value || 'none').toLowerCase();
  if (code === 'nordo') return 'NORDO "NO RADIO"';
  if (code === '7500') return '7500 HIJACK / UNLAWFUL INTERFERENCE';
  if (code === '7600') return '7600 RADIO FAILURE';
  if (code === '7700') return '7700 GENERAL EMERGENCY';
  if (code === 'none' || code === '') return 'SIMULATED AIR EMERGENCY';
  return String(value).toUpperCase();
}

type MilitaryAirbasePin = { name: string; description: string; country: string; lat: number; lon: number };
type InfrastructurePopup = { type: 'airport'; item: AirportPin } | { type: 'radar'; item: RadarRegionPin } | { type: 'military'; item: MilitaryAirbasePin };
type FlightAlert = { id: string; timestamp: number; title: string; details: string; icao24: string; callsign?: string | null; emergency: string; reportedBy: string; activeDistress: boolean };

function infrastructureTitle(popup: InfrastructurePopup): string {
  if (popup.type === 'radar') return popup.item.label;
  return popup.item.name;
}

function infrastructureSubtitle(popup: InfrastructurePopup): string {
  if (popup.type === 'radar') return `${popup.item.scope} | ${popup.item.radiusNm} NM radar feed node`;
  if (popup.type === 'military') return `${popup.item.country || 'Military'} | Non-civilian installation`;
  return `${popup.item.code} | Airport`;
}

export const FlightsPage: React.FC = () => {
  const { mapProjection, mapLayer } = useThemeStore();
  const pushGlobalNotification = useGlobalNotificationsStore((state) => state.pushNotification);
  const { data, isError } = useFlightsSnapshot();
  const states = useMemo(() => data?.states || [], [data?.states]);
  const timestamp = data?.timestamp || 0;
  const provider = data?.provider || 'adsblol';
  const { filters, toggleRadarRegion } = useFlightsStore();
  const { selectedIcao24, setSelectedIcao24, selectedFlight } = useFlightSelection(states);
  const [infrastructurePopup, setInfrastructurePopup] = useState<InfrastructurePopup | null>(null);
  const [flightAlerts, setFlightAlerts] = useState<FlightAlert[]>([]);
  const [simulatedEmergencyIcaos, setSimulatedEmergencyIcaos] = useState<Set<string>>(new Set());
  const seenEmergencyAlerts = useRef<Set<string>>(new Set());

  const filteredStates = useMemo(() => states.filter((state) => {
    if (!filters.showOnGround && state.onGround) return false;
    if (state.baroAltitude != null && state.baroAltitude > filters.altitudeMax) return false;
    if (state.velocity != null && state.velocity > filters.speedMax) return false;
    if (filters.callsign && state.callsign && !state.callsign.includes(filters.callsign)) return false;
    return true;
  }), [states, filters]);

  const displayedStates = useMemo(() => filteredStates.map((state) => simulatedEmergencyIcaos.has(state.icao24) ? { ...state, emergency: state.emergency && state.emergency !== 'none' ? state.emergency : 'nordo' } : state), [filteredStates, simulatedEmergencyIcaos]);
  const selectedDisplayFlight = useMemo(() => selectedFlight && simulatedEmergencyIcaos.has(selectedFlight.icao24) ? { ...selectedFlight, emergency: selectedFlight.emergency && selectedFlight.emergency !== 'none' ? selectedFlight.emergency : 'nordo' } : selectedFlight, [selectedFlight, simulatedEmergencyIcaos]);

  const pushAlert = useCallback((alert: FlightAlert) => {
    setFlightAlerts((current) => [alert, ...current].slice(0, 14));
    pushGlobalNotification({ id: `global-${alert.id}`, domain: 'flight', severity: alert.activeDistress ? 'critical' : 'warning', title: alert.title, details: alert.details, entityId: alert.icao24, reportedBy: alert.reportedBy, timestamp: alert.timestamp });
  }, [pushGlobalNotification]);

  useEffect(() => {
    displayedStates.forEach((state) => {
      if (!state.emergency || state.emergency === 'none') return;
      const key = `feed-${state.icao24}-${state.emergency}`;
      if (seenEmergencyAlerts.current.has(key)) return;
      seenEmergencyAlerts.current.add(key);
      const emergency = emergencyLabel(state.emergency);
      pushAlert({ id: key, timestamp: Date.now(), title: 'Air Emergency Reported', details: `${emergency} detected for ${state.callsign || state.registration || state.icao24}.`, icao24: state.icao24, callsign: state.callsign, emergency, reportedBy: simulatedEmergencyIcaos.has(state.icao24) ? 'Olympus / Local Admin user' : 'Olympus / Live feed', activeDistress: true });
    });
  }, [displayedStates, pushAlert, simulatedEmergencyIcaos]);

  const airborneCount = useMemo(() => displayedStates.filter((state) => !state.onGround).length, [displayedStates]);
  const onGroundCount = useMemo(() => displayedStates.filter((state) => state.onGround).length, [displayedStates]);
  const emergencyCount = useMemo(() => displayedStates.filter((state) => state.emergency && state.emergency !== 'none').length, [displayedStates]);
  const pointsGeoJSON = useMemo(() => statesToPointGeoJSON(displayedStates), [displayedStates]);
  const airportGeoJSON = useMemo(() => airportPinsGeoJSON(), []);

  const activeMapStyle = useMemo(() => {
    switch (mapLayer) {
      case 'light': return LIGHT_STYLE;
      case 'street': return STREET_STYLE;
      case 'satellite': return SATELLITE_STYLE;
      case 'dark':
      default: return DARK_STYLE;
    }
  }, [mapLayer]);

  const reportSelectedAirEmergency = useCallback(() => {
    if (!selectedFlight?.icao24) return;
    setSimulatedEmergencyIcaos((current) => new Set(current).add(selectedFlight.icao24));
    const emergency = emergencyLabel(selectedFlight.emergency && selectedFlight.emergency !== 'none' ? selectedFlight.emergency : 'nordo');
    pushAlert({ id: `manual-${selectedFlight.icao24}-${Date.now()}`, timestamp: Date.now(), title: 'Air Emergency Reported', details: `${emergency} reported for ${selectedFlight.callsign || selectedFlight.registration || selectedFlight.icao24}.`, icao24: selectedFlight.icao24, callsign: selectedFlight.callsign, emergency, reportedBy: 'Olympus / Local Admin user', activeDistress: true });
  }, [pushAlert, selectedFlight]);

  const confirmSelectedEmergency = useCallback(() => {
    if (!selectedDisplayFlight?.icao24) return;
    const emergency = emergencyLabel(selectedDisplayFlight.emergency);
    pushAlert({ id: `confirm-${selectedDisplayFlight.icao24}-${Date.now()}`, timestamp: Date.now(), title: 'Air Emergency Confirmed', details: `${emergency} confirmed for ${selectedDisplayFlight.callsign || selectedDisplayFlight.registration || selectedDisplayFlight.icao24}.`, icao24: selectedDisplayFlight.icao24, callsign: selectedDisplayFlight.callsign, emergency, reportedBy: 'Olympus / Local Admin user', activeDistress: true });
  }, [pushAlert, selectedDisplayFlight]);

  const makeRadioContact = useCallback(() => {
    if (!selectedDisplayFlight?.icao24) return;
    const emergency = emergencyLabel(selectedDisplayFlight.emergency);
    pushAlert({ id: `radio-${selectedDisplayFlight.icao24}-${Date.now()}`, timestamp: Date.now(), title: 'Radio Contact Attempted', details: `Radio contact attempted with ${selectedDisplayFlight.callsign || selectedDisplayFlight.registration || selectedDisplayFlight.icao24} during ${emergency}.`, icao24: selectedDisplayFlight.icao24, callsign: selectedDisplayFlight.callsign, emergency, reportedBy: 'Olympus / Local Admin user', activeDistress: true });
  }, [pushAlert, selectedDisplayFlight]);

  const standDownSelectedEmergency = useCallback(() => {
    if (!selectedDisplayFlight?.icao24) return;
    const icao24 = selectedDisplayFlight.icao24;
    const emergency = emergencyLabel(selectedDisplayFlight.emergency);
    setSimulatedEmergencyIcaos((current) => { const next = new Set(current); next.delete(icao24); return next; });
    const standDown: FlightAlert = { id: `standdown-${icao24}-${Date.now()}`, timestamp: Date.now(), title: 'Air Emergency Stood Down', details: `${emergency} stood down for ${selectedDisplayFlight.callsign || selectedDisplayFlight.registration || icao24}.`, icao24, callsign: selectedDisplayFlight.callsign, emergency, reportedBy: 'Olympus / Local Admin user', activeDistress: false };
    setFlightAlerts((current) => [standDown, ...current.filter((alert) => alert.icao24 !== icao24)].slice(0, 14));
    pushGlobalNotification({ id: `global-${standDown.id}`, domain: 'flight', severity: 'warning', title: standDown.title, details: standDown.details, entityId: icao24, reportedBy: standDown.reportedBy, timestamp: standDown.timestamp });
  }, [pushGlobalNotification, selectedDisplayFlight]);

  const onClick = useCallback((event: import('maplibre-gl').MapMouseEvent & { features?: import('maplibre-gl').MapGeoJSONFeature[] }) => {
    const feature = event.features?.[0];
    const layerId = feature?.layer?.id;
    if (layerId === 'radar-region-points' && feature?.properties?.id) {
      const region = RADAR_REGIONS.find((item) => item.id === String(feature.properties?.id));
      if (region) { toggleRadarRegion(region.id); setInfrastructurePopup({ type: 'radar', item: region }); }
      return;
    }
    if (layerId === 'airport-points' && feature?.properties?.id) {
      const item = airportGeoJSON.features.find((pin) => pin.properties.id === String(feature.properties?.id));
      if (item) setInfrastructurePopup({ type: 'airport', item: item.properties as AirportPin });
      return;
    }
    if (layerId === 'flight-airbase-points') {
      const p = feature?.properties as Record<string, unknown> | undefined;
      const coords = feature?.geometry?.type === 'Point' ? (feature.geometry as GeoJSON.Point).coordinates : null;
      if (p && coords) setInfrastructurePopup({ type: 'military', item: { name: String(p.name ?? ''), description: String(p.description ?? ''), country: String(p.country ?? ''), lon: coords[0], lat: coords[1] } });
      return;
    }
    if (feature?.properties?.icao24) { setSelectedIcao24(String(feature.properties.icao24)); setInfrastructurePopup(null); return; }
    setSelectedIcao24(null);
  }, [airportGeoJSON.features, setSelectedIcao24, toggleRadarRegion]);

  return <div className="absolute inset-0 bg-intel-bg overflow-hidden flex flex-col"><FlightsToolbar totalCount={states.length} filteredCount={displayedStates.length} airborneCount={airborneCount} onGroundCount={onGroundCount} emergencyCount={emergencyCount} /><div className="relative flex-1 min-h-0"><Map initialViewState={{ latitude: 39.8283, longitude: -98.5795, zoom: 4 }} mapStyle={activeMapStyle} styleDiffing={false} interactiveLayerIds={['aircraft-points', 'radar-region-points', 'airport-points', 'flight-airbase-points']} onClick={onClick} cursor={selectedIcao24 ? 'pointer' : 'crosshair'} onLoad={(event: { target: import('maplibre-gl').Map }) => addPlaneImages(event.target)} onStyleData={(event: { target: import('maplibre-gl').Map }) => addPlaneImages(event.target)} onStyleImageMissing={(event: { id: string; target: import('maplibre-gl').Map }) => { if (event.id.startsWith('olympus-plane')) addPlaneImages(event.target); }} projection={mapProjection === 'globe' ? ({ type: 'globe' } as import('maplibre-gl').ProjectionSpecification) : ({ type: 'mercator' } as import('maplibre-gl').ProjectionSpecification)} style={{ width: '100%', height: '100%' }}><NavigationControl position="top-right" showCompass={true} visualizePitch={true} /><NoaaWeatherRadarLayer />{infrastructurePopup && <Popup longitude={infrastructurePopup.item.lon} latitude={infrastructurePopup.item.lat} anchor="bottom" closeButton={false} onClose={() => setInfrastructurePopup(null)}><div className="bg-[#05070b] border border-white/20 text-white font-mono min-w-[280px]"><div className="px-3 py-2 border-b border-white/10 flex items-center justify-between"><span className="text-cyan-300 text-[10px] uppercase tracking-[0.18em]">{infrastructurePopup.type === 'radar' ? 'Radar Region' : infrastructurePopup.type === 'military' ? 'Installation' : 'Airport'}</span><button onClick={() => setInfrastructurePopup(null)} className="text-white/40 hover:text-white">×</button></div><div className="p-3 space-y-1 text-[11px] text-white/65"><div className="text-white text-sm font-bold">{infrastructureTitle(infrastructurePopup)}</div><div>{infrastructureSubtitle(infrastructurePopup)}</div>{infrastructurePopup.type === 'radar' && <div className="text-white/45">Click toggles this radar region feed node.</div>}{infrastructurePopup.type === 'military' && infrastructurePopup.item.description && <div className="text-white/45">{infrastructurePopup.item.description}</div>}</div></div></Popup>}<Source id="aircraft" type="geojson" data={pointsGeoJSON}><Layer id="aircraft-halo" type="circle" paint={{ 'circle-radius': ['case', ['==', ['get', 'icao24'], selectedIcao24 || ''], 12, ['boolean', ['get', 'isEmergency'], false], 10, 0], 'circle-color': 'transparent', 'circle-stroke-width': ['case', ['==', ['get', 'icao24'], selectedIcao24 || ''], 2, ['boolean', ['get', 'isEmergency'], false], 2, 0], 'circle-stroke-color': ['case', ['boolean', ['get', 'isEmergency'], false], '#ef4444', '#38bdf8'] }} /><Layer id="aircraft-points" type="symbol" layout={{ 'icon-image': ['case', ['==', ['get', 'icao24'], selectedIcao24 || ''], 'olympus-plane-selected', ['boolean', ['get', 'isEmergency'], false], 'olympus-plane-emergency', ['boolean', ['get', 'onGround'], false], 'olympus-plane-ground', 'olympus-plane-airborne'], 'icon-size': 0.42, 'icon-rotate': ['-', ['coalesce', ['get', 'heading'], 0], 45], 'icon-rotation-alignment': 'map', 'icon-allow-overlap': true, 'icon-ignore-placement': true }} paint={{ 'icon-opacity': 0.98 }} /></Source>{selectedDisplayFlight?.lat != null && selectedDisplayFlight?.lon != null && <Popup longitude={selectedDisplayFlight.lon} latitude={selectedDisplayFlight.lat} anchor="bottom" closeButton={false} onClose={() => setSelectedIcao24(null)}><div className={`bg-[#05070b] border text-white font-mono min-w-[320px] max-w-[380px] ${selectedDisplayFlight.emergency && selectedDisplayFlight.emergency !== 'none' ? 'border-red-500 shadow-[0_0_18px_rgba(239,68,68,0.45)]' : 'border-cyan-400/30'}`}><div className="px-3 py-2 border-b border-cyan-400/20 flex items-center justify-between"><span className="text-cyan-300 text-[10px] uppercase tracking-[0.18em]">Aircraft Detail</span><button onClick={() => setSelectedIcao24(null)} className="text-white/40 hover:text-white">×</button></div><div className="p-3 space-y-3 text-[11px] text-white/60"><div><div className="text-lg text-white font-bold leading-none">{selectedDisplayFlight.callsign || selectedDisplayFlight.registration || selectedDisplayFlight.icao24}</div><div className="text-cyan-300/70 mt-1 uppercase tracking-[0.16em]">{selectedDisplayFlight.icao24}</div></div>{selectedDisplayFlight.emergency && selectedDisplayFlight.emergency !== 'none' && <div className="animate-pulse border border-red-500 bg-red-950/35 p-2 text-red-200 shadow-[0_0_18px_rgba(239,68,68,0.35)]">⚠ AIR EMERGENCY: {emergencyLabel(selectedDisplayFlight.emergency)}</div>}<div className="grid grid-cols-2 gap-x-4 gap-y-1"><Detail label="Registration" value={selectedDisplayFlight.registration} /><Detail label="Country" value={selectedDisplayFlight.originCountry} /><Detail label="Operator" value={selectedDisplayFlight.operator} /><Detail label="Squawk" value={selectedDisplayFlight.squawk} /><Detail label="Baro Alt" value={valueOrDash(selectedDisplayFlight.baroAltitude, ' m')} /><Detail label="Geo Alt" value={valueOrDash(selectedDisplayFlight.geoAltitude, ' m')} /><Detail label="Speed" value={valueOrDash(selectedDisplayFlight.velocity, ' m/s')} /><Detail label="Emergency" value={selectedDisplayFlight.emergency || 'none'} /></div><div className="grid grid-cols-1 gap-2"><button onClick={reportSelectedAirEmergency} className="w-full border border-red-500 bg-red-950/30 px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-red-200 hover:bg-red-500/20">⚠ Report Air Emergency</button><button onClick={confirmSelectedEmergency} className="w-full border border-amber-400 bg-amber-950/25 px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-amber-200 hover:bg-amber-400/20">Confirm Emergency</button><button onClick={makeRadioContact} className="w-full border border-cyan-400 bg-cyan-950/20 px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-cyan-200 hover:bg-cyan-400/20">Make Radio Contact</button><button onClick={standDownSelectedEmergency} className="w-full border border-white/25 bg-white/5 px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-white/70 hover:bg-white/10">Stand Down / Resolve</button></div></div></div></Popup>}</Map><FlightAlertLog alerts={flightAlerts} onClear={() => setFlightAlerts([])} onSelect={(alert) => { if (alert.activeDistress) setSelectedIcao24(alert.icao24); }} /><MapLayerControl /><VhfAudioPanel /></div><FlightsStatusBar lastUpdated={timestamp} isError={isError} provider={provider} /></div>;
};

function FlightAlertLog({ alerts, onClear, onSelect }: { alerts: FlightAlert[]; onClear: () => void; onSelect: (alert: FlightAlert) => void }) {
  const active = alerts.find((alert) => alert.activeDistress);
  return <div className="absolute top-[19rem] right-16 z-[70] w-[360px] font-mono pointer-events-auto">{active && <button onClick={() => onSelect(active)} className="mb-3 block w-full text-left animate-pulse border-2 border-red-500 bg-red-950/45 p-3 text-red-100 shadow-[0_0_24px_rgba(239,68,68,0.55)]"><div className="flex items-center justify-between gap-3"><div className="text-[10px] uppercase tracking-[0.22em] text-red-200">⚠ {active.title}</div><div className="text-[9px] text-red-200/65">{new Date(active.timestamp).toLocaleTimeString()}</div></div><div className="mt-2 text-sm font-bold uppercase tracking-[0.08em]">{active.emergency}</div><div className="mt-1 text-xs text-red-100/75">{active.details}</div></button>}<div className="border border-cyan-400/25 bg-black/60 backdrop-blur shadow-[0_0_20px_rgba(0,229,255,0.08)]"><div className="flex items-center justify-between border-b border-white/10 px-3 py-2"><div className="text-[10px] uppercase tracking-[0.22em] text-cyan-300">Flight Notifications</div><button onClick={onClear} className="text-[9px] uppercase tracking-[0.16em] text-white/35 hover:text-white">Clear</button></div><div className="max-h-56 overflow-auto">{alerts.length === 0 ? <div className="px-3 py-3 text-[11px] text-white/35">No flight notifications yet.</div> : alerts.map((alert) => <button key={alert.id} onClick={() => onSelect(alert)} disabled={!alert.activeDistress} className={`block w-full border-b border-white/8 px-3 py-2 text-left text-[11px] ${alert.activeDistress ? 'text-white/65 hover:bg-cyan-400/10' : 'text-white/35 cursor-default'}`}><div className="flex items-center justify-between gap-2"><span className={alert.activeDistress ? 'text-red-200 uppercase tracking-[0.14em]' : 'text-white/45 uppercase tracking-[0.14em]'}>{alert.title}</span><span className="text-white/35">{new Date(alert.timestamp).toLocaleString()}</span></div><div className="mt-1 text-white/80">{alert.details}</div><div className="mt-1 text-white/35">ICAO {alert.icao24} | Reported by {alert.reportedBy}</div></button>)}</div></div></div>;
}

function Detail({ label, value }: { label: string; value: unknown }) {
  return <div><div className="text-white/35 uppercase tracking-[0.16em]">{label}</div><div className="text-white/75">{valueOrDash(value)}</div></div>;
}
