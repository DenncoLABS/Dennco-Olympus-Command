-- Olympus Core Database Extensions
-- PostgreSQL is the permanent intelligence store.
-- PostGIS supports geospatial entity and sighting queries.
-- TimescaleDB supports high-volume time-series observations.
-- pgvector supports future similarity search and embedding workflows.

CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS timescaledb;
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pgcrypto;
