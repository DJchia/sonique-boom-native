# Sonique Boom — Expo Android Wrapper

A thin Expo / React Native WebView wrapper around the Sonique Boom web app. This is **not** a native rewrite — it loads the existing web app from its published URL inside a full-screen WebView.

## Current Build Path (Remote URL)

The app loads Sonique Boom from a live, published URL via WebView. This is the only mode currently implemented.

### Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. The remote URL is set in [App.js](App.js):
   ```js
   const REMOTE_URL = 'https://sonique-boom.replit.app';
   ```
   Update this constant if the published URL changes.

3. Run in Expo Go:
   ```bash
   npx expo start
   ```
   Scan the QR code with Expo Go on your Android device.

### Building an APK / AAB with EAS

Build profiles are already configured in `eas.json`:

```bash
npm install -g eas-cli
eas login

# Internal test APK
npx eas build --platform android --profile preview

# Play Store app bundle
npx eas build --platform android --profile production
```

Play Store submission (`eas submit`) uses the `production` profile and expects a `google-service-account.json` file in the project root (not committed — you must supply your own).

## Features

- Full-screen WebView with dark background
- JavaScript, DOM storage, and inline media playback enabled
- Presentation Mode bridge: web app sends `PRESENTATION_MODE` messages via `postMessage`, native side toggles `expo-keep-awake` to prevent screen sleep
- Android hardware back button navigates WebView history
- Error boundary and WebView error/HTTP-error logging to console

## Project Structure

```
sonique-boom-native/
├── App.js                 # Main app — WebView + wake lock bridge
├── app.json               # Expo config
├── eas.json                # EAS Build profiles
├── package.json            # Dependencies
├── babel.config.js         # Babel config
├── assets/                 # App icons (currently placeholders — replace before store submission)
│   ├── icon.png
│   ├── splash-icon.png
│   └── adaptive-icon.png
└── scripts/
    └── bundle-web.sh        # Legacy/planned offline-bundle script — see note below
```

## Notes

- Android-first. iOS not configured but could work with minor adjustments.
- The web app detects `window.ReactNativeWebView` and sends presentation mode state changes automatically.
- The app requires an internet connection — there is currently **no offline/local-bundle mode**. `scripts/bundle-web.sh` is a legacy script from an earlier monorepo layout and is not wired into any build step; see the comment at the top of that file before touching it. A true offline bundle mode would need a local-asset loading path added to `App.js`, which does not exist yet.
