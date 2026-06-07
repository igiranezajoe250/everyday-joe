# Poketee — Native App Handoff

This package wraps the Poketee web app as a real **iOS** and **Android** app using
[Capacitor](https://capacitorjs.com). The web app is fully self-contained and runs
**offline** — no server or internet connection required at runtime. All data is
mock data baked into the app (no backend yet).

> You need a developer with **Xcode** (for iOS) and/or **Android Studio** (for Android)
> to complete the store builds. Everything below is the exact sequence.

---

## What's in this folder

```
handoff/
├── www/                     ← the built, offline web app (this is what ships)
│   ├── index.html           ← single self-contained file (React, styles, screens, data)
│   ├── manifest.webmanifest
│   ├── service-worker.js
│   └── icons/
├── resources/               ← source art for icon + splash generation
│   ├── icon.png             ← 1024×1024 app icon
│   ├── splash.png           ← 2732×2732 splash (dark)
│   └── splash-dark.png
├── capacitor.config.json    ← app id, name, splash, status bar, push config
├── package.json             ← Capacitor deps + helper scripts
├── start.command            ← double-click to run the app locally (macOS)
├── start.bat                ← double-click to run the app locally (Windows)
├── TESTING.md               ← how to test: local, on your phone, TestFlight, Play
└── README.md                ← you are here
```

> **Just want to see it run?** Double-click `start.command` (macOS) or `start.bat`
> (Windows) — no setup. Full testing instructions are in **`TESTING.md`**.

The app id is **`rw.poketee.app`** and the display name is **Poketee**. Change both in
`capacitor.config.json` (and at project creation) if you need different ones.

---

## Prerequisites

- **Node.js 18+** and npm
- **iOS:** macOS + Xcode 15+, CocoaPods (`sudo gem install cocoapods`), an Apple Developer account
- **Android:** Android Studio (latest), JDK 17

---

## 1. Create the Capacitor project

From an empty folder you control:

```bash
mkdir poketee-app && cd poketee-app

# Copy the contents of this handoff/ folder into here, so you have:
#   ./www  ./resources  ./capacitor.config.json  ./package.json

npm install
npx cap init "Poketee" "rw.poketee.app" --web-dir=www
# (keep the provided capacitor.config.json — it has splash/status-bar/push set up)
```

## 2. Add the native platforms

```bash
npm run sync          # or: npx cap sync
npx cap add ios
npx cap add android
```

## 3. Generate icons & splash screens

The `resources/` art drives every required size automatically:

```bash
npm run assets        # runs @capacitor/assets against resources/
npx cap sync
```

This produces all iOS/Android icon densities, the adaptive Android icon, and the
launch/splash screens (dark background `#0A0A0A`, centered cream mark).

## 4. Open and run

```bash
npx cap open ios       # opens Xcode  → pick a simulator/device → Run
npx cap open android   # opens Android Studio → Run
```

That's it — the app launches to the **passcode screen**, then the Capital home.

---

## Updating the app after design changes

The shipping web app is `www/index.html` (a single self-contained file). When the
design is updated in the source project, re-export the bundled HTML and replace
`www/index.html`, then:

```bash
npx cap sync
```

The editable source (multi-file React/JSX) lives in the original design project. For
ongoing production work see **Going to production** below.

---

## Features already wired

- **First-run onboarding** — 3 quiet intro slides explaining the fund / expert /
  direct model, shown once.
- **Passcode gate** — first launch asks the user to *create* a 4-digit passcode;
  later launches *enter* it (or tap **Face ID** to unlock). **Forgot passcode?**
  resets it. Stored locally on device. Sign out (Profile → Sign out) re-locks.
  _Mock auth — no server check._
- **Haptics** — tactile feedback on passcode entry, unlock, tab switches, and every
  confirmation (Capacitor Haptics on device; included in `package.json`).
- **Activity history** — full transaction log (top-ups, investments, withdrawals,
  yield payouts) under Wallet → *View all activity*.
- **Offline** — the whole app (code, styles, data, libraries) is bundled in `www/`.
  Works in airplane mode. A service worker also makes the PWA build offline-capable.
- **State persistence** — the user returns to the last screen they were on; tweaks,
  passcode, onboarding, and progress survive restarts (via `localStorage`).
- **Safe areas** — the layout fills the screen and respects the notch / home
  indicator (`env(safe-area-inset-*)`), no simulated phone bezel.
- **Push readiness** — see below.

## Push notifications (finish the wiring)

The JS scaffold is in place (`PoketeePush.init()` runs on unlock). To go live:

1. Already in `package.json`: `@capacitor/push-notifications`.
2. **iOS:** in Xcode enable **Push Notifications** + **Background Modes →
   Remote notifications** capabilities; set up an APNs key in your Apple Developer
   account.
3. **Android:** create a Firebase project, add the Android app (`rw.poketee.app`),
   download `google-services.json` into `android/app/`, and the plugin handles FCM.
4. The scaffold already listens for `registration` (logs the device token) and
   `pushNotificationReceived`. Send the token to your backend when you have one.

No code change is needed to *receive* a test push once the platform capabilities are
configured.

---

## Going to production

This build runs JSX through an in-browser compiler (fine for a demo; adds ~1s to first
launch). Before store submission for a real product, you'll want to:

1. **Precompile the front end.** Move the React/JSX source into a Vite project and
   `npm run build` to a `dist/` folder, then point `webDir` at it. Removes the runtime
   compiler and the startup delay.
2. **Add a backend.** All data currently lives in `data.jsx` as mock objects
   (`CC_PORTFOLIO`, `CC_PARENT_FUNDS`, `CC_COMPANIES`, wallet, settings). Replace these
   reads with API calls. Real auth replaces the local passcode check.
3. **Real payments.** Top-ups, withdrawals, and investing currently *simulate*
   transactions. Integrate MoMo / bank rails + KYC when ready.
4. **Compliance.** A real investment app needs the appropriate financial licensing,
   KYC/AML, and store review disclosures before public release.

## Store submission checklist

- iOS: set version/build, signing team, App Store Connect listing, privacy nutrition
  labels (note: collects a passcode locally; no tracking).
- Android: set `versionCode`/`versionName`, generate a signed AAB, Play Console listing,
  data-safety form.
- Have screenshots ready (the app is portrait-only).

---

_Generated as a design-to-native handoff. The mock-data app is feature-complete as a
prototype; the production steps above are the path to a shippable financial product._
