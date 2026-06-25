#!/usr/bin/env bash
set -euo pipefail

TARGET_DIR="${OLYMPUS_NASA_CODE_APPS_DIR:-/var/lib/dennco/olympus-command/apps/nasa-code}"
CATALOG_URL="https://raw.githubusercontent.com/nasa/Open-Source-Catalog/master/catalog.json"

if [ "${EUID:-$(id -u)}" -ne 0 ]; then
  echo "Run as root: sudo $0" >&2
  exit 1
fi

apt-get update
apt-get install -y curl ca-certificates
mkdir -p "$TARGET_DIR"
curl -fsSL "$CATALOG_URL" -o "$TARGET_DIR/catalog.json"
chown -R olympus:olympus "$TARGET_DIR" 2>/dev/null || true
chmod -R u+rwX,go+rX "$TARGET_DIR"

echo "NASA Code catalog installed into $TARGET_DIR"
