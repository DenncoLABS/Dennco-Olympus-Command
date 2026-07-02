# Olympus Command Platform Architecture

Dennco Olympus Command is organized as a core geospatial intelligence and operational-intelligence platform with three expansion lanes:

- `extensions/` — optional modules that extend the core dashboard, backend, data-source layer, widget system, or AI/reporting surfaces.
- `mirrors/` — deployment profiles for branded, regional, partner, public, internal, read-only, or customer-specific replicas.
- `apps/` — standalone products and industry-specific command applications built on top of the platform.

This architecture supports the master-platform model:

```text
Master platform
  -> shared command core
  -> extensions for capability
  -> mirrors for deployment profiles
  -> apps for products and industry versions
```

The master copy should stay broad. Specific markets, industries, partners, and deployments should be shaped at the edge through manifests, source packs, enabled modules, branding, reports, and policy settings.

## Core folders

```text
client/       Main React/TypeScript interface
server/       Express data proxy and source adapters
extensions/   Optional modules
mirrors/      Deployment profiles and replica definitions
apps/         Standalone products and industry app packs
platform/     Architecture notes, schemas, and conventions
tools/        Repository tooling and manifest utilities
```

## Manifest types

All expandable platform units use JSON manifests:

| Folder | Manifest | Purpose |
| --- | --- | --- |
| `extensions/*` | `extension.manifest.json` | Adds modules, widgets, routes, sources, workers, AI/reporting surfaces, and integrations |
| `mirrors/*` | `mirror.manifest.json` | Defines deployment profiles, branding, enabled modules, source sets, regional bounds, and replica behavior |
| `apps/*` | `app.manifest.json` | Defines standalone app packages, industry versions, and deployable command products |

## Expansion-lane guidance

### Use core when

A change improves the shared Olympus shell, map/Earth surface, Desk/Dock behavior, source standards, admin control plane, data normalization model, package/deployment system, or other capability that should benefit multiple deployments.

### Use extensions when

A capability should plug into Olympus without becoming a separate product. Extensions are the correct place for specialized modules, widgets, source adapters, background workers, AI helpers, and domain-specific panels.

### Use mirrors when

The same Olympus core needs a different deployment profile. Mirrors are the correct place for partner versions, regional versions, public read-only dashboards, internal replicas, customer-specific branding, source selections, and enabled-module profiles.

### Use apps when

The capability becomes a product or industry version with its own identity, routing, release cycle, domain, customer target, or deployment package.

Examples include municipal, cyber, infrastructure, emergency management, data center operations, aviation, maritime, enterprise security, or logistics products built from the master platform.

## Lifecycle status

Use these status values consistently:

- `draft` — planned or scaffolded, not active.
- `active` — maintained and expected to work.
- `deprecated` — still present, not recommended.
- `archived` — retained for records only.

## Development rule

Core changes should improve the platform itself. New capabilities should start as extensions, mirrors, or apps unless they clearly belong in the shared core.

Do not flatten Olympus Command into one market-specific app. The repo should keep all vectors pointed toward the same architecture:

```text
Core platform first.
Specialized products second.
Industry-specific deployments through apps, mirrors, extensions, and source packs.
```
