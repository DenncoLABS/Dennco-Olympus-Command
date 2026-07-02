import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Map, { Layer, NavigationControl, Popup, Source } from 'react-map-gl/maplibre';
import { useFlightsSnapshot } from './hooks/useFlightsSnapshot';
import { useFlightSelection } from './hooks/useFlightSelection';
import { useFlightsStore } from './state/flights.store';
import { statesToPointGeoJSON } from './lib/flights.geojson';
import type { AircraftState } from './lib/flights.types';
import { FlightsToolbar } from './components/FlightsToolbar';
import { FlightsStatusBar } from './components/FlightsStatusBar';
import { MapLayerControl } from './components/MapLayerControl';
import { VhfAudioPanel } from '../audio/VhfAudioPanel';
import { NoaaWeatherRadarLayer } from '../weather/NoaaWeatherRadarLayer';
import { DraggableDockPanel } from '../../ui/layout/DraggableDockPanel';
import { SATELLITE_STYLE, LIGHT_STYLE, DARK_STYLE, STREET_STYLE } from '../../lib/mapStyles';
import { useMapAppearance } from '../intelmaps/MapInstanceContext';
import { airportPinsGeoJSON, radarPinsGeoJSON, activeRadarZonesGeoJSON, RADAR_REGIONS, type AirportPin, type RadarRegionPin } from './data/aviationInfrastructure';

const aircraftPath = 'M9.123 30.464l-1.33-6.268-6.318-1.397 1.291-2.475 5.785-0.316c0.297-0.386 0.96-1.234 1.374-1.648l5.271-5.271-10.989-5.388 2.782-2.782 13.932 2.444 4.933-4.933c0.585-0.585 1.496-0.894 2.634-0.894 0.776 0 1.395 0.143 1.421 0.149l0.3 0.070 0.089 0.295c0.469 1.55 0.187 3.298-0.67 4.155l-4.956 4.956 2.434 13.875-2.782 2.782-5.367-10.945-4.923 4.924c-0.518 0.517-1.623 1.536-2.033 1.912l-0.431 5.425-2.449 1.329z';

function makePlaneSvg(fill: string) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 32 32"><path fill="${fill}" stroke="#020617" stroke-width="0.8" d="${aircraftPath}"/></svg>`)}`;
}

const aircraftImages = {
  'olympus-plane-airborne': makePlaneSvg('#10b981'),
  'olympus-plane-ground': makePlaneSvg('#f59e0b'),
  'olympus-plane-emergency': makePlaneSvg('#ef4444'),
  'olympus-plane-selected': makePlaneSvg('#ffffff'),
};

const loadedImages: Record<string, HTMLImageElement> = {};
const imagePromises = Object.entries(aircraftImages).map(([id, src]) => new Promise<void>((resolve) => {
  const image = new Image(64, 64);
  image.onload = () => { loadedImages[id] = image; resolve(); };
  image.src = src;
}));

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

function alertLabel(value: unknown) {
  const code = String(value || 'none').toLowerCase();
  if (code === 'nordo') return 'NO RADIO';
  if (code === '7600') return 'RADIO ISSUE';
  if (code === '7700') return 'GENERAL ALERT';
  if (code === 'none' || code === '') return 'NONE';
  return String(value).toUpperCase();
}

function normalizeKey(value: unknown) {
  return String(value || '').trim().toLowerCase();
}

type MilitaryAirbasePin = { name: string; description: string; country: string; lat: number; lon: number };
type InfrastructurePopup = { type: 'airport'; item: AirportPin } | { type: 'radar'; item: RadarRegionPin } | { type: 'military'; item: MilitaryAirbasePin };
type FlightAlert = { id: string; timestamp: number; title: string; details: string; icao24: string; callsign?: string | null; emergency: string; reportedBy: string; activeDistress: boolean };
type MapFeature = import('maplibre-gl').MapGeoJSONFeature;

function infrastructureTitle(popup: InfrastructurePopup): string {
  if (popup.type === 'radar') return popup.item.label;
  return popup.item.name;
}

function infrastructureSubtitle(popup: InfrastructurePopup): string {
  if (popup.type === 'radar') return `${popup.item.scope} | ${popup.item.radiusNm} NM radar feed node`;
  if (popup.type === 'military') return `${popup.item.country || 'Military'} | Installation`;
  return `${popup.item.code} | Airport`;
}

function featureInLayer(features: MapFeature[], layerId: string) {
  return features.find((feature) => feature.layer?.id === layerId) || null;
}

function aircraftFeatureFrom(features: MapFeature[]) {
  return featureInLayer(features, 'aircraft-points') || featureInLayer(features, 'aircraft-click-target') || features.find((feature) => feature.properties?.icao24) || null;
}

function findAircraftByFeature(states: AircraftState[], feature: MapFeature) {
  const props = feature.properties || {};
  const keys = [props.icao24, props.registration, props.callsign].map(normalizeKey).filter(Boolean);
  if (keys.length === 0) return null;
  return states.find((state) => [state.icao24, state.registration, state.callsign].map(normalizeKey).some((key) => keys.includes(key))) || null;
}

export const FlightsPage: React.FC = () => {
  const { mapProjection, mapLayer } = useMapAppearance();
  const { data, isError } = useFlightsSnapshot();
  const states = useMemo(() => data?.states || [], [data?.states]);
  const timestamp = data?.timestamp || 0;
  const provider = data?.provider || 'adsblol';
  const { filters, toggleRadarRegion, activeRadarRegionIds } = useFlightsStore();
  const { selectedIcao24, setSelectedIcao24, selectedFlight } = useFlightSelection(states);
  const [selectedFlightSnapshot, setSelectedFlightSnapshot] = useState<AircraftState | null>(null);
  const [infrastructurePopup, setInfrastructurePopup] = useState<InfrastructurePopup | null>(null);
  const [flightAlerts, setFlightAlerts] = useState<FlightAlert[]>([]);
  const [simulatedAlertIcaos, setSimulatedAlertIcaos] = useState<Set<string>>(new Set());
  const mapRef = useRef<import('maplibre-gl').Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);

  const filteredStates = useMemo(() => states.filter((state) => {
    if (!filters.showOnGround && state.onGround) return false;
    if (state.baroAltitude != null && state.baroAltitude > filters.altitudeMax) return false;
    if (state.velocity != null && state.velocity > filters.speedMax) return false;
    if (filters.callsign && state.callsign && !state.callsign.includes(filters.callsign)) return false;
    return true;
  }), [states, filters]);

  const displayedStates = useMemo(() => filteredStates.map((state) => simulatedAlertIcaos.has(state.icao24) ? { ...state, emergency: state.emergency && state.emergency !== 'none' ? state.emergency : 'nordo' } : state), [filteredStates, simulatedAlertIcaos]);
  const selectedDisplayFlight = useMemo(() => {
    const live = selectedFlight && simulatedAlertIcaos.has(selectedFlight.icao24) ? { ...selectedFlight, emergency: selectedFlight.emergency && selectedFlight.emergency !== 'none' ? selectedFlight.emergency : 'nordo' } : selectedFlight;
    if (live) return live;
    return selectedFlightSnapshot;
  }, [selectedFlight, selectedFlightSnapshot, simulatedAlertIcaos]);

  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container || typeof ResizeObserver === 'undefined') return undefined;
    const resizeObserver = new ResizeObserver(() => mapRef.current?.resize());
    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, []);

  const airborneCount = useMemo(() => displayedStates.filter((state) => !state.onGround).length, [displayedStates]);
  const onGroundCount = useMemo(() => displayedStates.filter((state) => state.onGround).length, [displayedStates]);
  const emergencyCount = useMemo(() => displayedStates.filter((state) => state.emergency && state.emergency !== 'none').length, [displayedStates]);
  const pointsGeoJSON = useMemo(() => statesToPointGeoJSON(displayedStates), [displayedStates]);
  const airportGeoJSON = useMemo(() => airportPinsGeoJSON(), []);
  const radarGeoJSON = useMemo(() => radarPinsGeoJSON(activeRadarRegionIds), [activeRadarRegionIds]);
  const activeRadarZones = useMemo(() => activeRadarZonesGeoJSON(activeRadarRegionIds), [activeRadarRegionIds]);

  const activeMapStyle = useMemo(() => {
    if (mapLayer === 'light') return LIGHT_STYLE;
    if (mapLayer === 'street') return STREET_STYLE;
    if (mapLayer === 'satellite') return SATELLITE_STYLE;
    return DARK_STYLE;
  }, [mapLayer]);

  const reportSelectedAirEmergency = useCallback(() => {
    if (!selectedDisplayFlight?.icao24) return;
    setSimulatedAlertIcaos((current) => new Set(current).add(selectedDisplayFlight.icao24));
    setFlightAlerts((current) => [{ id: `manual-${Date.now()}`, timestamp: Date.now(), title: 'Flight Alert Reported', details: `Alert reported for ${selectedDisplayFlight.callsign || selectedDisplayFlight.registration || selectedDisplayFlight.icao24}.`, icao24: selectedDisplayFlight.icao24, callsign: selectedDisplayFlight.callsign, emergency: alertLabel(selectedDisplayFlight.emergency), reportedBy: 'Olympus / Local Admin user', activeDistress: true }, ...current].slice(0, 14));
  }, [selectedDisplayFlight]);
  const confirmSelectedEmergency = useCallback(() => reportSelectedAirEmergency(), [reportSelectedAirEmergency]);
  const makeRadioContact = useCallback(() => reportSelectedAirEmergency(), [reportSelectedAirEmergency]);
  const standDownSelectedEmergency = useCallback(() => {
    if (!selectedDisplayFlight?.icao24) return;
    setSimulatedAlertIcaos((current) => { const next = new Set(current); next.delete(selectedDisplayFlight.icao24); return next; });
    setFlightAlerts((current) => current.filter((alert) => alert.icao24 !== selectedDisplayFlight.icao24));
  }, [selectedDisplayFlight]);

  const onClick = useCallback((event: import('maplibre-gl').MapMouseEvent & { features?: MapFeature[] }) => {
    const features = event.features || [];
    const first = features[0];
    const firstLayer = first?.layer?.id;

    if (firstLayer === 'radar-region-points' && first?.properties?.id) {
      const region = RADAR_REGIONS.find((item) => item.id === String(first.properties?.id));
      if (region) {
        toggleRadarRegion(region.id);
        setInfrastructurePopup({ type: 'radar', item: region });
      }
      return;
    }

    if (firstLayer === 'airport-points' && first?.properties?.id) {
      const item = airportGeoJSON.features.find((pin) => pin.properties.id === String(first.properties?.id));
      if (item) setInfrastructurePopup({ type: 'airport', item: item.properties as AirportPin });
      return;
    }

    if (firstLayer === 'flight-airbase-points') {
      const props = first?.properties as Record<string, unknown> | undefined;
      const coords = first?.geometry?.type === 'Point' ? (first.geometry as GeoJSON.Point).coordinates : null;
      if (props && coords) setInfrastructurePopup({ type: 'military', item: { name: String(props.name ?? ''), description: String(props.description ?? ''), country: String(props.country ?? ''), lon: coords[0], lat: coords[1] } });
      return;
    }

    const aircraftFeature = aircraftFeatureFrom(features);
    if (aircraftFeature?.properties?.icao24) {
      const clickedFlight = findAircraftByFeature(displayedStates, aircraftFeature) || findAircraftByFeature(states, aircraftFeature);
      if (clickedFlight) setSelectedFlightSnapshot(clickedFlight);
      setSelectedIcao24(String(aircraftFeature.properties.icao24));
      setInfrastructurePopup(null);
      return;
    }

    setInfrastructurePopup(null);
  }, [airportGeoJSON.features, displayedStates, setSelectedIcao24, states, toggleRadarRegion]);

  const closeFlightPanel = useCallback(() => {
    setSelectedIcao24(null);
    setSelectedFlightSnapshot(null);
  }, [setSelectedIcao24]);

  return (
    <div className="absolute inset-0 bg-intel-bg overflow-hidden flex flex-col">
      <FlightsToolbar totalCount={states.length} filteredCount={displayedStates.length} airborneCount={airborneCount} onGroundCount={onGroundCount} emergencyCount={emergencyCount} />
      <div ref={mapContainerRef} className="relative flex-1 min-h-0 cursor-crosshair">
        <Map initialViewState={{ latitude: 39.8283, longitude: -98.5795, zoom: 4 }} mapStyle={activeMapStyle} styleDiffing={false} interactiveLayerIds={['radar-region-points', 'airport-points', 'flight-airbase-points', 'aircraft-points', 'aircraft-click-target']} onClick={onClick} cursor="crosshair" onLoad={(event: { target: import('maplibre-gl').Map }) => { mapRef.current = event.target; addPlaneImages(event.target); event.target.resize(); }} onStyleData={(event: { target: import('maplibre-gl').Map }) => { mapRef.current = event.target; addPlaneImages(event.target); event.target.resize(); }} onStyleImageMissing={(event: { id: string; target: import('maplibre-gl').Map }) => { if (event.id.startsWith('olympus-plane')) addPlaneImages(event.target); }} projection={mapProjection === 'globe' ? ({ type: 'globe' } as import('maplibre-gl').ProjectionSpecification) : ({ type: 'mercator' } as import('maplibre-gl').ProjectionSpecification)} style={{ width: '100%', height: '100%', cursor: 'crosshair' }}>
          <NavigationControl position="top-right" showCompass={true} visualizePitch={true} />
          <NoaaWeatherRadarLayer />
          {infrastructurePopup && <Popup longitude={infrastructurePopup.item.lon} latitude={infrastructurePopup.item.lat} anchor="bottom" closeButton={false} onClose={() => setInfrastructurePopup(null)}><div className="bg-[#05070b] border border-white/20 text-white font-mono min-w-[280px]"><div className="px-3 py-2 border-b border-white/10 flex items-center justify-between"><span className="text-cyan-300 text-[10px] uppercase tracking-[0.18em]">{infrastructurePopup.type === 'radar' ? 'Radar Region' : infrastructurePopup.type === 'military' ? 'Installation' : 'Airport'}</span><button onClick={() => setInfrastructurePopup(null)} className="text-white/40 hover:text-white">×</button></div><div className="p-3 space-y-1 text-[11px] text-white/65"><div className="text-white text-sm font-bold">{infrastructureTitle(infrastructurePopup)}</div><div>{infrastructureSubtitle(infrastructurePopup)}</div>{infrastructurePopup.type === 'radar' && <div className="text-white/45">Click toggles this radar region feed node.</div>}</div></div></Popup>}
          <Source id="active-radar-zones" type="geojson" data={activeRadarZones}><Layer id="active-radar-zone-fill" type="fill" paint={{ 'fill-color': '#06b6d4', 'fill-opacity': 0.08 }} /><Layer id="active-radar-zone-outline" type="line" paint={{ 'line-color': '#22d3ee', 'line-opacity': 0.55, 'line-width': 1 }} /></Source>
          <Source id="aircraft" type="geojson" data={pointsGeoJSON}><Layer id="aircraft-click-target" type="circle" paint={{ 'circle-radius': ['interpolate', ['linear'], ['zoom'], 3, 5, 4, 6, 5, 8, 6, 10, 7, 12], 'circle-color': '#38bdf8', 'circle-opacity': 0.01, 'circle-stroke-opacity': 0 }} /><Layer id="aircraft-halo" type="circle" paint={{ 'circle-radius': ['case', ['==', ['get', 'icao24'], selectedIcao24 || ''], 12, ['boolean', ['get', 'isEmergency'], false], 10, 0], 'circle-color': 'transparent', 'circle-stroke-width': ['case', ['==', ['get', 'icao24'], selectedIcao24 || ''], 2, ['boolean', ['get', 'isEmergency'], false], 2, 0], 'circle-stroke-color': ['case', ['boolean', ['get', 'isEmergency'], false], '#ef4444', '#38bdf8'] }} /><Layer id="aircraft-points" type="symbol" layout={{ 'icon-image': ['case', ['==', ['get', 'icao24'], selectedIcao24 || ''], 'olympus-plane-selected', ['boolean', ['get', 'isEmergency'], false], 'olympus-plane-emergency', ['boolean', ['get', 'onGround'], false], 'olympus-plane-ground', 'olympus-plane-airborne'], 'icon-size': ['interpolate', ['linear'], ['zoom'], 3, 0.28, 5, 0.34, 7, 0.42], 'icon-rotate': ['-', ['coalesce', ['get', 'heading'], 0], 45], 'icon-rotation-alignment': 'map', 'icon-allow-overlap': true, 'icon-ignore-placement': true }} paint={{ 'icon-opacity': 0.98 }} /></Source>
          <Source id="radar-regions" type="geojson" data={radarGeoJSON}><Layer id="radar-region-points" type="circle" paint={{ 'circle-radius': ['case', ['boolean', ['get', 'active'], false], 9, 7], 'circle-color': ['case', ['boolean', ['get', 'active'], false], '#22d3ee', '#0f172a'], 'circle-stroke-color': '#67e8f9', 'circle-stroke-width': ['case', ['boolean', ['get', 'active'], false], 3, 2], 'circle-opacity': 0.92 }} /></Source>
          <Source id="airport-pins" type="geojson" data={airportGeoJSON}><Layer id="airport-points" type="circle" paint={{ 'circle-radius': 5, 'circle-color': '#facc15', 'circle-stroke-color': '#78350f', 'circle-stroke-width': 1.5, 'circle-opacity': 0.9 }} /></Source>
        </Map>
        <FlightTargetPanel flight={selectedDisplayFlight} onClose={closeFlightPanel} onReport={reportSelectedAirEmergency} onConfirm={confirmSelectedEmergency} onRadio={makeRadioContact} onStandDown={standDownSelectedEmergency} />
        <FlightAlertLog alerts={flightAlerts} onClear={() => setFlightAlerts([])} onSelect={(alert) => { if (alert.activeDistress) setSelectedIcao24(alert.icao24); }} />
        <MapLayerControl />
        <VhfAudioPanel />
      </div>
      <FlightsStatusBar lastUpdated={timestamp} isError={isError} provider={provider} />
    </div>
  );
};

function FlightTargetPanel({ flight, onClose, onReport, onConfirm, onRadio, onStandDown }: { flight: AircraftState | null; onClose: () => void; onReport: () => void; onConfirm: () => void; onRadio: () => void; onStandDown: () => void }) {
  if (!flight) return null;
  const isEmergency = Boolean(flight.emergency && flight.emergency !== 'none');
  return <DraggableDockPanel storageKey="olympus.flight.detailPanel.position.v1" title="TARGET // FLIGHT" subtitle="Drag to dock anywhere on the map" width={384} minHeight={420} defaultPosition={{ x: 16, y: 86 }} onClose={onClose} className={`${isEmergency ? '!border-red-500/60 shadow-[0_0_24px_rgba(239,68,68,0.42)]' : '!border-l-intel-accent/30'}`} bodyClassName="p-5 space-y-5"><div className="pb-4 border-b border-intel-accent/20"><div className="text-2xl font-bold text-intel-text-light tracking-wider drop-shadow-[0_0_8px_rgba(224,242,254,0.5)]">{(flight.callsign || flight.registration || flight.icao24).toUpperCase()}</div><div className="text-intel-text text-xs mt-2 space-x-3 opacity-80"><span>ICAO: {flight.icao24}</span>{flight.registration && <span>REG: {flight.registration}</span>}</div></div>{isEmergency && <div className="animate-pulse border border-red-500 bg-red-950/35 p-3 text-red-200 shadow-[0_0_18px_rgba(239,68,68,0.35)]">⚠ FLIGHT ALERT: {alertLabel(flight.emergency)}</div>}<div className="space-y-3 relative"><div className="absolute -left-5 top-0 bottom-0 w-1 bg-intel-accent/30" /><div className="grid grid-cols-2 gap-x-6 gap-y-4 text-[11px]"><Detail label="Registration" value={flight.registration} /><Detail label="Country" value={flight.originCountry} /><Detail label="Operator" value={flight.operator} /><Detail label="Squawk" value={flight.squawk} /><Detail label="Baro Alt" value={valueOrDash(flight.baroAltitude, ' m')} /><Detail label="Geo Alt" value={valueOrDash(flight.geoAltitude, ' m')} /><Detail label="Speed" value={valueOrDash(flight.velocity, ' m/s')} /><Detail label="Alert" value={flight.emergency || 'none'} /></div></div><div className="grid grid-cols-1 gap-2 pt-4 border-t border-white/10"><button onClick={onReport} className="w-full border border-red-500 bg-red-950/30 px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-red-200 hover:bg-red-500/20">⚠ Report Flight Alert</button><button onClick={onConfirm} className="w-full border border-amber-400 bg-amber-950/25 px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-amber-200 hover:bg-amber-400/20">Confirm Alert</button><button onClick={onRadio} className="w-full border border-cyan-400 bg-cyan-950/20 px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-cyan-200 hover:bg-cyan-400/20">Make Radio Contact</button><button onClick={onStandDown} className="w-full border border-white/25 bg-white/5 px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-white/70 hover:bg-white/10">Stand Down / Resolve</button></div></DraggableDockPanel>;
}

function FlightAlertLog({ alerts, onClear, onSelect }: { alerts: FlightAlert[]; onClear: () => void; onSelect: (alert: FlightAlert) => void }) {
  const active = alerts.find((alert) => alert.activeDistress);
  return <div className="absolute top-[19rem] right-16 z-[70] w-[360px] font-mono pointer-events-auto">{active && <button onClick={() => onSelect(active)} className="mb-3 block w-full text-left animate-pulse border-2 border-red-500 bg-red-950/45 p-3 text-red-100 shadow-[0_0_24px_rgba(239,68,68,0.55)]"><div className="flex items-center justify-between gap-3"><div className="text-[10px] uppercase tracking-[0.22em] text-red-200">⚠ {active.title}</div><div className="text-[9px] text-red-200/65">{new Date(active.timestamp).toLocaleTimeString()}</div></div><div className="mt-2 text-sm font-bold uppercase tracking-[0.08em]">{active.emergency}</div><div className="mt-1 text-xs text-red-100/75">{active.details}</div></button>}<div className="border border-cyan-400/25 bg-black/60 backdrop-blur shadow-[0_0_20px_rgba(0,229,255,0.08)]"><div className="flex items-center justify-between border-b border-white/10 px-3 py-2"><div className="text-[10px] uppercase tracking-[0.22em] text-cyan-300">Flight Notifications</div><button onClick={onClear} className="text-[9px] uppercase tracking-[0.16em] text-white/35 hover:text-white">Clear</button></div><div className="max-h-56 overflow-auto">{alerts.length === 0 ? <div className="px-3 py-3 text-[11px] text-white/35">No flight notifications yet.</div> : alerts.map((alert) => <button key={alert.id} onClick={() => onSelect(alert)} disabled={!alert.activeDistress} className={`block w-full border-b border-white/8 px-3 py-2 text-left text-[11px] ${alert.activeDistress ? 'text-white/65 hover:bg-cyan-400/10' : 'text-white/35 cursor-default'}`}><div className="flex items-center justify-between gap-2"><span className={alert.activeDistress ? 'text-red-200 uppercase tracking-[0.14em]' : 'text-white/45 uppercase tracking-[0.14em]'}>{alert.title}</span><span className="text-white/35">{new Date(alert.timestamp).toLocaleString()}</span></div><div className="mt-1 text-white/80">{alert.details}</div><div className="mt-1 text-white/35">ICAO {alert.icao24} | Reported by {alert.reportedBy}</div></button>)}</div></div></div>;
}

function Detail({ label, value }: { label: string; value: unknown }) {
  return <div><div className="text-white/35 uppercase tracking-[0.16em]">{label}</div><div className="text-white/75">{valueOrDash(value)}</div></div>;
}
