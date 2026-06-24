# Dennco Olympus Command

Dennco Olympus Command is a private command-and-control style situational-awareness platform operated by Dennco Information Systems. It provides a unified operational picture for aviation, maritime, DOT traffic, public-source intelligence, cyber monitoring, weather awareness, CAD dispatch, global notifications, mirrors, extensions, and deployable command apps.

Olympus Command is maintained as a Dennco-controlled platform. It should not carry upstream demo branding, starter project icons, or third-party product identity in the deployed user interface.

## Core modules

- **Flights** — live aircraft positions, telemetry, emergency squawks, aircraft enrichment, route history, and aviation infrastructure overlays.
- **Maritime** — AIS vessel tracking, vessel status, heading, destination, recent position trails, maritime diagnostics, and vessel incident context.
- **Monitor** — GPS interference, space-domain monitoring, live threat alerts, public-source signals, regional monitoring widgets, and event panels.
- **DOT** — traffic events, public transportation camera feeds, road-level flow visualization, road/infrastructure context, and traffic camera popups.
- **CAD** — protected local dispatch surface, calls, units, personnel, map markers, logs, reports, notes, trainings, inventory, and persistent incident folders.
- **Cyber** — internet security and traffic intelligence.
- **Admin** — protected login, runtime branding, feature toggles, API provider status, DOT/CAD configuration, CSS theme injection, uploaded logos, uploaded favicons, and NethServer 8 directory-readiness.

## Platform goals

Olympus Command is designed as a Dennco operational-intelligence platform. It supports modular growth through:

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

## Runtime branding and favicon behavior

Branding is controlled by Olympus runtime settings and the Admin console. The browser favicon is not hard-coded to the starter project asset. The document favicon is resolved from:

```text
branding.faviconDataUrl
branding.faviconUrl
```

If no favicon is configured, the app uses an empty data favicon so no upstream starter icon appears. The deployed UI should use only Dennco/Olympus branding supplied through runtime settings.

Configurable values include:

- Product name
- Short name
- Logo URL
- Uploaded logo data URL
- Favicon URL
- Uploaded favicon data URL
- Footer text
- CSS injector toggle
- Custom CSS

## Data source direction

Olympus Command is being built around a civilian-safe OODA workflow:

```text
Observe → Orient → Decide → Act
```

Current and planned feeds include:

- ADS-B / aircraft position data
- AIS / maritime vessel data
- DOT traffic events
- DOT and public transportation camera feeds
- NOAA / NWS atmospheric weather layers
- GPS interference and public-source monitoring
- CAD calls, units, and incident folders
- GDELT global events
- NASA FIRMS fire and thermal events
- USGS seismic events
- Yahoo Finance market signals
- Polymarket probability signals

## DOT traffic and CCTV

The DOT module folds public transportation camera feeds and traffic-event feeds into one traffic command view. The `/api/dot/cctv` route normalizes public camera sources into Olympus camera objects, while `/api/dot/traffic` normalizes live traffic-event sources into Olympus traffic events.

The DOT page displays:

- Blue traffic-camera markers
- Orange traffic-event markers
- Road-level traffic-flow visualization when zoomed into cities/roads
- Source labels and camera/event popups

## CAD local service

The Debian package includes a protected local CAD service embedded through Olympus. It stores persistent local CAD state under:

```text
/var/lib/dennco/olympus-cad
```

Call folders are written under:

```text
/var/lib/dennco/olympus-cad/calls
```

The CAD service includes calls, personnel, units, mapping, shifts, logs, reports, documents, calendar, notes, trainings, and inventory.

## NethServer 8 directory support

Olympus Command includes configuration placeholders for NethServer 8 Active Directory / LDAP login.

Relevant environment values are documented in:

```text
packaging/config/olympus-command.env.example
```

Full browser-editable directory login is planned as part of the admin console buildout.

## API provider configuration

Optional provider values include:

- AISStream API key
- OpenSky username
- OpenSky password
- Map tile URL
- DOT traffic feed URL
- DOT camera feed URL

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
- Keep uploaded branding assets under Dennco/Olympus control.
- Do not reintroduce starter project branding, third-party favicons, or upstream demo labels into the deployed UI.

## License

This repository is maintained for Dennco Olympus Command. Review included license files before redistribution or external publication.
