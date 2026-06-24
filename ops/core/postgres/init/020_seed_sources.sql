-- Olympus seed source records and first-generation feed nodes.

INSERT INTO intel_sources (source_key, display_name, source_type, base_url, trust_level)
VALUES
  ('adsb_lol', 'ADSB.lol', 'aircraft-live-feed', 'https://api.adsb.lol', 70),
  ('aisstream', 'AISStream', 'maritime-live-feed', 'https://aisstream.io', 70),
  ('faa_registry', 'FAA Aircraft Registry', 'aircraft-registry', 'https://registry.faa.gov', 85),
  ('olympus_manual', 'Olympus Manual Entry', 'manual', NULL, 60)
ON CONFLICT (source_key) DO UPDATE
SET display_name = EXCLUDED.display_name,
    source_type = EXCLUDED.source_type,
    base_url = EXCLUDED.base_url,
    trust_level = EXCLUDED.trust_level,
    updated_at = now();

INSERT INTO feed_nodes (node_key, domain, display_name, node_type, scope, center, radius_nm, metadata)
VALUES
  ('flights-great-lakes', 'aircraft', 'Great Lakes Aircraft Radar Node', 'adsb-region', 'US', ST_SetSRID(ST_MakePoint(-84.9, 42.7), 4326)::geography, 250, '{"region":"great-lakes"}'),
  ('flights-northeast', 'aircraft', 'Northeast Aircraft Radar Node', 'adsb-region', 'US', ST_SetSRID(ST_MakePoint(-74.2, 40.8), 4326)::geography, 250, '{"region":"northeast"}'),
  ('flights-pacific-nw', 'aircraft', 'Pacific Northwest Aircraft Radar Node', 'adsb-region', 'US', ST_SetSRID(ST_MakePoint(-122.3, 47.5), 4326)::geography, 250, '{"region":"pacific-nw"}'),
  ('maritime-great-lakes-west', 'maritime', 'Western Great Lakes Maritime Node', 'ais-region', 'US', ST_SetSRID(ST_MakePoint(-87.3, 46.5), 4326)::geography, 220, '{"region":"great-lakes-west"}'),
  ('maritime-great-lakes-east', 'maritime', 'Eastern Great Lakes Maritime Node', 'ais-region', 'US', ST_SetSRID(ST_MakePoint(-82.8, 42.4), 4326)::geography, 220, '{"region":"great-lakes-east"}'),
  ('maritime-ny-harbor', 'maritime', 'New York Harbor Maritime Node', 'ais-region', 'US', ST_SetSRID(ST_MakePoint(-73.9, 40.6), 4326)::geography, 180, '{"region":"ny-harbor"}')
ON CONFLICT (node_key) DO UPDATE
SET display_name = EXCLUDED.display_name,
    node_type = EXCLUDED.node_type,
    scope = EXCLUDED.scope,
    center = EXCLUDED.center,
    radius_nm = EXCLUDED.radius_nm,
    metadata = EXCLUDED.metadata,
    updated_at = now();
