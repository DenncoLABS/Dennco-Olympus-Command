#!/usr/bin/env bash
set -euo pipefail

if [ "${EUID:-$(id -u)}" -ne 0 ]; then
  echo "Run as root: sudo $0" >&2
  exit 1
fi

if command -v ollama >/dev/null 2>&1; then
  echo "Ollama is already installed: $(command -v ollama)"
else
  apt-get update
  apt-get install -y curl ca-certificates
  tmp_script="$(mktemp)"
  curl -fsSL https://ollama.com/install.sh -o "$tmp_script"
  sh "$tmp_script"
  rm -f "$tmp_script"
fi

systemctl daemon-reload || true
systemctl enable ollama.service >/dev/null 2>&1 || true
systemctl restart ollama.service >/dev/null 2>&1 || true

echo "Ollama service status:"
systemctl --no-pager --full status ollama.service || true
