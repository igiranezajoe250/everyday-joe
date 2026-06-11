# Contributing to Everyday

> **Read first (in order):** [`PRODUCT_CONSTITUTION.md`](./PRODUCT_CONSTITUTION.md) →
> [`PROJECT_BRIEF.md`](./PROJECT_BRIEF.md) → [`AI_CONTEXT.md`](./AI_CONTEXT.md). The
> Constitution governs all decisions. This file is the practical how-to.

Everyday evolves through **refinement and completion**, never redesign. Before changing
anything: understand the existing implementation, preserve what works, and improve only where
necessary. If in doubt, choose the simpler, clearer, more consistent option.

---

## 1. Prerequisites

- **Node.js 18+** and npm.
- The web product lives in [`next-pwa/`](next-pwa). (`expo-app/` and `handoff/` are separate.)

## 2. Run the project

```bash
cd next-pwa
npm install
npm run dev        # http://localhost:3000  (responsive shell)
```

Open the app directly (skips the phone frame):

```
http://localhost:3000/legacy/Poketee.html?app=1            # mobile layout
http://localhost:3000/legacy/Poketee.html?app=1&layout=web # desktop layout
```

The live UI is **in-browser-Babel React JSX** in [`next-pwa/public/legacy/`](next-pwa/public/legacy)
(`app.jsx`, `screens.jsx`, `ui.jsx`, `native.jsx`, `data.jsx`, `Poketee.html`). Edit those
files and reload the app.

## 3. Test & verify (the important part)

Because the legacy JSX is transformed **in the browser**, **`next build` does NOT catch JSX
errors or runtime bugs there.** You must verify by running the app:

1. **Run the app** and open the screen you changed.
2. **Exercise every state:** loading, empty, error, success — plus the full user journey end
   to end (no dead ends).
3. **Check the console** — there must be **zero errors**.
4. **Reset state when needed** — durable state is in `localStorage` via `PKStore`; clear it
   to test first-run (onboarding → lock gate → hub) and empty states.

## 4. Verify responsiveness

Check both breakpoints for every change:

- **Mobile** — `…/Poketee.html?app=1` at a narrow viewport (~390px).
- **Desktop** — `…/Poketee.html?app=1&layout=web` at a wide viewport (≥1024px).

Confirm: no overflow, no clipped text, layouts reflow cleanly (two-pane screens collapse
sensibly), and tap targets stay comfortable. Mobile-first, but desktop must be first-class.

## 5. Verify production readiness

Before opening a PR or pushing:

- [ ] Loading / empty / error / success states all present and correct.
- [ ] Responsive on mobile **and** desktop.
- [ ] **Zero console errors**; no broken flows, dead links, or placeholder actions.
- [ ] **No dead code, no unused imports, no duplicated logic.**
- [ ] Realistic data — no lorem ipsum or placeholder names/images.
- [ ] Reuses existing `ui.jsx` tokens/primitives; no new visual language.
- [ ] `cd next-pwa && npm run build` succeeds.

```bash
cd next-pwa
npm run build      # compiles the Next.js shell; must pass
```

## 6. Commit & deploy

- Branch from `main`, keep commits focused, write a clear message describing the *why*.
- **Deploy:** push to **`main`** → Vercel auto-deploys to production. Pull requests get
  preview URLs. Project settings: root directory `next-pwa`, framework Next.js, **no
  environment variables required**.
- Optional manual deploy: `npm i -g vercel`, then `cd next-pwa && vercel` (preview) /
  `vercel --prod` (production).

## 7. Definition of done

A change is done when the section it touches feels **complete, consistent, and
production-ready** — indistinguishable in quality from the rest of Everyday, with every state
covered and verified in the running app on mobile and desktop.
