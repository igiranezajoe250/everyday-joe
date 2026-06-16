# Everyday �?Expo SDK 54 prototype

A working **React Native + Expo SDK 54** prototype for the Everyday investment
app. Built to:

1. **Run today in Expo Go** so you can scan a QR code on iOS or Android and
   demo the flow with no native build.
2. **Be cross-platform** �?every screen uses only React Native primitives
   (`View`, `Text`, `Pressable`, `ScrollView`, `FlatList`) plus the Expo
   modules that are pre-bundled in Expo Go SDK 54. No DOM, no CSS, no
   web-only globals.
3. **Pivot to production** without a rewrite. The same `expo-router` source
   tree compiles to a real `.ipa` and `.aab` via EAS Build the day you're
   ready to ship to the App Store and Play Store.

## Run it locally in Expo Go

```bash
cd expo-app
npm install              # or pnpm install / yarn
npx expo start           # press i for iOS sim, a for Android, or scan QR with Expo Go
```

Expo Go SDK 54 is required on the test device. The bare minimum platform
versions match SDK 54's defaults (iOS 15.1+, Android 7.0 / API 24+).

## Integrating into your IDE

1. Copy the entire `expo-app/` folder into your workspace (or `git init` and
   commit it as its own repo).
2. Open the folder in VS Code / Cursor / WebStorm. The TypeScript paths and
   `tsconfig.json` reference `expo-router/types` so you get full IntelliSense
   on every route.
3. Install Node 20.x LTS, then run `npm install`. The lockfile is intentionally
   not committed �?your IDE / CI will generate one against your registry.
4. `npx expo start` boots Metro. Scan the QR code with the Expo Go app on
   your phone; the bundle hot-reloads on save.

## Live projects shipped in the prototype

| Project          | Sector                     | Yield  | Lock-in |
|------------------|----------------------------|--------|---------|
| Savannah Creek   | Eco-tourism · Akagera      | 13%    | 24 mo   |
| Heza Estate      | Real Estate · Kigali       | 10%    | 36 mo   |
| Shine Group      | Consumer goods · Kigali    | 12%    | 18 mo   |
| Blessed Dairy    | Agribusiness · Musanze     | 9%     | 24 mo   |

Each has its own thesis, operational workflow, financial snapshot, and risk
register surfaced through the Project detail screen.

## Project layout

```
expo-app/
├── app/                            file-system routes (expo-router v6)
�?  ├── _layout.tsx                 root stack, font loading, providers
�?  ├── index.tsx                   redirects "/" �?"/(tabs)/capital"
�?  ├── (tabs)/
�?  �?  ├── _layout.tsx             two-tab bottom bar
�?  �?  ├── capital.tsx             Capital home (balance + actions)
�?  �?  └── venture.tsx             Live projects feed
�?  ├── venture/[id]/index.tsx      project detail
�?  ├── venture/[id]/ops/[step].tsx operations step detail
�?  ├── checkout/[id].tsx           invest flow (amount/source/review/done)
�?  ├── money/[mode].tsx            add / move / withdraw
�?  ├── wallet.tsx                  invested + available + holdings
�?  └── settings.tsx                profile + accent picker
├── src/
�?  ├── theme/
�?  �?  ├── tokens.ts               color + font + radius tokens
�?  �?  ├── palettes.ts             accent palette options
�?  �?  ├── fonts.ts                expo-font + Google Fonts loader
�?  �?  └── accent.tsx              global accent (Context + AsyncStorage)
�?  ├── components/
�?  �?  ├── primitives.tsx          Eyebrow, RoundedCard, CCButton, etc.
�?  �?  └── icons.tsx               react-native-svg icon set
�?  ├── data/mock.ts                portfolio, projects, wallet
�?  └── utils/format.ts             fmtRWF + helpers
├── app.json                        Expo config (bundle ids, splash, plugins)
├── package.json                    SDK 54 dependency matrix
├── tsconfig.json                   strict TypeScript
├── babel.config.js                 babel-preset-expo + reanimated plugin
└── metro.config.js                 expo metro defaults
```

## Dependencies �?Expo Go safe

All packages listed in `package.json` are part of the SDK 54 lineup and run
inside Expo Go without a custom dev client:

- `expo`, `expo-router`, `expo-status-bar`, `expo-system-ui`
- `expo-font`, `expo-haptics`, `expo-linking`, `expo-constants`, `expo-splash-screen`
- `@expo-google-fonts/*` (Space Grotesk, Hanken Grotesk, JetBrains Mono)
- `react-native-svg`, `react-native-gesture-handler`, `react-native-reanimated`
- `react-native-safe-area-context`, `react-native-screens`
- `@react-native-async-storage/async-storage`

If you add a library not in this list (Firebase, Plaid, Stripe SDK,
react-native-mmkv, etc.) you'll need a **dev client** �?Expo Go will refuse
to load it. That's fine for production, but kills the QR-code demo loop, so
keep these out of the prototype unless they're essential.

## Path to App Store + Play Store

When the design is locked and you're ready to ship:

1. **Create an Expo account + EAS project**
   ```bash
   npx eas init
   ```

2. **Confirm production identifiers**
   In `app.json` the bundle id / package is set to `app.everyday.invest`.
   Update to your registered Apple / Google id, bump `version`,
   `buildNumber`, and `versionCode`.

3. **Build a dev client** the first time you add a native module
   (Firebase, biometrics, deep-link plugins, etc.):
   ```bash
   npx eas build --profile development --platform all
   ```

4. **Ship production builds** to TestFlight + Play Internal Testing:
   ```bash
   npx eas build --profile production --platform all
   npx eas submit --profile production --platform all
   ```

### Store-policy gotchas (financial app)

Investment / private-capital apps have stricter rules than typical
consumer apps. Flag these to legal before submission:

- **Apple §5.2.1 / §5.2.3** �?banking + securities apps require a legal
  entity registered with the relevant local regulator (here: Capital
  Markets Authority of Rwanda). The Apple Developer account must match.
- **Apple §3.1.5(a)** �?investment / fund transactions can run outside
  IAP, but the wording and CTAs must make clear that no digital goods
  are being sold inside the app.
- **Google Play Financial Services** �?declare the app under "Personal
  loans / investment". Requires a verified company developer account and a
  privacy policy hosted at a public URL (set in Play Console + `app.json`).
- **Sign-in with Apple** is mandatory if you offer any other third-party
  login on iOS (Google / phone OTP / etc.).
- **Data safety / privacy nutrition labels** �?itemise every piece of PII
  you collect (KYC docs, ID numbers, bank details). Plan this before
  wiring real auth.
- **Risk disclosure copy** �?"Projected yields are not guaranteed", min
  hold periods, withdrawal terms must be visible at the point of
  investment. The Review step in `/checkout/[id]` is the right place.
- **Regional rollout** �?start by listing Rwanda-only on both stores until
  the regulatory posture in other EAC markets is confirmed.

### Native modules you will probably need before launch

Each of these requires a dev client (i.e. ejects you from Expo Go), but
none requires ejecting from the **managed Expo workflow**:

- `expo-secure-store` �?auth tokens, biometric-protected secrets
- `expo-local-authentication` �?Face ID / fingerprint sign-in
- `expo-notifications` �?transactional push (deposits, yield, alerts)
- `expo-camera` + `expo-image-picker` �?KYC document capture
- A payments SDK �?pick the rail (Flutterwave / Paystack / MTN MoMo API /
  Stripe Africa) and wrap its native module behind a small service in
  `src/services/payments.ts` so swapping providers later is local.

The prototype's mock data lives in `src/data/mock.ts` �?when it's time to
hit real APIs, replace those exports with the same shape returned by your
backend (REST, tRPC, GraphQL �?your call) and no screen has to change.
