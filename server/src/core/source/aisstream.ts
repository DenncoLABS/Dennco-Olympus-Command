import WebSocket from 'ws';
import { readAdminRuntimeSettings } from '../adminRuntimeSettings';

const AIS_MESSAGE_TYPES = [
  'PositionReport',
  'StandardClassBPositionReport',
  'ExtendedClassBPositionReport',
  'ShipStaticData',
  'StaticDataReport',
  'BaseStationReport',
  'StandardSearchAndRescueAircraftReport',
  'AidsToNavigationReport',
  'SafetyBroadcastMessage',
];

export interface PositionReport {
  MessageID: number;
  RepeatIndicator: number;
  UserID: number;
  Valid: boolean;
  NavigationalStatus: number;
  RateOfTurn: number;
  Sog: number;
  PositionAccuracy: boolean;
  Longitude: number;
  Latitude: number;
  Cog: number;
  TrueHeading: number;
  Timestamp: number;
  SpecialManoeuvreIndicator: number;
  Spare: number;
  Raim: boolean;
  CommunicationState: number;
}

export interface ShipStaticData {
  MessageID: number;
  RepeatIndicator: number;
  UserID: number;
  Valid: boolean;
  AisVersion: number;
  ImoNumber: number;
  CallSign: string;
  Name: string;
  Type: number;
  Dimension: { A: number; B: number; C: number; D: number };
  FixType: number;
  Eta: { Day: number; Hour: number; Minute: number; Month: number };
  MaximumStaticDraught: number;
  Destination: string;
  Dte: boolean;
  Spare: boolean;
}

export interface AisMessage {
  MessageType: string;
  MetaData: {
    MMSI: number;
    ShipName: string;
    latitude?: number;
    longitude?: number;
    Latitude?: number;
    Longitude?: number;
    time_utc: string;
  };
  Message: {
    PositionReport?: PositionReport;
    ShipStaticData?: ShipStaticData;
    [key: string]: any;
  };
}

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

function getAisStreamApiKey(): string {
  const envKey = (process.env.AISSTREAM_API_KEY || '').trim();
  if (envKey) return envKey;
  return (readAdminRuntimeSettings().apiKeys?.aisstream || '').trim();
}

function validLat(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= -90 && value <= 90;
}

function validLon(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= -180 && value <= 180;
}

function metaLat(message: AisMessage): number | undefined {
  const value = message.MetaData?.latitude ?? message.MetaData?.Latitude;
  return validLat(value) ? value : undefined;
}

function metaLon(message: AisMessage): number | undefined {
  const value = message.MetaData?.longitude ?? message.MetaData?.Longitude;
  return validLon(value) ? value : undefined;
}

class AisStreamService {
  private ws: WebSocket | null = null;
  public vessels: Map<number, VesselState> = new Map();
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private purgeInterval: NodeJS.Timeout | null = null;
  private silentWatchdogInterval: NodeJS.Timeout | null = null;
  private apiKey: string;
  public lastMessageReceived = 0;
  public totalMessagesReceived = 0;
  public isConnected = false;
  public subscribed = false;
  public lastError: string | null = null;
  public lastRawMessageReceived = 0;
  public lastMessageType: string | null = null;
  public lastIgnoredReason: string | null = null;

  public get readyState(): number {
    return this.ws ? this.ws.readyState : -1;
  }

  public get configured(): boolean {
    return Boolean(this.apiKey);
  }

  private readonly STALE_THRESHOLD_MS = 30 * 60 * 1000;

  constructor() {
    this.apiKey = getAisStreamApiKey();
    if (!this.apiKey) {
      this.lastError = 'AISStream key is not configured.';
      console.warn('[AISStream] AISStream key not found in env or admin runtime settings.');
      return;
    }
    this.connect();
    this.purgeInterval = setInterval(() => this.purgeStaleVessels(), 5 * 60 * 1000);
    this.silentWatchdogInterval = setInterval(() => this.reconnectIfSilent(), 60 * 1000);
  }

  public reloadCredentialsAndReconnect() {
    const nextKey = getAisStreamApiKey();
    if (!nextKey) {
      this.lastError = 'AISStream key is not configured.';
      console.warn('[AISStream] Reload requested, but no AISStream key is configured.');
      return false;
    }
    this.apiKey = nextKey;
    this.connect();
    if (!this.purgeInterval) this.purgeInterval = setInterval(() => this.purgeStaleVessels(), 5 * 60 * 1000);
    if (!this.silentWatchdogInterval) this.silentWatchdogInterval = setInterval(() => this.reconnectIfSilent(), 60 * 1000);
    return true;
  }

  private reconnectIfSilent() {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN || !this.subscribed) return;
    const lastSeen = Math.max(this.lastRawMessageReceived, this.lastMessageReceived);
    if (lastSeen === 0 || Date.now() - lastSeen > 5 * 60 * 1000) {
      this.lastError = 'AISStream connected but silent; reconnecting subscription.';
      console.warn('[AISStream] Connected but silent. Reconnecting subscription.');
      this.connect();
    }
  }

  private connect() {
    this.subscribed = false;
    this.lastError = null;
    this.lastIgnoredReason = null;

    if (this.ws) {
      try { this.ws.close(); } catch (e) {}
    }

    console.log('[AISStream] Connecting to wss://stream.aisstream.io/v0/stream...');
    this.ws = new WebSocket('wss://stream.aisstream.io/v0/stream');

    this.ws.on('open', () => {
      console.log('[AISStream] Connected. Sending subscription message.');
      this.isConnected = true;

      const subscriptionMessage = {
        APIKey: this.apiKey,
        BoundingBoxes: [
          [[-90, -180], [90, 180]],
        ],
        FilterMessageTypes: AIS_MESSAGE_TYPES,
      };

      this.ws?.send(JSON.stringify(subscriptionMessage));
      this.subscribed = true;

      if (this.reconnectTimeout) {
        clearTimeout(this.reconnectTimeout);
        this.reconnectTimeout = null;
      }
    });

    this.ws.on('message', (data: WebSocket.Data) => {
      try {
        const messageStr = data.toString();
        this.lastRawMessageReceived = Date.now();
        const aisMessage = JSON.parse(messageStr);

        if (aisMessage.error) {
          this.lastError = String(aisMessage.error);
          console.error('[AISStream] API Error from server:', aisMessage.error);
          return;
        }

        this.lastMessageType = aisMessage.MessageType || null;
        this.lastMessageReceived = Date.now();
        this.totalMessagesReceived++;
        this.handleMessage(aisMessage as AisMessage);
      } catch (e) {
        this.lastError = e instanceof Error ? e.message : 'Error parsing AISStream message.';
        console.error('[AISStream] Error parsing message:', e);
      }
    });

    this.ws.on('error', (err) => {
      this.lastError = err.message;
      console.error('[AISStream] WebSocket error:', err.message);
    });

    this.ws.on('close', () => {
      console.log('[AISStream] WebSocket connection closed. Attempting reconnect in 5 seconds...');
      this.isConnected = false;
      this.subscribed = false;
      this.reconnectTimeout = setTimeout(() => this.connect(), 5000);
    });
  }

  private handleMessage(message: AisMessage) {
    const mmsi = message.MetaData?.MMSI;
    if (!mmsi) {
      this.lastIgnoredReason = 'Missing MMSI in MetaData.';
      return;
    }

    let vessel = this.vessels.get(mmsi);
    if (!vessel) {
      vessel = {
        mmsi,
        name: message.MetaData.ShipName ? message.MetaData.ShipName.trim() : `Unknown (${mmsi})`,
        lat: metaLat(message) ?? 0,
        lon: metaLon(message) ?? 0,
        sog: 0,
        cog: 0,
        heading: 0,
        navigationalStatus: 15,
        sourceKind: 'vessel',
        lastUpdate: Date.now(),
      };
    } else {
      vessel.lastUpdate = Date.now();
      if (message.MetaData.ShipName && message.MetaData.ShipName.trim()) vessel.name = message.MetaData.ShipName.trim();
      const mLat = metaLat(message);
      const mLon = metaLon(message);
      if (mLat != null) vessel.lat = mLat;
      if (mLon != null) vessel.lon = mLon;
    }

    if (message.MessageType === 'PositionReport' && message.Message.PositionReport) {
      const pos = message.Message.PositionReport;
      vessel.sourceKind = 'vessel';
      if (pos.Sog != null) vessel.sog = pos.Sog;
      if (pos.Cog != null) vessel.cog = pos.Cog;
      if (pos.TrueHeading != null && pos.TrueHeading !== 511) vessel.heading = pos.TrueHeading;
      if (pos.NavigationalStatus != null) vessel.navigationalStatus = pos.NavigationalStatus;
      if (validLat(pos.Latitude)) vessel.lat = pos.Latitude;
      if (validLon(pos.Longitude)) vessel.lon = pos.Longitude;
    } else if (message.MessageType === 'StandardClassBPositionReport' && message.Message.StandardClassBPositionReport) {
      const pos = message.Message.StandardClassBPositionReport;
      vessel.sourceKind = 'vessel';
      if (pos.Sog != null) vessel.sog = pos.Sog;
      if (pos.Cog != null) vessel.cog = pos.Cog;
      if (pos.TrueHeading != null && pos.TrueHeading !== 511) vessel.heading = pos.TrueHeading;
      if (validLat(pos.Latitude)) vessel.lat = pos.Latitude;
      if (validLon(pos.Longitude)) vessel.lon = pos.Longitude;
    } else if (message.MessageType === 'ExtendedClassBPositionReport' && message.Message.ExtendedClassBPositionReport) {
      const pos = message.Message.ExtendedClassBPositionReport;
      vessel.sourceKind = 'vessel';
      if (pos.Sog != null) vessel.sog = pos.Sog;
      if (pos.Cog != null) vessel.cog = pos.Cog;
      if (pos.TrueHeading != null && pos.TrueHeading !== 511) vessel.heading = pos.TrueHeading;
      if (validLat(pos.Latitude)) vessel.lat = pos.Latitude;
      if (validLon(pos.Longitude)) vessel.lon = pos.Longitude;
      if (pos.Name && pos.Name.trim().length > 0) vessel.name = pos.Name.trim().replace(/@+$/, '');
      if (pos.Type != null) vessel.type = pos.Type;
    } else if (message.MessageType === 'ShipStaticData' && message.Message.ShipStaticData) {
      const stat = message.Message.ShipStaticData;
      if (stat.Name && stat.Name.trim().length > 0) vessel.name = stat.Name.trim().replace(/@+$/, '');
      if (stat.Type != null) vessel.type = stat.Type;
      if (stat.CallSign && stat.CallSign.trim().length > 0) vessel.callsign = stat.CallSign.trim().replace(/@+$/, '');
      if (stat.Destination && stat.Destination.trim().length > 0) vessel.destination = stat.Destination.trim().replace(/@+$/, '');
      if (stat.Dimension) vessel.dimension = { a: stat.Dimension.A, b: stat.Dimension.B, c: stat.Dimension.C, d: stat.Dimension.D };
    } else if (message.MessageType === 'BaseStationReport' && message.Message.BaseStationReport) {
      const pos = message.Message.BaseStationReport;
      vessel.sourceKind = 'base-station';
      vessel.sog = 0;
      vessel.cog = 0;
      vessel.heading = 0;
      if (validLat(pos.Latitude)) vessel.lat = pos.Latitude;
      if (validLon(pos.Longitude)) vessel.lon = pos.Longitude;
      if (vessel.name.startsWith('Unknown')) vessel.name = `Base Station (${mmsi})`;
    } else if (message.MessageType === 'StandardSearchAndRescueAircraftReport' && message.Message.StandardSearchAndRescueAircraftReport) {
      const pos = message.Message.StandardSearchAndRescueAircraftReport;
      vessel.sourceKind = 'sar-aircraft';
      if (pos.Sog != null) vessel.sog = pos.Sog;
      if (pos.Cog != null) vessel.cog = pos.Cog;
      if (pos.Altitude != null) vessel.altitude = pos.Altitude;
      if (validLat(pos.Latitude)) vessel.lat = pos.Latitude;
      if (validLon(pos.Longitude)) vessel.lon = pos.Longitude;
      if (vessel.name.startsWith('Unknown')) vessel.name = `SAR Aircraft (${mmsi})`;
    } else if (message.MessageType === 'StaticDataReport' && message.Message.StaticDataReport) {
      const stat = message.Message.StaticDataReport;
      if (stat.ReportA?.Name && stat.ReportA.Name.trim().length > 0) vessel.name = stat.ReportA.Name.trim().replace(/@+$/, '');
      if (stat.ReportB) {
        if (stat.ReportB.CallSign && stat.ReportB.CallSign.trim().length > 0) vessel.callsign = stat.ReportB.CallSign.trim().replace(/@+$/, '');
        if (stat.ReportB.ShipType != null) vessel.type = stat.ReportB.ShipType;
        if (stat.ReportB.Dimension) vessel.dimension = { a: stat.ReportB.Dimension.A, b: stat.ReportB.Dimension.B, c: stat.ReportB.Dimension.C, d: stat.ReportB.Dimension.D };
      }
    } else if (message.MessageType === 'AidsToNavigationReport' && message.Message.AidsToNavigationReport) {
      const aton = message.Message.AidsToNavigationReport;
      vessel.sourceKind = 'aid-to-navigation';
      vessel.sog = 0;
      vessel.cog = 0;
      vessel.heading = 0;
      if (validLat(aton.Latitude)) vessel.lat = aton.Latitude;
      if (validLon(aton.Longitude)) vessel.lon = aton.Longitude;
      if (aton.Name && aton.Name.trim().length > 0) vessel.name = aton.Name.trim().replace(/@+$/, '');
      if (aton.Type != null) vessel.type = aton.Type;
      if (aton.Dimension) vessel.dimension = { a: aton.Dimension.A, b: aton.Dimension.B, c: aton.Dimension.C, d: aton.Dimension.D };
    } else if (message.MessageType === 'SafetyBroadcastMessage' && message.Message.SafetyBroadcastMessage) {
      const safety = message.Message.SafetyBroadcastMessage;
      if (safety.Text && safety.Text.trim().length > 0) vessel.textMessage = safety.Text.trim();
    }

    if (!validLat(vessel.lat) || !validLon(vessel.lon) || (vessel.lat === 0 && vessel.lon === 0)) {
      this.lastIgnoredReason = `Invalid coordinates for ${message.MessageType || 'unknown message'}.`;
      return;
    }

    if (vessel.sourceKind === 'vessel' || vessel.sourceKind === 'sar-aircraft') {
      if (!vessel.history) vessel.history = [];
      const lastPoint = vessel.history[vessel.history.length - 1];
      if (!lastPoint || lastPoint[0] !== vessel.lon || lastPoint[1] !== vessel.lat) {
        vessel.history.push([vessel.lon, vessel.lat]);
        if (vessel.history.length > 150) vessel.history.shift();
      }
    } else {
      vessel.history = undefined;
    }

    this.lastIgnoredReason = null;
    this.vessels.set(mmsi, vessel);
  }

  private purgeStaleVessels() {
    const now = Date.now();
    for (const [mmsi, vessel] of this.vessels.entries()) {
      if (now - vessel.lastUpdate > this.STALE_THRESHOLD_MS) this.vessels.delete(mmsi);
    }
  }
}

export const aisStreamService = new AisStreamService();
