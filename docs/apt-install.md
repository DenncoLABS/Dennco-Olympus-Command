# Apt Installation

Dennco Olympus Command can be installed on Debian/Ubuntu with one command once the package repository has been published by GitHub Actions.

This setup does not require GitHub Pages. The installer reads the generated APT repository directly from the `gh-pages` branch through `raw.githubusercontent.com`.

## One-command install

```bash
curl -fsSL https://raw.githubusercontent.com/DenncoLABS/Dennco-Olympus-Command/main/install.sh | bash
```

The installer will:

1. Install apt prerequisites.
2. Install Node.js 20 if the system does not already have Node.js 20 or newer.
3. Add the Olympus Command apt source.
4. Run `apt update`.
5. Install `dennco-olympus-command`.
6. Enable and start the systemd service.

## Manual install

```bash
sudo apt update
sudo apt install -y ca-certificates curl gnupg
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo bash -
sudo apt install -y nodejs

echo 'deb [trusted=yes arch=amd64] https://raw.githubusercontent.com/DenncoLABS/Dennco-Olympus-Command/gh-pages stable main' | sudo tee /etc/apt/sources.list.d/dennco-olympus-command.list
sudo apt update
sudo apt install -y dennco-olympus-command
```

## Service commands

```bash
sudo systemctl status dennco-olympus-command
sudo systemctl restart dennco-olympus-command
sudo journalctl -u dennco-olympus-command -f
```

## Configuration

Runtime configuration lives here:

```text
/etc/dennco/olympus-command/olympus-command.env
```

Default port:

```text
http://localhost:3001
```

## Updates

After the apt repository is published, updates are normal Debian/Ubuntu updates:

```bash
sudo apt update
sudo apt upgrade
```

## Private repository note

If this repository remains private, unauthenticated servers may not be able to read `raw.githubusercontent.com` URLs. For unattended public installs, make the package repository public or move the APT repo files to a public package host.
