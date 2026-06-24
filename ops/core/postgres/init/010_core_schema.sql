-- Olympus Intelligence Core Schema
-- Live API data is an observation. Olympus owns the permanent entity record.

CREATE TABLE IF NOT EXISTS intel_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_key TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  source_type TEXT NOT NULL,
  base_url TEXT,
  trust_level INTEGER NOT NULL DEFAULT 50,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS feed_nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  node_key TEXT UNIQUE NOT NULL,
  domain TEXT NOT NULL CHECK (domain IN ('aircraft', 'maritime', 'weather', 'dot', 'cyber', 'monitor')),
  display_name TEXT NOT NULL,
  node_type TEXT NOT NULL,
  scope TEXT,
  center GEOGRAPHY(Point, 4326),
  radius_nm NUMERIC,
  active BOOLEAN NOT NULL DEFAULT false,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS aircraft_records (
  icao24 TEXT PRIMARY KEY,
  registration TEXT,
  callsign TEXT,
  manufacturer TEXT,
  model TEXT,
  typecode TEXT,
  operator TEXT,
  owner TEXT,
  country TEXT,
  built_year TEXT,
  category TEXT,
  is_military BOOLEAN NOT NULL DEFAULT false,
  is_government BOOLEAN NOT NULL DEFAULT false,
  source_id UUID REFERENCES intel_sources(id),
  source_confidence INTEGER NOT NULL DEFAULT 50,
  first_seen TIMESTAMPTZ,
  last_seen TIMESTAMPTZ,
  last_enriched TIMESTAMPTZ,
  raw_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS vessel_records (
  mmsi BIGINT PRIMARY KEY,
  imo BIGINT,
  vessel_name TEXT,
  callsign TEXT,
  vessel_type TEXT,
  flag_country TEXT,
  owner TEXT,
  operator TEXT,
  home_port TEXT,
  length_m NUMERIC,
  beam_m NUMERIC,
  gross_tonnage NUMERIC,
  deadweight_tonnage NUMERIC,
  built_year TEXT,
  classification TEXT,
  is_military BOOLEAN NOT NULL DEFAULT false,
  is_government BOOLEAN NOT NULL DEFAULT false,
  source_id UUID REFERENCES intel_sources(id),
  source_confidence INTEGER NOT NULL DEFAULT 50,
  first_seen TIMESTAMPTZ,
  last_seen TIMESTAMPTZ,
  last_enriched TIMESTAMPTZ,
  raw_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS aircraft_sightings (
  sighting_id UUID DEFAULT gen_random_uuid(),
  icao24 TEXT NOT NULL REFERENCES aircraft_records(icao24) ON DELETE CASCADE,
  observed_at TIMESTAMPTZ NOT NULL,
  node_id UUID REFERENCES feed_nodes(id),
  source_id UUID REFERENCES intel_sources(id),
  position GEOGRAPHY(Point, 4326),
  altitude_m NUMERIC,
  velocity_mps NUMERIC,
  heading_deg NUMERIC,
  vertical_rate_mps NUMERIC,
  squawk TEXT,
  emergency TEXT,
  raw_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  PRIMARY KEY (sighting_id, observed_at)
);

CREATE TABLE IF NOT EXISTS vessel_sightings (
  sighting_id UUID DEFAULT gen_random_uuid(),
  mmsi BIGINT NOT NULL REFERENCES vessel_records(mmsi) ON DELETE CASCADE,
  observed_at TIMESTAMPTZ NOT NULL,
  node_id UUID REFERENCES feed_nodes(id),
  source_id UUID REFERENCES intel_sources(id),
  position GEOGRAPHY(Point, 4326),
  sog_knots NUMERIC,
  cog_deg NUMERIC,
  heading_deg NUMERIC,
  navigational_status INTEGER,
  destination TEXT,
  raw_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  PRIMARY KEY (sighting_id, observed_at)
);

CREATE TABLE IF NOT EXISTS feed_node_observations (
  observation_id UUID DEFAULT gen_random_uuid(),
  node_id UUID NOT NULL REFERENCES feed_nodes(id) ON DELETE CASCADE,
  observed_at TIMESTAMPTZ NOT NULL,
  domain TEXT NOT NULL,
  entity_key TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  source_id UUID REFERENCES intel_sources(id),
  raw_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  PRIMARY KEY (observation_id, observed_at)
);

CREATE TABLE IF NOT EXISTS enrichment_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain TEXT NOT NULL,
  entity_key TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'complete', 'failed', 'deferred')),
  priority INTEGER NOT NULL DEFAULT 50,
  attempts INTEGER NOT NULL DEFAULT 0,
  last_error TEXT,
  scheduled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  actor TEXT,
  action TEXT NOT NULL,
  domain TEXT,
  entity_key TEXT,
  details JSONB NOT NULL DEFAULT '{}'::jsonb
);

SELECT create_hypertable('aircraft_sightings', 'observed_at', if_not_exists => TRUE);
SELECT create_hypertable('vessel_sightings', 'observed_at', if_not_exists => TRUE);
SELECT create_hypertable('feed_node_observations', 'observed_at', if_not_exists => TRUE);

CREATE INDEX IF NOT EXISTS idx_aircraft_records_registration ON aircraft_records(registration);
CREATE INDEX IF NOT EXISTS idx_aircraft_records_operator ON aircraft_records(operator);
CREATE INDEX IF NOT EXISTS idx_aircraft_sightings_icao24_time ON aircraft_sightings(icao24, observed_at DESC);
CREATE INDEX IF NOT EXISTS idx_aircraft_sightings_position ON aircraft_sightings USING GIST(position);

CREATE INDEX IF NOT EXISTS idx_vessel_records_imo ON vessel_records(imo);
CREATE INDEX IF NOT EXISTS idx_vessel_records_name ON vessel_records(vessel_name);
CREATE INDEX IF NOT EXISTS idx_vessel_sightings_mmsi_time ON vessel_sightings(mmsi, observed_at DESC);
CREATE INDEX IF NOT EXISTS idx_vessel_sightings_position ON vessel_sightings USING GIST(position);

CREATE INDEX IF NOT EXISTS idx_feed_nodes_domain ON feed_nodes(domain);
CREATE INDEX IF NOT EXISTS idx_feed_nodes_center ON feed_nodes USING GIST(center);
CREATE INDEX IF NOT EXISTS idx_enrichment_jobs_status_priority ON enrichment_jobs(status, priority DESC, scheduled_at ASC);
