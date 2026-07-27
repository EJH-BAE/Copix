#!/usr/bin/env bash
# Build official Copix macOS app (.dmg + .zip) for /Users/baejuhan
set -euo pipefail
cd "$(dirname "$0")/.."

echo "Copix macOS installer build"
echo "Working directory: $(pwd)"

if [[ "$(uname -s)" != "Darwin" ]]; then
	echo "Warning: packaging a signed Mac app is best done on macOS."
	echo "Continuing with electron-builder --mac (cross-compile may be limited)."
fi

if [[ ! -d node_modules/electron-builder ]]; then
	echo "[1/3] Installing dependencies (including electron-builder)..."
	npm install
else
	echo "[1/3] Dependencies present"
fi

echo "[2/3] Building app + packaging macOS installer..."
npm run dist:mac

echo "[3/3] Artifacts:"
find release release/staging -maxdepth 2 \( -name '*.dmg' -o -name '*.zip' -o -name 'Copix.app' \) 2>/dev/null | while read -r f; do
	size=$(du -h "$f" 2>/dev/null | awk '{print $1}')
	echo "  $f  ($size)"
done
echo "Done. Install from studio/release/Copix-*-mac-*.dmg (or open Copix.app)."
echo "Recommended home directory: /Users/baejuhan"
