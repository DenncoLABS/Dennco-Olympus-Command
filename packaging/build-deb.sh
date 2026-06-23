#!/usr/bin/env bash
set -euo pipefail

PACKAGE_NAME="dennco-olympus-command"
VERSION="${VERSION:-$(node -p "require('./package.json').version")}" 
ARCH="${ARCH:-amd64}"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BUILD_DIR="$ROOT_DIR/dist/deb"
PKG_DIR="$BUILD_DIR/${PACKAGE_NAME}_${VERSION}_${ARCH}"
APP_DIR="$PKG_DIR/opt/dennco/olympus-command"
SHARE_DIR="$PKG_DIR/usr/share/$PACKAGE_NAME"
SYSTEMD_DIR="$PKG_DIR/lib/systemd/system"
DEBIAN_DIR="$PKG_DIR/DEBIAN"

rm -rf "$BUILD_DIR"
mkdir -p "$APP_DIR" "$SHARE_DIR" "$SYSTEMD_DIR" "$DEBIAN_DIR"

cd "$ROOT_DIR"

echo "Installing dependencies..."
npm install --include=dev --no-audit --no-fund

echo "Building client and server..."
npm run build

echo "Pruning development dependencies..."
npm prune --omit=dev --workspaces --include-workspace-root --no-audit --no-fund || npm prune --omit=dev --no-audit --no-fund

echo "Assembling package filesystem..."
cp package.json "$APP_DIR/package.json"
cp -R node_modules "$APP_DIR/node_modules"
cp -R server/dist "$APP_DIR/dist"
cp -R client/dist "$APP_DIR/public"

if [ -f server/src/news_feeds.json ]; then
  cp server/src/news_feeds.json "$APP_DIR/news_feeds.json"
fi

if [ -d server/src/Data ]; then
  mkdir -p "$APP_DIR/Data"
  cp -R server/src/Data/. "$APP_DIR/Data/"
fi

cp packaging/config/olympus-command.env.example "$SHARE_DIR/olympus-command.env.example"
cp packaging/systemd/dennco-olympus-command.service "$SYSTEMD_DIR/dennco-olympus-command.service"

sed "s/__VERSION__/$VERSION/g" packaging/debian/control.template > "$DEBIAN_DIR/control"
cp packaging/debian/postinst "$DEBIAN_DIR/postinst"
cp packaging/debian/prerm "$DEBIAN_DIR/prerm"
cp packaging/debian/postrm "$DEBIAN_DIR/postrm"
chmod 0755 "$DEBIAN_DIR/postinst" "$DEBIAN_DIR/prerm" "$DEBIAN_DIR/postrm"

find "$PKG_DIR" -type d -exec chmod 0755 {} \;

echo "Building .deb..."
dpkg-deb --build --root-owner-group "$PKG_DIR" "$BUILD_DIR/${PACKAGE_NAME}_${VERSION}_${ARCH}.deb"

echo "Built $BUILD_DIR/${PACKAGE_NAME}_${VERSION}_${ARCH}.deb"
