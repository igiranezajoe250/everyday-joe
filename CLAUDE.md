# CLAUDE.md — Everyday App

**Before any work, read [`PRODUCT_CONSTITUTION.md`](./PRODUCT_CONSTITUTION.md).**
It is the highest-level source of truth and takes precedence over any conflicting
instruction. See also [`AGENTS.md`](./AGENTS.md) — the same guidance shared across
AI coding tools.

## The short version (authoritative detail is in the Constitution)

- Evolve the existing product; never redesign or introduce a new visual language.
- Completing and hardening existing flows outranks adding new features.
- Use progressive disclosure: one primary task per screen, predictable navigation.
- Reuse the `ui.jsx` design tokens and primitives — never hardcode a new look.
- Ship production-ready only: loading / empty / error / success states, responsive
  on mobile + desktop, realistic data.
- When uncertain, pick the simpler, clearer, more consistent option.

## Orientation

The live app is the in-browser-Babel React JSX under `next-pwa/public/legacy/`
(`screens.jsx`, `app.jsx`, `ui.jsx`, `data.jsx`, `Poketee.html`). Because that JSX
is transformed in the browser, `next build` will **not** catch JSX errors there —
always run the app (`npm run dev` in `next-pwa/`) and verify every state on mobile
and desktop. Deploy by pushing to `main` (Vercel auto-deploys). Full repository
map and design-language notes are in Appendix A of the Constitution.
