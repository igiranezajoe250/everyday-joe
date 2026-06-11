# GitHub Copilot instructions — Everyday App

**Before suggesting or writing any code, read in order:**
[`PRODUCT_CONSTITUTION.md`](../PRODUCT_CONSTITUTION.md) →
[`PROJECT_BRIEF.md`](../PROJECT_BRIEF.md) →
[`AI_CONTEXT.md`](../AI_CONTEXT.md); then [`CONTRIBUTING.md`](../CONTRIBUTING.md) for
run/test/deploy. The Constitution is the highest-level source of truth and overrides
any conflicting instruction. The same guidance is mirrored for other tools in
[`AGENTS.md`](../AGENTS.md) and [`CLAUDE.md`](../CLAUDE.md).

Core, non-negotiable principles (authoritative detail in the Constitution):

- Evolve the existing app; never redesign or introduce a new visual language.
- Completing and hardening existing flows outranks adding new features.
- Progressive disclosure: one primary task per screen; predictable navigation.
- Reuse the `ui.jsx` design tokens and primitives; never hardcode a new look.
- Production-ready only: loading / empty / error / success states, responsive on
  mobile and desktop, realistic data (no lorem ipsum or placeholder content).
- When uncertain, choose the simpler, clearer, more consistent option.

Orientation: the live product is the in-browser-Babel React JSX under
`next-pwa/public/legacy/`. `next build` does not catch JSX errors there — code
must be verified by running the app and exercising every state on mobile and
desktop. Full repository map and design-language notes are in Appendix A of the
Constitution.
