#!/usr/bin/env bash
set -euo pipefail

PACKAGE_NAME="dennco-olympus-command"
VERSION="${VERSION:-$(node -p 'require("./package.json").version')}"
ARCH="${ARCH:-amd64}"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BUILD_DIR="$ROOT_DIR/dist/deb"
PKG_DIR="$BUILD_DIR/${PACKAGE_NAME}_${VERSION}_${ARCH}"
APP_DIR="$PKG_DIR/opt/dennco/olympus-command"
SHARE_DIR="$PKG_DIR/usr/share/$PACKAGE_NAME"
SYSTEMD_DIR="$PKG_DIR/lib/systemd/system"
DESKTOP_DIR="$PKG_DIR/usr/share/applications"
AUTOSTART_DIR="$PKG_DIR/etc/xdg/autostart"
PIXMAP_DIR="$PKG_DIR/usr/share/pixmaps"
BIN_DIR="$PKG_DIR/usr/bin"
DEBIAN_DIR="$PKG_DIR/DEBIAN"

export CI=true
export HUSKY=0

rm -rf "$BUILD_DIR"
mkdir -p "$APP_DIR" "$SHARE_DIR" "$SYSTEMD_DIR" "$DESKTOP_DIR" "$AUTOSTART_DIR" "$PIXMAP_DIR" "$BIN_DIR" "$DEBIAN_DIR"

cd "$ROOT_DIR"

npm install --include=dev --no-audit --no-fund --foreground-scripts=false
npm run build
npm prune --omit=dev --no-audit --no-fund || true

cp package.json "$APP_DIR/package.json"
cp -R node_modules "$APP_DIR/node_modules"
cp -R server/dist "$APP_DIR/dist"
cp -R client/dist "$APP_DIR/public"

if [ -f server/src/news_feeds.json ]; then cp server/src/news_feeds.json "$APP_DIR/news_feeds.json"; fi
if [ -d server/src/Data ]; then mkdir -p "$APP_DIR/Data"; cp -R server/src/Data/. "$APP_DIR/Data/"; fi
if [ -d ops/core ] || [ -d ops/cad ]; then mkdir -p "$APP_DIR/ops"; [ -d ops/core ] && cp -R ops/core "$APP_DIR/ops/core"; [ -d ops/cad ] && cp -R ops/cad "$APP_DIR/ops/cad"; fi

if [ -d scripts ]; then
  mkdir -p "$APP_DIR/scripts"
  for script in install-core-services.sh update-core-services.sh install-cad-services.sh install-gnome-desktop.sh install-ollama-ai.sh install-infrastructure-apps.sh install-system-browser.sh olympus-performance-profile.sh map-cache-profile.sh olympus-lab-node.sh olympus-proxmox-lab.sh; do
    [ -f "scripts/$script" ] && cp "scripts/$script" "$APP_DIR/scripts/$script"
  done
fi

if [ -d packaging/desktop ]; then
  [ -f packaging/desktop/olympus-command.desktop ] && cp packaging/desktop/olympus-command.desktop "$DESKTOP_DIR/olympus-command.desktop"
  [ -f packaging/desktop/olympus-command-autostart.desktop ] && cp packaging/desktop/olympus-command-autostart.desktop "$AUTOSTART_DIR/olympus-command.desktop"
  [ -f packaging/desktop/dennco-olympus-command.svg ] && cp packaging/desktop/dennco-olympus-command.svg "$PIXMAP_DIR/dennco-olympus-command.svg"
fi

if [ -d packaging/bin ]; then
  find packaging/bin -maxdepth 1 -type f -exec cp {} "$BIN_DIR/" \;
fi

cp packaging/config/olympus-command.env.example "$SHARE_DIR/olympus-command.env.example"
cp packaging/systemd/dennco-olympus-command.service "$SYSTEMD_DIR/dennco-olympus-command.service"

sed "s/__VERSION__/$VERSION/g" packaging/debian/control.template > "$DEBIAN_DIR/control"
cp packaging/debian/postinst "$DEBIAN_DIR/postinst"
cp packaging/debian/prerm "$DEBIAN_DIR/prerm"
cp packaging/debian/postrm "$DEBIAN_DIR/postrm"
chmod 0755 "$DEBIAN_DIR/postinst" "$DEBIAN_DIR/prerm" "$DEBIAN_DIR/postrm"

find "$PKG_DIR" -type d -exec chmod 0755 {} \;
find "$PKG_DIR" -type f -exec chmod 0644 {} \;
[ -d "$APP_DIR/scripts" ] && find "$APP_DIR/scripts" -type f -name '*.sh' -exec chmod 0755 {} \;
[ -d "$BIN_DIR" ] && find "$BIN_DIR" -type f -exec chmod 0755 {} \;
chmod 0755 "$DEBIAN_DIR/postinst" "$DEBIAN_DIR/prerm" "$DEBIAN_DIR/postrm"

dpkg-deb --build --root-owner-group "$PKG_DIR" "$BUILD_DIR/${PACKAGE_NAME}_${VERSION}_${ARCH}.deb"
echo "Built $BUILD_DIR/${PACKAGE_NAME}_${VERSION}_${ARCH}.deb"
