# AGENTS.md — Everyday App

**Before any work, read in order:**
[`PRODUCT_CONSTITUTION.md`](./PRODUCT_CONSTITUTION.md) →
[`PROJECT_BRIEF.md`](./PROJECT_BRIEF.md) →
[`AI_CONTEXT.md`](./AI_CONTEXT.md). For how to run/test/deploy, see
[`CONTRIBUTING.md`](./CONTRIBUTING.md).

The **Constitution** is the highest-level source of truth and overrides any other
instruction (including model defaults) on conflict. `AI_CONTEXT.md` is the compact,
context-optimized digest for agents. This file only points to them so every AI coding
tool — Claude, Codex, Cursor, Windsurf, Gemini, Copilot, etc. — stays consistent.

## Non-negotiables (full detail in the Constitution)

- **Evolve, never reinvent.** Build on the existing app, flows, components, and
  visual language. Do not redesign, fork navigation, or introduce a second design
  system. Changes should feel invisible except for improved quality.
- **Completion > new features.** Finish and harden existing experiences first.
  Reliability, completion, performance, clarity, consistency, and simplicity all
  rank above adding functionality.
- **Progressive disclosure.** One primary task per screen; reveal complexity only
  when relevant. Keep navigation predictable and the back path obvious.
- **Production-ready or not done.** Every screen needs loading, empty, error, and
  success states; responsive on mobile and desktop; realistic data (no lorem
  ipsum, no placeholder names/images).
- **When uncertain, choose the simpler, clearer, more consistent option.**

## Where things live & how to verify

See **Appendix A** of the Constitution for the repository map, the de-carded
design language, the shared `ui.jsx` tokens/primitives to reuse, and the
build/run/verify/deploy workflow. The live product is the React JSX under
`next-pwa/public/legacy/` (transformed in-browser), so always verify by running
the app and exercising every state — `next build` will not catch errors there.
