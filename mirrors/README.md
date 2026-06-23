# Mirrors

Mirrors define downstream deployments, read-only replicas, branded forks, public dashboards, regional deployments, or partner-facing variants of Olympus Command.

A mirror is not a separate app by default. It is a deployment profile that can point to the same core while changing branding, enabled modules, data sources, domains, and operational policy.

## Directory layout

```text
mirrors/
  example-mirror/
    mirror.manifest.json
    README.md
    config/
```

## Manifest contract

Every mirror must include `mirror.manifest.json`.

```json
{
  "id": "example-mirror",
  "name": "Example Mirror",
  "version": "0.1.0",
  "kind": "mirror",
  "source": "DenncoLABS/Dennco-Olympus-Command",
  "mode": "read-only",
  "domains": [],
  "enabledExtensions": [],
  "status": "draft"
}
```

## Mirror modes

- `read-only` — public or partner-facing view with no operator changes.
- `regional` — geographic deployment with local bounds, sources, and branding.
- `partner` — partner-branded deployment using selected extensions.
- `internal` — private Dennco operational mirror.

## Rules

- Keep secrets outside the repo.
- Do not hard-code production domains until DNS is ready.
- Use mirrors for deployment profiles; use apps for standalone products.
