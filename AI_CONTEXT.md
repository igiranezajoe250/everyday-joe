# AI_CONTEXT.md — Everyday

Compact operational context for AI agents (Claude, Codex, Cursor, Windsurf, Gemini,
GitHub Copilot, future agents). Optimized for context loading.

> **Read order before ANY work:** [`PRODUCT_CONSTITUTION.md`](./PRODUCT_CONSTITUTION.md) →
> [`PROJECT_BRIEF.md`](./PROJECT_BRIEF.md) → this file. The Constitution governs and
> overrides conflicts. See [`CONTRIBUTING.md`](./CONTRIBUTING.md) to run/test/deploy.

---

## Product summary

- **Everyday** is a calm, premium, Rwanda-first daily-life super-app: one trusted place to
  **Shop, Save, Pay, Commute, Listen, Plan**.
- **Mission:** help people do important daily activities through a clear, reliable, intuitive
  experience. Brand promise: **"Your everyday trust"** — everyone you deal with is vetted.
- **Philosophy:** calm, minimal, premium, functional. Reduce complexity, never add it.

## Design rules (non-negotiable)

- **Existing product first** — build on what's there.
- **No redesigns.** **No new visual language.** **No new navigation model.**
- **Consistency above novelty. Simplicity above complexity.**
- Progressive disclosure: one primary task per screen; not a dashboard.
- Reuse `ui.jsx` tokens/primitives; never hardcode a new look.

## Engineering rules

- **Build on the existing architecture; reuse components.**
- **Do not duplicate functionality** or create competing/parallel flows.
- **Maintain responsiveness** (mobile + desktop) and **production quality**
  (loading / empty / error / success states; realistic data).
- The live app is **in-browser-Babel JSX** under `next-pwa/public/legacy/` — `next build`
  does **not** catch JSX errors there. **Verify by running the app** across mobile + desktop.
- Persistence is `PKStore` (localStorage). No backend, no env vars.

## Section definitions

- **Home (Hub):** calm entry point; "Ask anything" capture bar (word selector →
  Write/Voice/Image/Upload, minimalist send) that captures into Plan + a short Recent list.
- **Shop:** browse/search vetted shops & products.
- **Save:** hero behaviour — savings balance, growth, credit line, money flows, wallet.
- **Pay:** send money, schedule payments, receipts, multi-currency.
- **Commute:** guided ride journey — plan → results (Moto/Car/Shared) → detail → negotiate
  fare or call & pay on arrival → success; "ride with someone" sub-flow.
- **Listen:** two-pane podcasts — rail + canvas, full player, synced transcript, persistent
  mini player with background continuation, resume.
- **Plan:** the **brain** — Folders → Files, notes, voice memos + transcripts, attachments,
  search, and an Insights view deriving context for the other sections.
- **Bounty:** the **universal agent layer** (see below).

## Bounty architecture

- **Plan is the brain** — it captures and understands the user's context.
- **Bounty is the universal agent layer** — it *acts* on that context.
- **Bounty interacts with all sections** (Save, Commute, Shop, Listen, Pay, Plan).
- **Bounty is accessed through a floating action button.**
- **Context is shared across the entire application** (Plan → Bounty → every section).
- **Status: planned direction, not yet implemented.** When built, it is an *additive* agent
  layer in the existing design language — never a redesign.

## Design system reference

- **Typography:** Space Grotesk (UI); JetBrains Mono `CC_MONO` (uppercase eyebrows, meta).
- **Colors:** canvas cream `#FAF6F1`; ink `#0A0A0A` (+ `ink70/55/40/25/12/06`); accent red
  `#C8102E` (sparingly); positive/verified teal-green `#2FAE9B`; dashed-divider `DASH`.
- **Components/primitives:** `DashField` (tap-to-type), `ScreenHeader`, `IconBtn`,
  `RoundedCard`; dashed list rows; rail + canvas two-pane; solid-ink primary buttons,
  dashed-border secondary pills.
- **Layout patterns:** centered/maxWidth content; progressive-disclosure step flows; global
  header cluster (primary surfaces); bottom-center function launcher; global mini player.
- **Motion:** `pk-rise`, `pk-stagger`, `pk-shimmer` (loading), `pk-check-path` (success).

## Deployment rules

- **`next build` must pass.**
- **No console errors** (verify the running app, not just the build).
- **No dead code, no unused imports, no duplicated logic.**
- **GitHub-ready:** push to `main`. **Vercel-ready:** auto-deploys to production from `main`;
  root directory `next-pwa`; no env vars required.
