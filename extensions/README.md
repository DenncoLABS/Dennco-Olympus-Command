# Extensions

Extensions are optional platform modules that add routes, data sources, interface panels, background workers, or integrations without rewriting the Olympus Command core.

## Directory layout

Each extension should live in its own folder:

```text
extensions/
  example-extension/
    extension.manifest.json
    README.md
    server/
    client/
    config/
```

## Manifest contract

Every extension must include `extension.manifest.json`.

```json
{
  "id": "example-extension",
  "name": "Example Extension",
  "version": "0.1.0",
  "kind": "extension",
  "entrypoints": {
    "client": "client/index.ts",
    "server": "server/index.ts"
  },
  "permissions": ["read:map", "write:panel"],
  "status": "draft"
}
```

## Rules

- Keep custom Dennco modules here instead of modifying upstream imported code when possible.
- Use stable IDs with lowercase letters, numbers, and hyphens.
- Put external API credentials in environment variables, never in the repo.
- Document any data source, refresh interval, and required API key in the extension README.
