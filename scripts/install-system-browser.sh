#!/usr/bin/env bash
set -euo pipefail

if [ "${EUID:-$(id -u)}" -ne 0 ]; then
  echo "Run as root: sudo $0" >&2
  exit 1
fi

apt-get update
apt-get install -y chromium

mkdir -p /etc/dennco/olympus-command
cat > /etc/dennco/olympus-command/system-browser.env <<'EOF'
OLYMPUS_SYSTEM_BROWSER=/usr/bin/chromium
EOF

echo "Olympus internal system browser installed."
echo "Browser: /usr/bin/chromium"
