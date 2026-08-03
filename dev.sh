#!/usr/bin/env bash
# Start the Copix marketing site (static Vite app — no API / accounts).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT/app"
npm run dev -- --host
