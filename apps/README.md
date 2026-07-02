# Apps

Apps are standalone products or deployable experiences built on top of Olympus Command.

Use apps when a capability needs its own routing, product identity, release cycle, domain, or deployment target. Use extensions when the capability is only a module inside the main command platform.

## Core app deployment rule

Olympus apps must follow the Desk and TileSpace model:

```text
Dock = app selector
Desk = app management surface and tile deployment surface
TileSpace = active tile layout area
Tile = focused app container
Widget = movable capability inside a scope
Focus Page = named tile layout for a task
```

Apps should first open inside the Olympus Desk so the operator can understand the app, review status, manage settings, collaborate, take notes, choose tools, configure integrations, run automations, and deploy tiles.

Active work then appears in TileSpace as app tiles, tile groups, widgets, focus pages, and sub-tiles.

Do not build apps as disconnected pages that bypass Olympus Desk/TileSpace behavior.

See [`docs/OLYMPUS_TILESPACE_AND_FOCUS_FRAMEWORK.md`](../docs/OLYMPUS_TILESPACE_AND_FOCUS_FRAMEWORK.md) and [`docs/CORE_APP_DEPLOYMENT_MODEL.md`](../docs/CORE_APP_DEPLOYMENT_MODEL.md).

## Directory layout

```text
apps/
  example-app/
    app.manifest.json
    README.md
    client/
    server/
    config/
```

## Manifest contract

Every app must include `app.manifest.json`.

```json
{
  "id": "example-app",
  "name": "Example App",
  "version": "0.1.0",
  "kind": "app",
  "entrypoints": {
    "client": "client/index.tsx",
    "server": "server/index.ts"
  },
  "dependsOn": [],
  "status": "draft",
  "launch": {
    "surface": "desk",
    "approachRoute": "/apps/example-app",
    "defaultWorkspace": "overview",
    "opensTiles": true,
    "earthLayer": false
  },
  "desk": {
    "dockLabel": "Example",
    "dockIcon": "example",
    "summary": "Short operator-facing purpose.",
    "primaryWorkflows": ["overview", "registry", "reports"],
    "sections": ["overview", "tools", "widgets", "notes", "automations", "integrations", "settings"]
  },
  "tiles": [
    {
      "id": "overview-tile",
      "name": "Overview Tile",
      "scope": "app",
      "defaultLayout": "single"
    }
  ],
  "widgets": [
    {
      "id": "status-widget",
      "name": "Status Widget",
      "scope": "app"
    }
  ]
}
```

## App types

- `dashboard` — operator-facing dashboard.
- `public-portal` — public or customer-facing web app.
- `mobile-shell` — wrapper target for future mobile packaging.
- `integration` — app built around a third-party service or API.
- `admin` — configuration, audit, and control plane UI.

## App opening expectations

### Dashboard app

Opens in Desk with dashboard, registry, tools, widget catalog, tile deployment, notes, and workflow choices. Active work opens in TileSpace.

### Public portal app

Opens in Desk for admin/operator management. Public-facing deployment may have a separate external route.

### Mobile shell app

Opens in Desk for configuration and preview. Mobile packaging is a deployment target, not the primary Olympus operator surface.

### Integration app

Opens in Desk with connection status, sync status, source health, object registry, widget catalog, and guarded controls.

### Admin app

Opens in Desk with settings categories, audit, permissions, and control panels.

## Required app Desk sections

Every app Desk should eventually include:

```text
App Overview
Status / Health
Tools / Sub-apps
Deploy App Tile
Tile Layouts
Widget Manager
Global App Widgets
Sub-App Widgets
Collaboration
Notes
Automations
Integrations
Related Apps
Core App Settings
Permissions / Guardrails
Activity
```

## Rules

- Give each app a stable ID.
- Keep app-specific code inside its own folder.
- Promote shared code into `packages/` later if multiple apps need it.
- Document environment variables and deployment targets before production use.
- Add launch, Desk, tile, and widget metadata to app manifests as apps move from draft planning into implementation.
- Launch apps from Dock into Desk first.
- Use TileSpace for active app tiles, widgets, focus pages, and tile groups.
- Preserve the Earth screen unless an app explicitly contributes a map layer or approved Earth workflow.
- Do not use ordinary window language as the primary app model. Use TileSpace, tiles, widgets, and focus pages.
