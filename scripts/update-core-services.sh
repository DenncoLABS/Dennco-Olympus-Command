#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CORE_DIR="$ROOT_DIR/ops/core"
ENV_FILE="$CORE_DIR/.env.core"
COMPOSE_FILE="$CORE_DIR/docker-compose.core.yml"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Missing $ENV_FILE"
  exit 1
fi

if docker compose version >/dev/null 2>&1; then
  COMPOSE=(docker compose)
elif command -v docker-compose >/dev/null 2>&1; then
  COMPOSE=(docker-compose)
else
  echo "Docker Compose is required."
  exit 1
fi

cd "$CORE_DIR"
"${COMPOSE[@]}" --env-file "$ENV_FILE" -f "$COMPOSE_FILE" pull
"${COMPOSE[@]}" --env-file "$ENV_FILE" -f "$COMPOSE_FILE" up -d
"${COMPOSE[@]}" --env-file "$ENV_FILE" -f "$COMPOSE_FILE" ps

echo "Olympus core services updated using pinned images from repo config."
