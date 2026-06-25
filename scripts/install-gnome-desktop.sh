#!/usr/bin/env bash
set -euo pipefail

APP_NAME="dennco-olympus-command"
REPO_ROOT="${REPO_ROOT:-/opt/dennco/olympus-command}"
DESKTOP_SRC="$REPO_ROOT/packaging/desktop/${APP_NAME}.desktop"
AUTOSTART_SRC="$REPO_ROOT/packaging/desktop/${APP_NAME}-autostart.desktop"
DESKTOP_DEST="/usr/share/applications/${APP_NAME}.desktop"
AUTOSTART_DEST="/etc/xdg/autostart/${APP_NAME}.desktop"
ICON_DEST="/usr/share/pixmaps/${APP_NAME}.svg"

if [[ $EUID -ne 0 ]]; then
  echo "Run as root: sudo $0" >&2
  exit 1
fi

if [[ ! -f "$DESKTOP_SRC" ]]; then
  echo "Missing desktop source: $DESKTOP_SRC" >&2
  exit 1
fi

install -D -m 0644 "$DESKTOP_SRC" "$DESKTOP_DEST"

if [[ -f "$AUTOSTART_SRC" ]]; then
  install -D -m 0644 "$AUTOSTART_SRC" "$AUTOSTART_DEST"
fi

cat > "$ICON_DEST" <<'SVG'
<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
  <rect width="256" height="256" rx="46" fill="#020617"/>
  <circle cx="128" cy="128" r="84" fill="none" stroke="#22d3ee" stroke-width="8"/>
  <circle cx="128" cy="128" r="40" fill="none" stroke="#67e8f9" stroke-width="4" opacity="0.8"/>
  <path d="M128 34v188M34 128h188" stroke="#0ea5e9" stroke-width="5" opacity="0.55"/>
  <path d="M73 183 183 73" stroke="#10b981" stroke-width="6" opacity="0.75"/>
  <circle cx="128" cy="128" r="10" fill="#e0f2fe"/>
  <text x="128" y="224" text-anchor="middle" font-family="monospace" font-size="24" font-weight="700" fill="#e0f2fe">OLYMPUS</text>
</svg>
SVG

chmod 0644 "$ICON_DEST"

if command -v update-desktop-database >/dev/null 2>&1; then
  update-desktop-database /usr/share/applications || true
fi

echo "Olympus GNOME desktop integration installed."
echo "Launcher: $DESKTOP_DEST"
echo "Autostart: $AUTOSTART_DEST"
echo "Icon: $ICON_DEST"
