# Rebuild Core Services

This file intentionally lives under `packaging/` because the apt publish workflow watches that path.

Purpose:
- Force a package publish after adding the Olympus core services stack under `ops/core`.
- Keep package publication controlled by repository history.

Core additions referenced by this rebuild:
- PostgreSQL/PostGIS/TimescaleDB/pgvector core schema.
- Redis and MinIO compose stack.
- Controlled install/update scripts.
- Permanent entity and observation tables for aircraft and maritime intelligence.
