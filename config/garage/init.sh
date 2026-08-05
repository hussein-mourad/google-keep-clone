#!/usr/bin/env bash
set -euo pipefail

BUCKET="keep-clone"
KEY_NAME="dev-key"

DOCKER_COMPOSE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"

garage_exec() {
  docker compose -f "$DOCKER_COMPOSE_DIR/compose.yml" exec -T s3 /garage -c /etc/garage.toml "$@"
}

echo "Waiting for Garage to be ready..."
NODE_ID=""
for i in $(seq 1 10); do
  STATUS=$(garage_exec status 2>/dev/null) || true
  NODE_ID=$(echo "$STATUS" | grep -oP '^[0-9a-f]{16}(?=\s)' | head -1) || true
  if [ -n "$NODE_ID" ]; then
    break
  fi
  sleep 2
done

garage_exec layout assign "$NODE_ID" --zone dc1 --capacity 1G 2>/dev/null || true
garage_exec layout apply --version 1 2>/dev/null || true

KEY_OUTPUT=$(garage_exec key create "$KEY_NAME" 2>&1 || true)
echo "$KEY_OUTPUT"

KEY_ID=$(echo "$KEY_OUTPUT" | grep -oP 'Key ID:\s+\K\S+')
SECRET_KEY=$(echo "$KEY_OUTPUT" | grep -oP 'Secret key:\s+\K\S+')

if [ -z "$KEY_ID" ] || [ -z "$SECRET_KEY" ]; then
  KEY_OUTPUT=$(garage_exec key info "$KEY_NAME" 2>&1)
  echo "$KEY_OUTPUT"
  KEY_ID=$(echo "$KEY_OUTPUT" | grep -oP 'Key ID:\s+\K\S+')
  SECRET_KEY=$(echo "$KEY_OUTPUT" | grep -oP 'Secret key:\s+\K\S+')
fi

garage_exec bucket create "$BUCKET" 2>/dev/null || true

garage_exec bucket allow \
  "$BUCKET" \
  --key "$KEY_ID" \
  --read --write --owner

cat <<EOF

Garage initialized!

Add these to your apps/backend/.env:

S3_ENDPOINT=http://localhost:3900
S3_REGION=garage
S3_ACCESS_KEY_ID=$KEY_ID
S3_SECRET_ACCESS_KEY=$SECRET_KEY
S3_BUCKET=$BUCKET
EOF
