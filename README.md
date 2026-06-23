# Dennco Olympus Command

Dennco Olympus Command is a private geospatial intelligence and situational-awareness platform for live aircraft tracking, maritime tracking, GPS interference monitoring, OSINT feeds, cyber metrics, threat alerts, mirrors, extensions, and deployable command apps.

## Core modules

- **Flights** — live aircraft positions, telemetry, emergency squawks, aircraft enrichment, and route history.
- **Maritime** — AIS vessel tracking, vessel status, heading, destination, and recent position trails.
- **Monitor** — GPS interference, live threat alerts, regional monitoring widgets, and OSINT panels.
- **Cyber** — internet security and traffic intelligence.
- **Admin** — protected login, runtime branding, feature toggles, API provider status, CSS theme injection, and NethServer 8 directory-readiness.

## Platform goals

Olympus Command is designed as a Dennco-controlled command platform. It supports modular growth through:

- `extensions/` for additional intelligence modules.
- `mirrors/` for alternate deployments or mirrored command surfaces.
- `apps/` for deployable applications built from the platform.
- `platform/` for shared schemas and module standards.

## Quick install

On a Debian or Ubuntu server:

```bash
curl -fsSL https://raw.githubusercontent.com/DenncoLABS/Dennco-Olympus-Command/main/install.sh | bash
```

Then configure runtime settings:

```bash
nano /etc/dennco/olympus-command/olympus-command.env
systemctl restart dennco-olympus-command
```

Open the app:

```text
http://SERVER-IP:3001
```

## Required admin setting

Before exposing the app, set an admin user and access code in:

```bash
/etc/dennco/olympus-command/olympus-command.env
```

Restart after editing:

```bash
systemctl restart dennco-olympus-command
```

## NethServer 8 directory support

Olympus Command includes configuration placeholders for NethServer 8 Active Directory / LDAP login.

Relevant environment values are documented in:

```text
packaging/config/olympus-command.env.example
```

Full browser-editable directory login is planned as part of the admin console buildout.

## Branding and theme configuration

Runtime branding is controlled from the environment and will be moved into the admin settings database in a later pass.

Configurable values include:

- Product name
- Short name
- Logo URL
- Favicon URL
- Footer text
- CSS injector toggle
- Custom CSS

## API provider configuration

Optional provider values include:

- AISStream API key
- OpenSky username
- OpenSky password
- Map tile URL

## Development

Install dependencies:

```bash
npm run install:all
```

Run development mode:

```bash
npm run dev
```

Build production bundles:

```bash
npm run build
```

## Runtime service

The Debian package installs a systemd service:

```bash
systemctl status dennco-olympus-command
journalctl -u dennco-olympus-command -f
```

Default port:

```text
3001
```

## Repository structure

```text
client/      React frontend
server/      Express backend and data services
packaging/   Debian package and systemd service files
extensions/  Extension manifests and modules
mirrors/     Mirror deployment manifests
apps/        Deployable app manifests
platform/    Shared platform schema/docs
tools/       Platform validation/listing utilities
```

## Security notes

- Do not expose Olympus Command without setting an admin access code.
- Keep API keys server-side only.
- Do not commit production environment files.
- Put public deployments behind HTTPS and a reverse proxy.
- Use NethServer 8 directory integration for centralized access once LDAP auth is wired fully.

## License

This repository is maintained for Dennco Olympus Command. Review included license files before redistribution or external publication.
