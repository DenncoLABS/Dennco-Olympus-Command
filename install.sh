#!/usr/bin/env bash
set -euo pipefail

REPO_OWNER="DenncoLABS"
REPO_NAME="Dennco-Olympus-Command"
PACKAGE_NAME="dennco-olympus-command"
APT_SOURCE="/etc/apt/sources.list.d/dennco-olympus-command.list"
APT_URL="https://${REPO_OWNER}.github.io/${REPO_NAME}"

if [ "${EUID:-$(id -u)}" -ne 0 ]; then
  echo "This installer needs sudo/root. Re-running with sudo..."
  exec sudo -E bash "$0" "$@"
fi

if ! command -v apt-get >/dev/null 2>&1; then
  echo "This installer currently supports Debian/Ubuntu systems with apt." >&2
  exit 1
fi

echo "Installing prerequisites..."
apt-get update
apt-get install -y ca-certificates curl gnupg

# Node.js 20+ is required by the server runtime. Use NodeSource when the OS repo is too old.
NODE_MAJOR=""
if command -v node >/dev/null 2>&1; then
  NODE_MAJOR="$(node -p "process.versions.node.split('.')[0]" 2>/dev/null || true)"
fi

if [ -z "$NODE_MAJOR" ] || [ "$NODE_MAJOR" -lt 20 ]; then
  echo "Installing Node.js 20 runtime..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi

echo "Adding Dennco Olympus Command apt source..."
echo "deb [trusted=yes arch=amd64] ${APT_URL} stable main" > "$APT_SOURCE"

apt-get update
apt-get install -y "$PACKAGE_NAME"

systemctl status dennco-olympus-command.service --no-pager || true

echo ""
echo "Dennco Olympus Command is installed."
echo "Service: systemctl status dennco-olympus-command"
echo "Config:  /etc/dennco/olympus-command/olympus-command.env"
echo "URL:     http://localhost:3001"
