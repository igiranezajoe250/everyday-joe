# Everyday — Project Brief

> **Document chain:** [`PRODUCT_CONSTITUTION.md`](./PRODUCT_CONSTITUTION.md) (governing,
> takes precedence) → **`PROJECT_BRIEF.md`** (this file) → [`AI_CONTEXT.md`](./AI_CONTEXT.md)
> (compact AI context) → [`CONTRIBUTING.md`](./CONTRIBUTING.md) (how to run/test/deploy).
>
> This is the human-readable overview for designers, product managers, developers, and
> new contributors. Where it conflicts with the Constitution, the Constitution wins.

---

## 1. What Everyday is (the one-liner)

**Everyday is a calm, premium daily-life super-app for Rwanda — one trusted place to
Shop, Save, Pay, Commute, Listen, and Plan, where everyone you deal with has already
been vetted.**

The product promise, taken straight from onboarding, is **"Your everyday trust."**
Everyday is not a feature collection; it is an *intelligence layer for daily life* that
reduces complexity instead of adding it. The differentiator isn't "more apps in one" —
it's **trust + calm + context**: vetted counterparties, one coherent experience, and a
system that quietly gets more useful the more you use it.

---

## 2. Why it exists (vision & philosophy)

The governing idea: **help people accomplish important daily activities through a clear,
reliable, intuitive experience.** Every interaction should reduce complexity, not create it.

Five principles the whole team builds against (full detail in the Constitution):

1. **Existing product first.** Evolve and complete what exists; never redesign for its own
   sake. If the choice is "improve an existing pattern" vs "invent a new one," improve the
   existing one.
2. **Maturity over expansion.** Reliability → completion → performance → clarity →
   consistency → simplicity → *then* new features. A finished product beats a larger one.
3. **Progressive disclosure.** One primary task per screen; reveal complexity only when
   relevant. Guided journeys, not dashboards.
4. **Production-ready or not done.** Every screen ships loading / empty / error / success
   states, responsive on mobile + desktop, with realistic data (no placeholders).
5. **When uncertain, choose simpler, clearer, more consistent.**

Every screen must instantly answer three questions: *What is this? What can I do here?
What should I do next?*

---

## 3. Brand & marketing direction

- **Identity:** "Everyday" (repo/working name "Everyday Joe"). Rwanda-first — Kigali
  locations, RWF currency, local names and channels.
- **Promise:** **trust.** The hook is "everyone you deal with has already been vetted."
  Lead with *safety, calm, one trusted place* — not feature lists.
- **Personality / voice:** calm, premium, minimal, modern, confident-through-simplicity.
  Copy is short and plain — never wordy, never hype.
- **Positioning:** other super-apps feel like crowded dashboards; Everyday feels like a
  quiet, editorial, premium tool. Emotional target: *trust + effortlessness*.
- **Brand-asset signature:** warm cream backgrounds, near-black ink, thin dashed lines,
  generous space, a single restrained red accent. Deliberately anti-neon, anti-cluttered.
- **What beta users test:** usefulness, experience, reliability — **not** whether basic
  functionality exists. The beta must feel finished.

---

## 4. Design language (the design system)

The aesthetic is **"de-carded" Swiss / editorial minimalism** — one visual language across
every section. Do not introduce a second one. Tokens and primitives live in
[`next-pwa/public/legacy/ui.jsx`](next-pwa/public/legacy/ui.jsx).

- **Canvas:** warm cream `#FAF6F1`. **Ink:** near-black `#0A0A0A` at opacity steps
  (`ink70/55/40/25/12/06`).
- **Accent:** restrained Syncabi red `#C8102E` (+ a warm brown), used sparingly;
  positive/verified states use teal-green `#2FAE9B`.
- **Type:** **Space Grotesk** for UI; **JetBrains Mono** (`CC_MONO`) for small uppercase
  "eyebrow" labels and numeric/meta text.
- **Dividers:** the signature move — **thin dashed rules** (`DASH`) *instead of boxed
  cards*. Sections are separated by hairlines, not heavy containers.
- **Inputs:** **tap-to-type** — shaded placeholder over a dashed underline that firms to
  solid on focus (`DashField`). Primary buttons stand alone (solid ink) with space;
  secondary actions use dashed-border pills.
- **Geometry & motion:** pill-rounded soft radii (12–20), restrained shadows, calm motion
  (`pk-rise`, `pk-stagger`, shimmer for loading).

**Reuse, don't reinvent.** Compose from existing primitives (`DashField`, `ScreenHeader`,
`IconBtn`, `RoundedCard`, the rail+canvas two-pane, the dashed list row). Never hardcode a
new look.

---

## 5. Engineering architecture

**Stack:** a thin **Next.js (App Router) shell** wrapping an **in-browser-Babel React app**,
deployed on **Vercel** (Node 24.x, framework Next.js, root directory `next-pwa`). It is a
**client-only PWA** — no backend, no database, no environment variables.

**Repository map** (the web product lives in `next-pwa/`; `expo-app/` and `handoff/` are
separate and not part of the web build):

- [`next-pwa/app/`](next-pwa/app) — Next.js shell. `PhoneMirror` frames/serves the app,
  registers the service worker, handles the mobile/desktop view toggle. Security headers in
  [`next.config.ts`](next-pwa/next.config.ts).
- [`next-pwa/public/legacy/`](next-pwa/public/legacy) — **the live application**, authored
  as JSX transformed *in the browser* by Babel, loaded via `Poketee.html`:
  - `app.jsx` — root `App`: routing/state, the global header cluster, the function
    launcher, the lifted global audio player, and capture intents.
  - `screens.jsx` — every feature screen and its sub-components (the bulk of the app).
  - `ui.jsx` — design tokens + shared primitives.
  - `native.jsx` — `PKStore` (localStorage persistence), haptics, onboarding, lock gate,
    native/web detection.
  - `data.jsx` — shared demo data.

**State & persistence:** React local/lifted state; durable state via **`PKStore`** (a thin
`localStorage` wrapper). Cross-component handoffs use small one-shot "intent" props (e.g.,
Home's capture bar → Plan) rather than a global store.

**The single most important engineering fact:** because the legacy JSX is compiled **in the
browser at runtime**, `next build` **does not type-check or catch JSX errors there.**
**Verification is by running the app and exercising every state on mobile *and* desktop.**
See [`CONTRIBUTING.md`](./CONTRIBUTING.md).

**Deployment:** push to `main` → Vercel auto-deploys production; PRs get preview URLs.

---

## 6. Sections & end-to-end flows

| Section | Purpose & current state |
| --- | --- |
| **Home (Hub)** | Calm entry point. Greeting + an **"Ask anything"** capture bar (worded action selector → Write/Voice/Image/Upload; minimalist send) that captures into Plan, plus a clean short **Recent** history list of contextual continues. |
| **Shop** | Browse/search vetted shops & products; category filters; empty states. |
| **Save** | The hero behaviour — balance, growth, accessible credit line; money flows (add/withdraw/borrow/repay), Wallet, Activity, Credit, Growth, Venture/Checkout sub-screens. |
| **Pay** | Send money, schedule payments, multi-currency, receipts. |
| **Commute** | A guided ride journey: plan → results (Moto/Car/Shared, refine/sort) → detail → **negotiate fare or call & pay on arrival** → success; plus a "ride with someone" sub-flow. |
| **Listen** | Two-pane podcasts: source rail + canvas, dedicated full player, **synced transcript**, a persistent **mini player with background continuation**, and resume-where-you-left-off. |
| **Plan** | The **intelligence layer / "brain"**: Folders → Files, notes, **voice memos with transcripts**, attachments, fast search, and an **Insights** view that derives context (Save/Commute/Shop/Listen signals) from what you capture. |
| **Bounty** *(direction)* | The **universal agent layer** — see §7. Planned, not yet built. |
| **Profile/Settings, Wallet, Activity, Onboarding, Lock** | Account chrome, first-run, session lock gate. |

**Cross-cutting systems:** a **global header cluster** (notifications · wallet · profile) on
primary surfaces; a bottom-center **function launcher**; a **global mini player** with
background continuation; onboarding → lock gate → hub first-run; haptics; PWA/offline.

---

## 7. The intelligence thesis — Plan (brain) → Bounty (agent layer)

The product's compounding advantage is **context**:

- **Plan is the brain.** It is where users capture thoughts, goals, notes, voice memos, and
  documents. The more they capture, the more the app understands them.
- **Bounty is the universal agent layer** *(planned direction — not yet implemented).* It
  acts on that context across every section: it is reached through a **floating action
  button**, shares context application-wide, and can carry out tasks (suggest a departure
  time before a meeting, surface a savings move, recommend a shop within budget, queue an
  episode). Plan understands the user; Bounty acts for them.

This is the next major architectural milestone. When built, it must follow the same
design language and the existing-product-first rules — an additive agent layer over the
current sections, never a redesign.

---

## 8. Current status & honest gaps

A **polished, production-deployed beta**: builds green, deploys READY on Vercel, zero
console errors across sections. Deliberately simulated for the prototype (the next build-out
seams):

- **No backend yet** — all data is demo data in `localStorage`. Real auth, accounts,
  payments, and a data layer are the biggest build-out.
- **Audio is a simulated timer** (lifted to App so it survives navigation); real `<audio>` +
  `MediaSession` + actual media slot in cleanly.
- **Voice capture & transcription are simulated** (mic is policy-disabled in the prototype).
- **Plan's Insights are honest keyword signals surfaced in-app**, not yet wired live into the
  other sections — that cross-section wiring (and **Bounty**) is the highest-leverage milestone.
- **Token naming debt:** some `ui.jsx` variables (`teal`/`amber`) hold rebranded red/brown
  values — cosmetic, rename when convenient.

---

## 9. Roadmap (high level)

1. **Bounty agent layer** — FAB-accessed, context-shared agent over all sections (Plan feeds it).
2. **Real data layer & auth** — replace `localStorage` demo data with accounts and a backend.
3. **Real media & voice** — actual audio playback (`MediaSession`), recording, and transcription.
4. **Live cross-section intelligence** — wire Plan's Insights into Commute/Save/Shop/Listen.
5. **Continued hardening** — accessibility, performance, and per-section completion passes.

New features are the **lowest** priority; completing and hardening existing flows is the highest.

---

**One sentence per audience:**
- **Engineers:** a client-only Next.js-shelled, in-browser-Babel React PWA on Vercel,
  persisted via `localStorage`, evolved through completion and verified by running every state.
- **Designers:** one calm, de-carded Swiss/editorial system — cream + ink + dashed lines +
  tap-to-type — applied consistently, refined never reinvented.
- **Brand/Marketing:** "Your everyday trust" — a premium, minimal, Rwanda-first trusted place
  for daily life, sold on calm and safety, not feature count.
