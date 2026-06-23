# Olympus Command Platform Architecture

Dennco Olympus Command is organized as a core geospatial intelligence platform with three expansion lanes:

- `extensions/` — optional modules that extend the core dashboard or backend.
- `mirrors/` — deployment profiles for branded, regional, partner, public, or internal replicas.
- `apps/` — standalone products built on top of the platform.

## Core folders

```text
client/       Main React/TypeScript interface
server/       Express data proxy and source adapters
extensions/   Optional modules
mirrors/      Deployment profiles and replica definitions
apps/         Standalone products
platform/     Architecture notes, schemas, and conventions
tools/        Repository tooling and manifest utilities
```

## Manifest types

All expandable platform units use JSON manifests:

| Folder | Manifest | Purpose |
| --- | --- | --- |
| `extensions/*` | `extension.manifest.json` | Adds modules, widgets, routes, sources, and integrations |
| `mirrors/*` | `mirror.manifest.json` | Defines deployment profiles and replica behavior |
| `apps/*` | `app.manifest.json` | Defines standalone app packages |

## Lifecycle status

Use these status values consistently:

- `draft` — planned or scaffolded, not active.
- `active` — maintained and expected to work.
- `deprecated` — still present, not recommended.
- `archived` — retained for records only.

## Development rule

Core changes should improve the platform itself. New capabilities should start as extensions, mirrors, or apps unless they clearly belong in the shared core.
