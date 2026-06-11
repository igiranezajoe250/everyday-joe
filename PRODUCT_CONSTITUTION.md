# Everyday App — Product Constitution & Production Readiness Framework

> **This is the highest-level source of truth for the Everyday App.**
> Every contributor — human or AI, regardless of which coding tool is used — must
> read and follow this document before making any change. If a proposed change
> conflicts with this document, **this document takes precedence.**
>
> Tool-specific pointer files (`CLAUDE.md`, `AGENTS.md`, `.cursorrules`,
> `.github/copilot-instructions.md`) all defer to this file. Keep this file as the
> single canonical copy; do not fork its rules into the pointers.

## Purpose

This document is the permanent reference for the Everyday App.

Its purpose is to ensure that every future update, feature, design decision, engineering implementation, AI-generated contribution, and product improvement builds upon the existing product rather than creating a new one.

Every contributor must treat this document as the highest-level source of truth for product decisions.

If a proposed change conflicts with this document, the document takes precedence.

The goal is consistency, continuity, and product maturity.

---

# Product Mission

Everyday is a simple daily life application.

The purpose of the product is not to become a collection of features.

The purpose is to help people accomplish important daily activities through a clear, reliable, and intuitive experience.

The app should feel useful, calm, trustworthy, and effortless.

Every interaction should reduce complexity rather than create it.

---

# Product Philosophy

The product should always feel:

* Simple
* Clear
* Focused
* Practical
* Modern
* Minimal
* Premium
* Fast
* Reliable

Avoid:

* Complexity
* Feature bloat
* Unnecessary customization
* Over-designed interfaces
* Trend-driven design decisions
* Experimental interactions
* Excessive animations
* Multiple competing actions

The best solution is usually the simplest one.

---

# Existing Product First

All future work must start from the existing application.

Never redesign for the sake of redesign.

Never replace existing patterns simply because a different approach is available.

Never introduce a new visual language without a compelling reason.

Every improvement should feel like a natural evolution of the current product.

Before implementing any change:

1. Understand the existing implementation.
2. Understand why it exists.
3. Improve it if possible.
4. Replace it only if there is a proven problem.

The objective is evolution, not reinvention.

---

# Product Continuity Rule

Future updates must build on top of what already exists.

Do not:

* Introduce competing workflows.
* Create duplicate functionality.
* Create parallel navigation systems.
* Create inconsistent interfaces.
* Add concepts that conflict with the existing product.

Instead:

* Extend existing flows.
* Improve existing screens.
* Refine existing interactions.
* Complete unfinished experiences.

Users should never feel like different parts of the application were built by different teams.

The entire product should feel unified.

---

# Product Maturity Rule

When making decisions, prioritize:

1. Reliability
2. Completion
3. Performance
4. Clarity
5. Consistency
6. Simplicity
7. New functionality

New features are the lowest priority.

Completing existing features is the highest priority.

A finished product is better than a larger product.

---

# Design Principles

Every screen should answer three questions immediately:

1. What is this?
2. What can I do here?
3. What should I do next?

If these answers are not obvious, simplify the interface.

---

# Interface Principles

Interfaces should be:

* Minimal
* Structured
* Intentional
* Readable
* Spacious
* Focused

Avoid:

* Visual noise
* Information overload
* Excessive controls
* Too many buttons
* Too many cards
* Too many choices

Users should never need to think about where to go next.

The interface should naturally guide them.

---

# Progressive Disclosure

Do not display everything at once.

Only show information when it becomes relevant.

Reveal complexity gradually.

Example:

Wrong:

* Search
* Filters
* Results
* Profile details
* Maps
* Advanced options

all visible simultaneously.

Correct:

Step 1 → Search

Step 2 → Results

Step 3 → Details

Step 4 → Confirmation

Step 5 → Completion

Each screen should focus on one primary task.

---

# Navigation Principles

Navigation should remain predictable.

Do not introduce:

* New navigation paradigms
* Experimental navigation
* Hidden navigation structures

Users should always know:

* Where they are
* What they can do
* How to move forward
* How to go back

---

# Feature Development Rules

Before adding any new feature, ask:

1. Does this solve a real user problem?
2. Does it fit the existing product vision?
3. Does it improve the user's experience?
4. Can the same outcome be achieved by improving an existing feature?
5. Does it increase complexity?

If the answer to question 5 is yes, reconsider.

---

# AI Contributor Rules

Any AI system working on this project must follow these rules.

The AI must:

* Build on existing code.
* Build on existing flows.
* Build on existing components.
* Respect existing architecture.
* Respect existing design systems.
* Respect existing terminology.

The AI must not:

* Redesign the application.
* Invent new product directions.
* Replace working systems unnecessarily.
* Introduce new visual languages.
* Introduce inconsistent UI patterns.

All changes should feel invisible to existing users except for improved quality.

---

# Production Readiness Requirements

Every feature should be production-ready before being considered complete.

This includes:

## Functional

* Works end-to-end
* No broken flows
* No dead links
* No placeholder actions
* No unfinished states

## Interface

* Responsive mobile experience
* Responsive desktop experience
* Accessible interactions
* Consistent spacing
* Consistent typography

## States

Every screen should support:

* Loading state
* Empty state
* Error state
* Success state

No state should be left undefined.

## Data

Use realistic data.

Avoid:

* Lorem ipsum
* Placeholder names
* Placeholder images
* Fake generic content

The application should feel real even during beta.

---

# Beta Launch Standard

The beta should feel like a finished product.

Users should be testing:

* Product usefulness
* User experience
* Reliability

They should not be testing whether basic functionality exists.

Before release:

* Complete flows first.
* Polish interactions second.
* Add new features last.

---

# Visual Direction

The Everyday App should always feel:

* Premium
* Modern
* Minimal
* Calm
* Fast
* Clean
* Professional

The product should communicate confidence through simplicity.

Do not add elements unless they clearly improve usability.

Every pixel should have a purpose.

---

# Final Rule

Whenever uncertainty exists, choose the option that is:

* Simpler
* Clearer
* More consistent
* More reliable
* More aligned with the current product

The Everyday App should evolve through refinement, not reinvention.

Every update should feel like the same product becoming better, never a different product becoming larger.

---

# Appendix A — Repository Orientation (factual, keep current)

This appendix is the practical map of *where the product actually lives* so no
contributor redesigns or duplicates by accident. Verify against the code before
relying on any line here; update it when the structure changes.

## Where the live app is

* **`next-pwa/`** — the Next.js (App Router) PWA shell and the single source of
  truth for the running product. Deployed to Vercel.
* **`next-pwa/public/legacy/`** — the actual application UI. It is a React app
  authored as in-browser Babel JSX and loaded by `Poketee.html`:
  * `screens.jsx` — all feature screens (Hub, Shop, Save/Capital, Pay, Plan,
    Listen, Commute, Wallet, Activity, Settings, etc.) and their sub-components.
  * `app.jsx` — the root `App`, routing/state, header actions, function launcher.
  * `ui.jsx` — the shared design system: tokens (`ink`, `paper`, `canvas`,
    `ink40`/`ink25`/`ink06`, `DASH`, `CC_MONO`, palettes) and primitives
    (`DashField`, `ScreenHeader`, `IconBtn`, `RecentSection`, etc.).
  * `data.jsx` — shared demo data.
  * `Poketee.html` — bootstraps React + Babel, global CSS keyframes/animation
    classes (`pk-rise`, `pk-stagger`, `pk-shimmer`, `pk-check-path`, …).
* **`expo-app/`** and **`handoff/`** — separate; do not edit when working on the
  web product unless explicitly asked.

## The design language (do not diverge)

"De-carded" minimal Swiss/editorial: cream `canvas`, near-black `ink`, **thin
dashed dividers (`DASH`)** instead of boxed cards, mono uppercase eyebrow labels
(`CC_MONO`), tap-to-type fields that are a shaded placeholder over a dashed rule
that firms on focus (`DashField`), standalone primary buttons with space around
them, pill-rounded geometry. Reuse `ui.jsx` tokens and primitives — never
hardcode new colors or introduce a second visual language.

## Established interaction patterns

* Global header cluster (Notifications · Wallet · Profile) top-right on every
  main screen; the Inbox panel holds notifications + messages.
* A single bottom-centre **`+` function launcher** rides along on function pages;
  bottom CTAs must reserve clearance so the `+` never overlaps content.
* Multi-step features use **progressive disclosure** with a context-aware back
  affordance (step back through the flow, exit to Hub from the first step).
  Commute is the reference implementation: plan → results → detail → confirm →
  success, plus a focused sub-flow. Mirror this shape for comparable features.

## Build, run, verify, deploy

* Dev server: `npm run dev` in `next-pwa/` (Next.js).
* Production build check: `npm run build` in `next-pwa/`.
* The legacy JSX is transformed in-browser, so `next build` will not catch JSX
  errors there — **always verify changes by running the app and exercising every
  state** (loading / empty / error / success) on both mobile and desktop widths.
* Deploy: push to `main` on GitHub (`igiranezajoe250/everyday-joe`); Vercel
  auto-deploys to production.
