# Olympus App Pack Index

Olympus app packs are industry-specific products or deployable experiences built from the Dennco Olympus Command master platform.

The app pack system keeps the core broad while allowing each market, industry, customer, or deployment lane to receive focused modules, source packs, dashboards, reports, and policy rules.

## Core distinction

```text
Core platform = shared command capability.
Extension = plug-in capability inside Olympus.
Mirror = deployment profile or replica.
App = standalone product or industry version.
```

## Foundational guardrail

Developer sessions must follow the foundational notes, scalable platform direction, and app-pack scaffold before making structural changes.

If a request conflicts with the master-platform direction or the app/core split, development must pause until research/planning and the development team resolve the conflict. Once resolved, the settled plan must be written into the notes or scaffold before implementation continues.

See [`docs/DEVELOPMENT_GUARDRAILS.md`](DEVELOPMENT_GUARDRAILS.md).

## Initial app packs

| App pack | Path | Status | Purpose |
| --- | --- | --- | --- |
| Olympus Municipal | `apps/olympus-municipal/` | draft | Municipal operations, public works, civic infrastructure, public meetings, road conditions, grants, and local operational awareness. |
| Olympus Cyber | `apps/olympus-cyber/` | draft | Cybersecurity alerts, vulnerability awareness, vendor advisories, asset risk, and executive cyber briefs. |
| Olympus Emergency Management | `apps/olympus-emergency-management/` | draft | Weather hazards, incident coordination, shelters, road closures, utilities, public alerts, and recovery status. |
| Olympus Infrastructure | `apps/olympus-infrastructure/` | draft | Roads, bridges, water, power, telecom, facilities, inspections, maintenance, and infrastructure risk. |
| Olympus Data Center Ops | `apps/olympus-data-center-ops/` | draft | Data center operations, uptime, facilities, power, cooling, network status, physical security, and incident reporting. |
| Olympus Enterprise Security | `apps/olympus-enterprise-security/` | draft | Enterprise facilities, vendors, IT systems, incidents, security alerts, compliance, and executive reporting. |
| Olympus Proxmox Data Center | `apps/olympus-proxmox-data-center/` | draft | Proxmox cluster visibility, VM/container inventory, clone-only support lab workflows, live sandbox repair spaces, AI-assisted file review, and production apply planning. |

## App pack contents

Each app pack should eventually include:

```text
apps/<app-id>/
  app.manifest.json
  README.md
  NOTES.md
  PRODUCT_PLAN.md
  client/
  server/
  config/
```

The initial scaffold starts with `app.manifest.json`, `README.md`, and `NOTES.md`.

## App manifest role

The app manifest gives each product lane a stable ID, name, version, kind, status, entrypoints, dependencies, and metadata.

The initial manifests are draft planning anchors. They do not mean the app is fully implemented.

## Research and development rule

Research sessions define product scope, source policy, workflows, and market-specific doctrine before the app pack is sent into deeper development.

Developer sessions should not build app-specific behavior into the shared core unless the capability clearly benefits multiple product lanes.

## Next planning questions

For each app pack, answer:

1. Who is the target user?
2. What problem does the app solve?
3. Which core modules are enabled?
4. Which extensions are required?
5. Which sources are allowed?
6. Which sources are restricted?
7. What reports does it generate?
8. What dashboards does it need?
9. What permissions and roles does it need?
10. What makes it commercially useful first?
