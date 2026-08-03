#!/usr/bin/env bash
# Start Copix API + Vite app for local development (public_site).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

echo "==> Freeing :8787 and starting API"
(cd api && npm run free-port && npm run dev) &
API_PID=$!

cleanup() {
  kill "$API_PID" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

# Wait until health responds
for i in $(seq 1 40); do
  if curl -sf http://127.0.0.1:8787/health >/dev/null 2>&1; then
    echo "==> API ready"
    break
  fi
  sleep 0.25
  if [[ "$i" -eq 40 ]]; then
    echo "API failed to start on :8787" >&2
    exit 1
  fi
done

echo "==> Starting Vite (proxies /auth /agent /health → :8787)"
cd app
npm run dev -- --host
