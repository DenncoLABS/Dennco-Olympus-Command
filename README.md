# Dennco Olympus Command

Dennco Olympus Command is a private command-and-control style situational-awareness platform operated by Dennco Information Systems. It provides a unified operational picture for aviation, maritime, DOT traffic, public-source intelligence, cyber monitoring, weather awareness, CAD dispatch, global notifications, mirrors, extensions, deployable command apps, and the emerging Olympus Core OS-style Desk.

Olympus Command should be understood as the **master operational intelligence platform** in the Dennco ecosystem. The core platform stays broad; industry versions, partner deployments, regional mirrors, and specialized products are assembled from the master copy through extensions, mirrors, apps, source packs, and deployment profiles.

Olympus Command is maintained as a Dennco-controlled platform. It should not carry upstream demo branding, starter project icons, or third-party product identity in the deployed user interface.

## Documentation index

The project is now documented across these continuation files:

- [`docs/MASTER_PLATFORM_STRATEGY.md`](docs/MASTER_PLATFORM_STRATEGY.md) — master platform doctrine, expansion lanes, industry-product model, source posture, and AI posture.
- [`docs/DEVELOPMENT_GUARDRAILS.md`](docs/DEVELOPMENT_GUARDRAILS.md) — foundational developer rules, conflict process, scaffold protection, and deployment guardrails.
- [`docs/APP_PACK_INDEX.md`](docs/APP_PACK_INDEX.md) — app-pack index for industry-specific products built from the master platform.
- [`docs/PROJECT_CONTINUITY.md`](docs/PROJECT_CONTINUITY.md) — current repo state, module status, package baseline, workflow notes, and next tasks.
- [`docs/OLYMPUS_DESK_AND_OS.md`](docs/OLYMPUS_DESK_AND_OS.md) — Olympus Desk, Dock, Earth screen, TileSpace direction, Debian/GNOME shell direction, and OS app plan.
- [`docs/OLYMPUS_TILESPACE_AND_FOCUS_FRAMEWORK.md`](docs/OLYMPUS_TILESPACE_AND_FOCUS_FRAMEWORK.md) — TileSpace, focus pages, app tiles, widgets, app Desk surfaces, smooth interactions, collaboration, notes, automations, integrations, and app settings framework.
- [`docs/MODULE_STATUS.md`](docs/MODULE_STATUS.md) — Flight, Maritime, Monitor, DOT, CAD, Admin, branding, and global notifications status.
- [`docs/DEPLOYMENT_AND_WORKFLOWS.md`](docs/DEPLOYMENT_AND_WORKFLOWS.md) — apt package publishing, manual GitHub Actions workflow, server update commands, diagnostics, and failure handling.
- [`docs/DATA_SOURCES.md`](docs/DATA_SOURCES.md) — current and planned data-source strategy for ADS-B, AIS, DOT, CCTV, NOAA/NWS, GDELT, NASA FIRMS, USGS, Yahoo Finance, Polymarket, and other feeds.
- [`docs/BRANDING_AND_METADATA.md`](docs/BRANDING_AND_METADATA.md) — Dennco/Olympus branding rules, favicon behavior, and metadata policy.

## Core modules

- **Flights** — live aircraft positions, telemetry, emergency squawks, aircraft enrichment, route history, aviation infrastructure overlays, atmospheric weather visualization, notifications, and emergency workflows.
- **Maritime** — AIS vessel tracking, vessel status, heading, destination, recent position trails, maritime diagnostics, vessel folders, and Mayday/distress context.
- **Monitor** — GPS interference, space-domain monitoring, live threat alerts, public-source signals, regional monitoring widgets, top diagnostic bar, and saved widget manifests for Desk migration.
- **DOT** — traffic events, public transportation camera feeds, road-level flow visualization, road/infrastructure context, and traffic camera popups.
- **CAD** — protected local dispatch surface, calls, units, personnel, map markers, shifts, logs, reports, documents, calendar, notes, trainings, inventory, and persistent incident folders.
- **Cyber** — internet security and traffic intelligence.
- **Admin** — protected login, runtime branding, feature toggles, API provider status, DOT/CAD configuration, CSS theme injection, uploaded logos, uploaded favicons, and NethServer 8 directory-readiness.
- **Olympus Desk** — full-width OS-style bottom workspace with a Dock launcher, app management surfaces, tile deployment controls, future TileSpace integration, file/architecture/terminal placeholders, and future draggable widgets.

## Platform goals
