#!/usr/bin/env bash
set -euo pipefail

GALEN_MODEL_NAME="Galen"
GALEN_BASE_MODEL="${GALEN_BASE_MODEL:-llama3}"
GALEN_MODEL_DIR="/opt/dennco/olympus-command/ai/galen"
GALEN_MODEL_FILE="$GALEN_MODEL_DIR/Modelfile"

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

mkdir -p "$GALEN_MODEL_DIR"
cat > "$GALEN_MODEL_FILE" <<'EOF'
FROM llama3
SYSTEM "You are Galen, Dennco Olympus Command's local AI model. Identify yourself as Galen."
PARAMETER temperature 0.35
EOF

if command -v ollama >/dev/null 2>&1; then
  sleep 2
  ollama pull "$GALEN_BASE_MODEL" || true
  sed -i "s/^FROM .*/FROM $GALEN_BASE_MODEL/" "$GALEN_MODEL_FILE"
  ollama create "$GALEN_MODEL_NAME" -f "$GALEN_MODEL_FILE" || true
fi

mkdir -p /etc/dennco/olympus-command
cat > /etc/dennco/olympus-command/ai.env <<EOF
OLYMPUS_AI_MODEL_NAME=$GALEN_MODEL_NAME
OLYMPUS_AI_PROVIDER=ollama
OLYMPUS_AI_ENDPOINT=http://127.0.0.1:11434
EOF

echo "Galen AI model is hard-coded as the Olympus Ollama model."
echo "Ollama service status:"
systemctl --no-pager --full status ollama.service || true
