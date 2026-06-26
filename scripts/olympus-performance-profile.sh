#!/usr/bin/env bash
set -euo pipefail

if [ "${EUID:-$(id -u)}" -ne 0 ]; then
  echo "Run as root: sudo $0" >&2
  exit 1
fi

mkdir -p /etc/dennco/olympus-command /etc/systemd/system/dennco-olympus-command.service.d

cat > /etc/dennco/olympus-command/performance.env <<'EOF'
NODE_OPTIONS=--max-old-space-size=4096
OLYMPUS_RENDER_PROFILE=scalable
OLYMPUS_MAP_MAX_ACTIVE_NODES=4
OLYMPUS_MAP_ANIMATION_INTERVAL_MS=650
EOF

cat > /etc/systemd/system/dennco-olympus-command.service.d/performance.conf <<'EOF'
[Service]
EnvironmentFile=-/etc/dennco/olympus-command/performance.env
LimitNOFILE=1048576
TasksMax=infinity
EOF

systemctl daemon-reload
systemctl restart dennco-olympus-command || true

echo "Olympus scalable performance profile installed."
