# Apps

Apps are standalone products or deployable experiences built on top of Olympus Command.

Use apps when a capability needs its own routing, product identity, release cycle, domain, or deployment target. Use extensions when the capability is only a module inside the main command platform.

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
  "status": "draft"
}
```

## App types

- `dashboard` — operator-facing dashboard.
- `public-portal` — public or customer-facing web app.
- `mobile-shell` — wrapper target for future mobile packaging.
- `integration` — app built around a third-party service or API.
- `admin` — configuration, audit, and control plane UI.

## Rules

- Give each app a stable ID.
- Keep app-specific code inside its own folder.
- Promote shared code into `packages/` later if multiple apps need it.
- Document environment variables and deployment targets before production use.
