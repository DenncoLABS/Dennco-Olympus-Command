#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${OLYMPUS_APP_DIR:-/opt/dennco/olympus-command}"
CAD_DIR="$APP_DIR/ops/cad/olympus-cad"
CONFIG_DIR="${OLYMPUS_CONFIG_DIR:-/etc/dennco/olympus-command}"
SETTINGS_FILE="$CONFIG_DIR/admin-runtime.json"
LOCAL_PORT="${OLYMPUS_CAD_LOCAL_PORT:-5050}"
UNIT_FILE="/etc/systemd/system/olympus-cad.service"
NODE_BIN="$(command -v node || true)"

if [ -z "$NODE_BIN" ]; then
  echo "Node.js is required for the local CAD service." >&2
  exit 1
fi

if [ ! -f "$CAD_DIR/server.mjs" ]; then
  echo "CAD service file not found: $CAD_DIR/server.mjs" >&2
  exit 1
fi

mkdir -p "$CONFIG_DIR"

cat > "$UNIT_FILE" <<UNIT
[Unit]
Description=Olympus CAD Local Service
After=network.target

[Service]
Type=simple
WorkingDirectory=$CAD_DIR
Environment=PORT=$LOCAL_PORT
Environment=OLYMPUS_CAD_DEFAULT_ORG=Olympus Command
ExecStart=$NODE_BIN $CAD_DIR/server.mjs
Restart=always
RestartSec=3
User=root

[Install]
WantedBy=multi-user.target
UNIT

node <<NODE
const fs = require('fs');
const file = '$SETTINGS_FILE';
let data = {};
try { data = JSON.parse(fs.readFileSync(file, 'utf8')); } catch {}
data.cad = {
  ...(data.cad || {}),
  mode: 'embedded-resgrid',
  resgridUrl: '/cad/',
  serviceUrl: 'http://127.0.0.1:$LOCAL_PORT/'
};
fs.writeFileSync(file, JSON.stringify(data, null, 2), { mode: 0o600 });
NODE

systemctl daemon-reload
systemctl enable --now olympus-cad.service
systemctl restart olympus-cad.service
systemctl restart dennco-olympus-command || true

echo "Olympus CAD local service is running on 127.0.0.1:$LOCAL_PORT and exposed through the Olympus /cad/ route."
