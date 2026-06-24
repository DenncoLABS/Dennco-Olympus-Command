#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${OLYMPUS_APP_DIR:-/opt/dennco/olympus-command}"
CAD_DIR="$APP_DIR/ops/cad"
ENV_FILE="$CAD_DIR/.env.cad"
LOCAL_PORT="5050"

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker is required for the local CAD service." >&2
  exit 1
fi

if ! docker compose version >/dev/null 2>&1; then
  echo "Docker Compose v2 is required for the local CAD service." >&2
  exit 1
fi

if [ ! -f "$ENV_FILE" ]; then
  cp "$CAD_DIR/.env.cad.example" "$ENV_FILE"
fi

cd "$CAD_DIR"
docker compose --env-file "$ENV_FILE" -f docker-compose.cad.yml up -d --build

echo "CAD service listening on 127.0.0.1:$LOCAL_PORT. Olympus proxies /cad/ to it when configured."
