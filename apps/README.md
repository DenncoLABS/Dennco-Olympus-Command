# Apps

Apps are standalone products or deployable experiences built on top of Olympus Command.

Use apps when a capability needs its own routing, product identity, release cycle, domain, or deployment target. Use extensions when the capability is only a module inside the main command platform.

## Core app deployment rule

Olympus apps must follow the Desk-first deployment model:

```text
Dock = launcher
Desk = first approach workspace
Window = focused working surface
```

Apps should first open inside the Olympus Desk so the operator can understand the service, review status, choose a workflow, and decide how to approach the app.

Deep work can then open in windows, workspaces, panels, editors, maps, consoles, or detail views.

Do not build apps as disconnected pages that bypass Olympus Desk/Dock/Window behavior.

See [`docs/CORE_APP_DEPLOYMENT_MODEL.md`](../docs/CORE_APP_DEPLOYMENT_MODEL.md).

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
    "opensWindows": true,
    "earthLayer": false
  },
  "desk": {
    "dockLabel": "Example",
    "dockIcon": "example",
    "summary": "Short operator-facing purpose.",
    "primaryWorkflows": ["overview", "registry", "reports"]
  }
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

Opens in Desk with dashboard, registry, and workflow choices. Detail work opens in windows.

### Public portal app

Opens in Desk for admin/operator management. Public-facing deployment may have a separate external route.

### Mobile shell app

Opens in Desk for configuration and preview. Mobile packaging is a deployment target, not the primary Olympus operator surface.

### Integration app

Opens in Desk with connection status, sync status, source health, object registry, and guarded actions.

### Admin app

Opens in Desk with settings categories, audit, permissions, and guarded control panels.

## Rules

- Give each app a stable ID.
- Keep app-specific code inside its own folder.
- Promote shared code into `packages/` later if multiple apps need it.
- Document environment variables and deployment targets before production use.
- Add launch and Desk metadata to app manifests as apps move from draft planning into implementation.
- Launch apps from Dock into Desk first.
- Use windows/workspaces for focused app work.
- Preserve the Earth screen unless an app explicitly contributes a map layer or approved Earth workflow.
- Never launch guarded or destructive actions directly from Dock.
