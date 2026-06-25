#!/usr/bin/env bash
set -euo pipefail

LAB_ROOT="${OLYMPUS_PVE_LAB_ROOT:-/var/lib/dennco/olympus-lab-node/proxmox}"
REGISTRY="$LAB_ROOT/registry"
OBJECTS="$LAB_ROOT/objects"
OVERLAYS="$LAB_ROOT/overlays"
LOGS="$LAB_ROOT/logs"

mkdir -p "$REGISTRY" "$OBJECTS" "$OVERLAYS" "$LOGS"

usage() {
  cat <<'EOF'
Usage: olympus-proxmox-lab.sh <command> [args]

Commands:
  init
  import-qm <vmid> <name>
  import-ct <ctid> <name>
  edit <type> <id> <key> <value>
  show <type> <id>
  list
  mark-ready <type> <id>
  export-plan <type> <id>

This is an Olympus-owned lab simulator. It does not edit live Proxmox data.
EOF
}

record() {
  printf '%s %s\n' "$(date -Is)" "$*" >> "$LOGS/activity.log"
}

obj_file() {
  local type="$1"
  local id="$2"
  echo "$OBJECTS/${type}-${id}.env"
}

init_lab() {
  cat > "$LAB_ROOT/README.txt" <<'EOF'
Olympus Proxmox Lab Simulator

Editable lab state lives here. Production Proxmox VM and container data is not edited directly.
Use import-qm/import-ct to create simulated lab objects, edit to change lab metadata, and export-plan to review a promotion plan.
EOF
  record init
  echo "Initialized Olympus Proxmox lab simulator at $LAB_ROOT"
}

import_object() {
  local type="$1"
  local id="$2"
  local name="$3"
  local file
  file="$(obj_file "$type" "$id")"
  if [ -f "$file" ]; then
    echo "Object already exists: $type $id" >&2
    exit 1
  fi
  mkdir -p "$OVERLAYS/${type}-${id}/rootfs" "$OVERLAYS/${type}-${id}/config"
  cat > "$file" <<EOF
TYPE=$type
ID=$id
NAME=$name
STAGE=imported
SOURCE=production-copy
OVERLAY=$OVERLAYS/${type}-${id}
CREATED=$(date -Is)
UPDATED=$(date -Is)
READY=false
EOF
  echo "${type}-${id}" >> "$REGISTRY/objects.list"
  record import "$type" "$id" "$name"
  echo "Imported simulated $type $id as $name"
}

edit_object() {
  local type="$1"
  local id="$2"
  local key="$3"
  local value="$4"
  local file
  file="$(obj_file "$type" "$id")"
  test -f "$file" || { echo "Missing object: $type $id" >&2; exit 1; }
  if grep -q "^${key}=" "$file"; then
    sed -i "s|^${key}=.*|${key}=${value}|" "$file"
  else
    echo "${key}=${value}" >> "$file"
  fi
  sed -i "s|^UPDATED=.*|UPDATED=$(date -Is)|" "$file"
  record edit "$type" "$id" "$key=$value"
  echo "Edited $type $id: $key=$value"
}

show_object() {
  local file
  file="$(obj_file "$1" "$2")"
  test -f "$file" || { echo "Missing object: $1 $2" >&2; exit 1; }
  cat "$file"
}

list_objects() {
  find "$OBJECTS" -maxdepth 1 -type f -name '*.env' -print | sort | while read -r file; do
    echo "--- $(basename "$file" .env)"
    grep -E '^(TYPE|ID|NAME|STAGE|READY)=' "$file" || true
  done
}

mark_ready() {
  edit_object "$1" "$2" STAGE ready
  edit_object "$1" "$2" READY true
}

export_plan() {
  local type="$1"
  local id="$2"
  local file
  file="$(obj_file "$type" "$id")"
  test -f "$file" || { echo "Missing object: $type $id" >&2; exit 1; }
  source "$file"
  cat <<EOF
Olympus promotion plan

Object: $TYPE $ID
Name: $NAME
Stage: $STAGE
Overlay: $OVERLAY

Production action is intentionally manual-gated.
Review overlay/config changes, create a final snapshot, then migrate with approved Proxmox or NS8 tooling.
EOF
  record export-plan "$type" "$id"
}

case "${1:-}" in
  init) init_lab ;;
  import-qm) shift; test $# -eq 2 || { usage; exit 2; }; import_object qm "$1" "$2" ;;
  import-ct) shift; test $# -eq 2 || { usage; exit 2; }; import_object ct "$1" "$2" ;;
  edit) shift; test $# -eq 4 || { usage; exit 2; }; edit_object "$1" "$2" "$3" "$4" ;;
  show) shift; test $# -eq 2 || { usage; exit 2; }; show_object "$1" "$2" ;;
  list) list_objects ;;
  mark-ready) shift; test $# -eq 2 || { usage; exit 2; }; mark_ready "$1" "$2" ;;
  export-plan) shift; test $# -eq 2 || { usage; exit 2; }; export_plan "$1" "$2" ;;
  *) usage; exit 2 ;;
esac
