#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
WEB_ROOT="$(dirname "$PROJECT_ROOT")"
WEB_BUILD_DEST="$PROJECT_ROOT/android/app/src/main/assets/web-build"

echo "Building Sonique Boom web app with relative paths..."
cd "$WEB_ROOT"
npx vite build --base='./'

echo "Copying build to Android assets..."
rm -rf "$WEB_BUILD_DEST"
mkdir -p "$WEB_BUILD_DEST"
cp -r "$WEB_ROOT/dist/public/"* "$WEB_BUILD_DEST/"

echo "Done! Web build bundled at: $WEB_BUILD_DEST"
echo ""
echo "Files:"
ls -la "$WEB_BUILD_DEST/"
echo ""
echo "Now set USE_LOCAL_BUILD = true in App.js and build with EAS:"
echo "  npx eas build --platform android --profile preview"
