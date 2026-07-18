#!/bin/bash
#
# LEGACY / NOT CURRENTLY WIRED UP.
# This script assumes sonique-boom-native lives as a subfolder inside the
# main Sonique Boom web-app repo (the old Replit/monorepo layout), so it
# can `cd` up one directory and find the web app's vite project there.
# Now that sonique-boom-native is its own standalone repo, that parent
# directory does not contain the web app, and running this as-is will
# fail or do nothing useful.
#
# No npm script or EAS build currently calls this file. Do not run it
# without first fixing WEB_ROOT to point at wherever you've checked out
# the Sonique Boom web app, and do not treat it as a working Phase 2
# "offline bundle" pipeline until App.js actually has a local-bundle
# loading path (it does not, as of this comment).
#
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
