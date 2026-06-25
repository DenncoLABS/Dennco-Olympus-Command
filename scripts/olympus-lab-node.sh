#!/usr/bin/env bash
set -euo pipefail

STATE_DIR="/var/lib/dennco/olympus-lab-node"
CONFIG_FILE="/etc/dennco/olympus-command/lab-node.env"

mkdir -p "$STATE_DIR" "$(dirname "$CONFIG_FILE")"

if [ ! -f "$CONFIG_FILE" ]; then
  cat > "$CONFIG_FILE" <<'EOF'
LAB_NODE_NAME=Olympus Lab Node
PVE_SOURCE_API=
PVE_LAB_API=
NS8_SOURCE_API=
NS8_LAB_API=
LAB_PREFIX=lab-
EOF
fi

case "${1:-status}" in
  init)
    echo "Olympus Lab Node initialized."
    echo "Config: $CONFIG_FILE"
    ;;
  status)
    echo "Olympus Lab Node"
    echo "State: $STATE_DIR"
    echo "Config: $CONFIG_FILE"
    test -f "$CONFIG_FILE" && cat "$CONFIG_FILE"
    ;;
  job)
    job_id="${2:-lab-$(date +%s)}"
    mkdir -p "$STATE_DIR/jobs/$job_id"
    cat > "$STATE_DIR/jobs/$job_id/status.txt" <<EOF
job=$job_id
stage=import
created=$(date -Is)
EOF
    echo "Created lab job: $job_id"
    ;;
  *)
    echo "Usage: $0 init|status|job [name]" >&2
    exit 2
    ;;
esac
