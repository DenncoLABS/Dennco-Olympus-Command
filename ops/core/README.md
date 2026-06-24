# Olympus Core Services

Olympus is being built as a scalable intelligence platform. Live API data is treated as an observation; Olympus owns the permanent intelligence records.

This directory pins the open-source core services needed for the platform foundation so upgrades are controlled through the repository instead of ad-hoc upstream installs.

## Included core

- PostgreSQL 16 with PostGIS, TimescaleDB, pgvector, and pgcrypto
- Redis 7 for fast live-state cache
- MinIO for object storage, import archives, raw files, imagery, and registry dumps

## Install

```bash
cp ops/core/.env.core.example ops/core/.env.core
nano ops/core/.env.core
bash scripts/install-core-services.sh
```

## Controlled updates

Update image tags in `ops/core/docker-compose.core.yml`, commit the change, then run:

```bash
bash scripts/update-core-services.sh
```

This keeps upstream changes under source control.

## Database model

Core entity/observation split:

- `aircraft_records` = permanent aircraft entities
- `aircraft_sightings` = observed aircraft events
- `vessel_records` = permanent maritime vessel entities
- `vessel_sightings` = observed AIS events
- `feed_nodes` = physical/logical data nodes
- `feed_node_observations` = node-to-entity observations
- `intel_sources` = source attribution and trust level
- `enrichment_jobs` = background enrichment work
- `audit_logs` = operator/system audit trail

## Design rule

Live feed data is not the record. Live feed data is only an observation.
