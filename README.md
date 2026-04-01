# Sonique Boom — Expo Android Wrapper

WebView wrapper for Sonique Boom audio player. Two build modes:

## Phase 1 — Fast Test (Remote URL)

Loads Sonique Boom from a published Replit URL via WebView.

### Setup

1. Install dependencies:
   ```bash
   cd sonique-boom-native
   npm install
   ```

2. Update `App.js` line 7:
   ```js
   const REMOTE_URL = 'https://YOUR-REPLIT-APP.replit.app';
   ```
   Replace with your actual published Replit URL.

3. Ensure `USE_LOCAL_BUILD` is `false` (default).

4. Run in Expo Go:
   ```bash
   npx expo start
   ```
   Scan the QR code with Expo Go on your Android device.

---

## Phase 2 — Store-Ready (Bundled Offline)

Bundles the web build locally inside the APK. No internet required.

### Setup

1. From the main Sonique Boom project, build static files:
   ```bash
   npx vite build --base='./'
   ```

2. Copy the build output into the Android assets:
   ```bash
   cp -r dist/public/* sonique-boom-native/android/app/src/main/assets/web-build/
   ```

3. In `App.js`, set:
   ```js
   const USE_LOCAL_BUILD = true;
   ```

4. Build with EAS:
   ```bash
   cd sonique-boom-native
   npx eas build --platform android --profile preview
   ```
   This produces an APK you can install directly.

   For a Play Store bundle:
   ```bash
   npx eas build --platform android --profile production
   ```

### First-time EAS setup
```bash
npm install -g eas-cli
eas login
eas build:configure
```

---

## Features

- Full-screen WebView with dark background
- JavaScript, DOM storage, and inline media playback enabled
- Presentation Mode bridge: web app sends `PRESENTATION_MODE` messages via `postMessage`, native side toggles `expo-keep-awake` to prevent screen sleep
- Android WAKE_LOCK permission included

## Project Structure

```
sonique-boom-native/
├── App.js                 # Main app — WebView + wake lock bridge
├── app.json               # Expo config
├── eas.json               # EAS Build profiles
├── package.json           # Dependencies
├── babel.config.js        # Babel config
├── assets/                # App icons (add your own)
│   ├── icon.png
│   ├── splash-icon.png
│   └── adaptive-icon.png
└── android/
    └── app/src/main/assets/
        └── web-build/     # Bundled web app (Phase 2)
            ├── index.html
            └── assets/
```

## Notes

- Android-first. iOS not configured but could work with minor adjustments.
- The web app detects `window.ReactNativeWebView` and sends presentation mode state changes automatically.
- Fonts load from Google Fonts CDN (requires internet even in offline mode for first load — consider self-hosting fonts for fully offline use).
