# Deployment and Publishing Workflow

This document explains how Olympus Command is published as a Debian package and installed on an Olympus server.

## Package identity

- Debian package: `dennco-olympus-command`
- Root package version: `1.0.5`
- Published package version format: `1.0.5-<github-run-number>`
- Main service: `dennco-olympus-command`
- Main app port: `3001`
- CAD service: `olympus-cad.service`
- CAD port: `5050`

## GitHub workflow

The apt publishing workflow is:

```text
.github/workflows/publish-apt.yml
```

It can be started manually from GitHub Actions:

```text
Actions → Publish Apt Package → Run workflow
Branch: main
Commit/SHA: leave blank
```

Leave the commit/SHA field blank unless intentionally building an older commit.

The workflow also watches selected paths such as:

- `client/**`
- `server/**`
- `package.json`
- `package-lock.json`
- `packaging/**`
- `install.sh`
- `.github/workflows/publish-apt.yml`

If a trigger commit does not start a workflow automatically, use manual `workflow_dispatch`.

## Server install / update

On the server:

```bash
apt clean
rm -rf /var/lib/apt/lists/*
apt update
apt install --reinstall dennco-olympus-command -y
systemctl restart dennco-olympus-command
dpkg -l | grep dennco-olympus-command
```

Check app status:

```bash
systemctl status dennco-olympus-command --no-pager
journalctl -u dennco-olympus-command -n 100 --no-pager
```

Check CAD status:

```bash
systemctl status olympus-cad --no-pager
curl -s http://127.0.0.1:5050/health
ls -l /var/lib/dennco/olympus-cad/
```

## GPG key refresh

If apt reports a missing signing key:

```bash
curl -fsSL https://raw.githubusercontent.com/DenncoLABS/Dennco-Olympus-Command/gh-pages/dennco-olympus-command-archive-keyring.gpg \
  -o /usr/share/keyrings/dennco-olympus-command-archive-keyring.gpg
chmod 644 /usr/share/keyrings/dennco-olympus-command-archive-keyring.gpg
apt clean
rm -rf /var/lib/apt/lists/*
apt update
```

## Confirm newest package

```bash
apt-cache policy dennco-olympus-command
```

If the newest candidate is not higher than the installed version, a newer package has not been published to the apt repository yet.

## When workflows fail

If a workflow fails:

1. Open GitHub Actions.
2. Select `Publish Apt Package`.
3. Open the latest failed run.
4. Copy the first red error block from the failing step.
5. Patch the exact file mentioned by the failure.

Avoid guessing when logs are available.

## Known build-sensitive areas

- `client/src/modules/weather/NoaaWeatherRadarLayer.tsx` uses `useMilitaryBases` and must keep its import.
- `client/src/ui/layout/OlympusDesk.tsx` is part of the global shell and can break all pages if it fails to compile.
- `client/src/modules/monitor/MonitorPage.tsx` should no longer include the old bottom resize dashboard strip.
- `client/src/modules/maritime/MaritimePage.tsx` should export the stable Maritime page unless experimental pages are fully validated.

## Recommended release rhythm

For large UI changes:

1. Commit the actual code.
2. Commit one small watched-path trigger note under `packaging/` if needed.
3. Run `Publish Apt Package` manually on `main` when auto-triggering does not occur.
4. Install only after the workflow passes.
5. Confirm version with `dpkg -l | grep dennco-olympus-command`.
6. Hard-refresh the browser.
