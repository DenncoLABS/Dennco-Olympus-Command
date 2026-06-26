#!/usr/bin/env bash
set -euo pipefail

if [ "${EUID:-$(id -u)}" -ne 0 ]; then
  echo "Run as root: sudo $0" >&2
  exit 1
fi

mkdir -p /var/cache/dennco/olympus-command/map-assets
mkdir -p /etc/dennco/olympus-command

cat > /etc/dennco/olympus-command/map-cache.env <<'EOF'
MAP_CACHE_PROFILE=production
MAP_CLIENT_SESSION_CACHE=enabled
MAP_TILE_CACHE_SIZE=8000
MAP_RENDER_STABILITY=enabled
EOF

chmod 0755 /var/cache/dennco /var/cache/dennco/olympus-command /var/cache/dennco/olympus-command/map-assets

echo "Map cache profile installed."
