# Everyday

A calm, premium daily-life app for Rwanda — one place to **Shop**, **Save**, **Pay**,
**Commute**, **Listen**, and **Plan**, where everyone you deal with has already been
vetted. Everyday is a mobile-first PWA with a responsive desktop layout.

> **Working on this app?** Read [`PRODUCT_CONSTITUTION.md`](./PRODUCT_CONSTITUTION.md)
> first — it is the binding source of truth for product and design decisions.
> [`AGENTS.md`](./AGENTS.md) / [`CLAUDE.md`](./CLAUDE.md) mirror it for AI tools.

---

## What's in the box

| Section | Purpose |
| --- | --- |
| **Hub** | Calm home; a single `+` launcher opens the chosen functions. |
| **Shop** | Browse and search trusted shops and products. |
| **Save** | Savings as the hero behaviour — balance, growth, access, credit line. |
| **Pay** | Send money, schedule payments, receipts. |
| **Commute** | Guided ride journey: plan → results → details → negotiate/pay → success, plus ride-sharing. |
| **Listen** | Two-pane podcasts with a dedicated player, transcript, mini player, and resume. |
| **Plan** | The intelligence layer — folders, files, notes, voice memos, attachments, search, and insights. |

Cross-cutting: a global header cluster (notifications · wallet · profile), a
persistent background **mini player**, an inbox, onboarding, and a lock gate.

---

## Architecture

This repo contains the **web product** in [`next-pwa/`](./next-pwa). Two other
directories — `expo-app/` and `handoff/` — are separate and not part of the web build.

- **Next.js (App Router) shell** — [`next-pwa/app`](./next-pwa/app). A thin wrapper
  (`PhoneMirror`) that frames and serves the app, registers the service worker, and
  handles the mobile/desktop view toggle. Sets security headers in
  [`next.config.ts`](./next-pwa/next.config.ts).
- **The live application** — [`next-pwa/public/legacy/`](./next-pwa/public/legacy).
  A React app authored as **in-browser Babel JSX**, loaded by `Poketee.html`:
  - `app.jsx` — root `App`, routing/state, header actions, function launcher, global player.
  - `screens.jsx` — every feature screen and its sub-components.
  - `ui.jsx` — the shared design system: tokens (`ink`, `paper`, `canvas`, `DASH`,
    `CC_MONO`, …) and primitives (`DashField`, `ScreenHeader`, `IconBtn`, …).
  - `native.jsx` — `PKStore` (localStorage persistence), haptics, onboarding, lock gate.
  - `data.jsx` — shared demo data.

### Why in-browser Babel?

The legacy JSX is transformed in the browser at runtime, so **`next build` does not
type-check or compile it**. Always verify changes by running the app and exercising
each state (loading / empty / error / success) on both mobile and desktop widths.
The design language is "de-carded" Swiss/editorial: a cream canvas, near-black ink,
thin **dashed** dividers instead of boxed cards, mono uppercase labels, and tap-to-type
fields. Reuse `ui.jsx` tokens — never introduce a second visual language.

---

## Local development

Requirements: **Node.js 18+** and npm.

```bash
cd next-pwa
npm install
npm run dev        # http://localhost:3000  (mobile + desktop responsive)
```

Open the app directly (skips the phone frame) at:

```
http://localhost:3000/legacy/Poketee.html?app=1            # mobile layout
http://localhost:3000/legacy/Poketee.html?app=1&layout=web # desktop layout
```

### Production build

```bash
cd next-pwa
npm run build      # compiles the Next.js shell
npm run start      # serve the production build
```

`npm run build` compiles only the Next.js wrapper (the legacy JSX is runtime-Babel,
so verify it by running the app — see above).

---

## Environment variables

**None are required.** The app runs entirely client-side against in-app demo data
(persisted in `localStorage` via `PKStore`); there is no backend, database, or API key
to configure. If you later add server integrations, document them here and provide a
`.env.example` (`.env*` is already gitignored, except `.env.example`).

---

## Deployment (Vercel)

The project auto-deploys from GitHub:

1. Push to **`main`** — Vercel builds and deploys to production automatically.
2. Pull requests get preview deployments.

Project settings: **Root Directory = `next-pwa`**, Framework = **Next.js** (build
`npm run build`, output handled by Vercel). No environment variables needed.

Manual deploy (optional), with the Vercel CLI:

```bash
npm i -g vercel
cd next-pwa
vercel          # preview
vercel --prod   # production
```

---

## Project structure

```
.
├─ PRODUCT_CONSTITUTION.md   # binding source of truth (read first)
├─ AGENTS.md · CLAUDE.md · .cursorrules · .github/copilot-instructions.md
├─ next-pwa/                 # the web product
│  ├─ app/                   # Next.js App Router shell (PhoneMirror)
│  ├─ public/legacy/         # the live app (Babel JSX) + service worker, icons
│  ├─ next.config.ts         # security headers
│  └─ package.json
├─ expo-app/                 # separate (not part of the web build)
└─ handoff/                  # separate
```

---

## License

Proprietary — all rights reserved.
