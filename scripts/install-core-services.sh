#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CORE_DIR="$ROOT_DIR/ops/core"
ENV_FILE="$CORE_DIR/.env.core"
COMPOSE_FILE="$CORE_DIR/docker-compose.core.yml"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Missing $ENV_FILE"
  echo "Copy $CORE_DIR/.env.core.example to $ENV_FILE and set strong passwords first."
  exit 1
fi

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker is required for Olympus core services. Install Docker before running this script."
  exit 1
fi

if docker compose version >/dev/null 2>&1; then
  COMPOSE=(docker compose)
elif command -v docker-compose >/dev/null 2>&1; then
  COMPOSE=(docker-compose)
else
  echo "Docker Compose is required. Install the docker compose plugin or docker-compose."
  exit 1
fi

cd "$CORE_DIR"
"${COMPOSE[@]}" --env-file "$ENV_FILE" -f "$COMPOSE_FILE" pull
"${COMPOSE[@]}" --env-file "$ENV_FILE" -f "$COMPOSE_FILE" up -d
"${COMPOSE[@]}" --env-file "$ENV_FILE" -f "$COMPOSE_FILE" ps

echo "Olympus core services started."
echo "PostgreSQL/PostGIS/Timescale/pgvector: ${OLYMPUS_POSTGRES_PORT:-5432}"
echo "Redis: ${OLYMPUS_REDIS_PORT:-6379}"
echo "MinIO API: ${OLYMPUS_MINIO_API_PORT:-9000}"
echo "MinIO Console: ${OLYMPUS_MINIO_CONSOLE_PORT:-9001}"
