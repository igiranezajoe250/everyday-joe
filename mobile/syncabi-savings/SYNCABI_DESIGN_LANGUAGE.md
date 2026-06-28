# Syncabi Design Language — Mobile App Brief

> Use this document as context/prompt for any AI tool styling the Syncabi Savings & Lending mobile app.
> The goal: match Syncabi's web design language in colors, typography, and visual tone.

---

## Color System

| Token | Value | Usage |
|---|---|---|
| **Ink** | `#0A0A0A` | Primary text, solid buttons |
| **Paper** | `#FFFFFF` | Primary background |
| **Paper Soft** | `#FAFAFA` | Alternate section/card backgrounds |
| **Cream** | `#FAF6F1` | Warm tertiary background (e.g. savings dashboard) |
| **Accent Red** | `#C8102E` | Primary accent — CTAs, alerts, badges (use sparingly) |
| **Hero Brown** | `#8B3A2F` | App theme color, header/hero backgrounds |
| **Dark BG** | `#1A1A1A` | Dark mode surfaces, dark sections |

### Ink Opacity Scale

Use for secondary text, borders, dividers — always based on `#0A0A0A`:

| Opacity | Value | Usage |
|---|---|---|
| 70% | `rgba(10,10,10,0.70)` | Secondary text, active links |
| 55% | `rgba(10,10,10,0.55)` | Body text, descriptions |
| 40% | `rgba(10,10,10,0.40)` | Labels, metadata, placeholders |
| 25% | `rgba(10,10,10,0.25)` | Subtle borders on hover/focus |
| 12% | `rgba(10,10,10,0.12)` | Dividers, card borders, input borders |
| 6%  | `rgba(10,10,10,0.06)` | Section separators, faint lines |

### Light-on-Dark (for hero/dark sections)

| Opacity | Value | Usage |
|---|---|---|
| 100% | `#FFFFFF` | Headlines on dark bg |
| 72% | `rgba(255,255,255,0.72)` | Body text on dark bg |
| 45% | `rgba(255,255,255,0.45)` | Eyebrow labels on dark bg |
| 25% | `rgba(255,255,255,0.25)` | Borders on dark bg |
| 8%  | `rgba(255,255,255,0.08)` | Hover fills on dark bg |

---

## Typography

### Font Families

| Role | Font | Fallback Stack |
|---|---|---|
| **Primary (Sans)** | Space Grotesk | `'Helvetica Neue', Helvetica, sans-serif` |
| **Mono (Labels)** | JetBrains Mono | `'SF Mono', ui-monospace, monospace` |
| **Serif (Display)** | Playfair Display | `'Times New Roman', Georgia, serif` |

### Type Scale (Mobile-Adapted)

| Role | Font | Weight | Size | Letter-Spacing | Line-Height |
|---|---|---|---|---|---|
| **Large headline** | Space Grotesk | 700 | 28–36px | -0.035em | 0.96 |
| **Section title** | Space Grotesk | 600 | 20–24px | -0.025em | 1.3 |
| **Card title** | Space Grotesk | 600 | 16px | -0.02em | 1.3 |
| **Body** | Space Grotesk | 400 | 15px | normal | 1.75 |
| **Small body** | Space Grotesk | 400 | 14px | normal | 1.65 |
| **Eyebrow / Label** | JetBrains Mono | 400–500 | 11px | 0.14–0.16em | normal |
| **Eyebrows are always** | — | — | uppercase | — | — |
| **Editorial headline** | Playfair Display | 400–700 | 24–32px | normal | 1.1 |

---

## Buttons

### Pill Button (Primary Pattern)

```
Height:        52px (48px on compact mobile)
Padding:       0 32px
Border-radius: 999px (fully rounded)
Font-size:     14px
Font-weight:   500
Letter-spacing: 0.01em
```

### Variants

| Variant | Background | Border | Text Color |
|---|---|---|---|
| **Solid** | `#0A0A0A` | none | `#FFFFFF` |
| **Outline** | transparent | `1px solid rgba(10,10,10,0.12)` | `rgba(10,10,10,0.55)` |
| **Outline Light** (on dark) | transparent | `1px solid rgba(255,255,255,0.25)` | `#FFFFFF` |

### Hover/Press States

- Solid hover: opacity 0.85, shadow `0 8px 28px rgba(0,0,0,0.22)`
- Outline hover: border `rgba(10,10,10,0.25)`, text `#0A0A0A`
- All transitions: `cubic-bezier(0.16, 1, 0.3, 1)` — smooth, slightly springy

---

## Cards & Surfaces

| Property | Value |
|---|---|
| **Card radius** | `20px` |
| **Large container radius** | `24px` |
| **Pill radius** | `999px` |
| **Card border** | `1px solid rgba(10,10,10,0.06)` |
| **Card shadow** | `0 30px 80px rgba(0,0,0,0.12), 0 8px 24px rgba(0,0,0,0.06)` |
| **Card hover bg** | `#f0ece7` (warm beige tint) |
| **Card padding (mobile)** | `28px 20px` |
| **Card padding (desktop)** | `40px 32px` |

---

## Spacing

Base unit: **8px**

| Scale | Value |
|---|---|
| xs | 8px |
| sm | 16px |
| md | 24px |
| lg | 32px |
| xl | 40px |
| 2xl | 48px |
| 3xl | 64px |
| 4xl | 96px |

---

## Animations & Transitions

| Animation | Description |
|---|---|
| **Fade up** | opacity 0→1, translateY 40px→0 |
| **Fade in** | opacity 0→1 |
| **Card entrance** | opacity 0→1, translateY 60px→0, scale 0.97→1 |
| **Float** | Continuous gentle vertical float (-8px) |

**Standard easing:** `cubic-bezier(0.16, 1, 0.3, 1)` — use everywhere for consistency.

On mobile, keep animations **subtle and fast** (200–300ms).

---

## Shadows

| Context | Value |
|---|---|
| **Card (resting)** | `0 30px 80px rgba(0,0,0,0.12), 0 8px 24px rgba(0,0,0,0.06)` |
| **Button hover** | `0 4px 20px rgba(0,0,0,0.08)` |
| **Button active** | `0 8px 28px rgba(0,0,0,0.22)` |
| **Card hover** | `0 20px 60px rgba(0,0,0,0.08)` |
| **Nav bar** | `0 1px 0 rgba(0,0,0,0.06)` |

---

## Copy & Voice

- **Short sentences:** 8–16 words, one idea per sentence
- **Button labels:** `[Verb] + [Noun]` → "Start saving", "View balance", "Request loan"
- **Plain verbs:** use, start, build, connect, save, send, view
- **Banned words:** "leverage", "utilize", "synergize", "seamless", "revolutionary", "empower", "unleash", "disrupt", "innovative"
- **Tone:** Clear, direct, professional but warm

---

## Design Personality Summary

**Warm minimalism.** Dark ink on white paper. A muted brown hero palette (`#8B3A2F`). Monospace eyebrow labels for a technical-but-approachable feel. Generous spacing. Subtle shadows. Fully-rounded pill buttons. The aesthetic is confident and restrained — never loud, never cluttered.

---

## Mobile-Specific Guidance

- Use `Paper` (#FFFFFF) as default screen background
- Use `Cream` (#FAF6F1) for dashboard/savings summary cards
- Use `Hero Brown` (#8B3A2F) for top navigation bar or status bar tint
- Tab bar icons: `Ink 40%` inactive, `Ink` active
- Input fields: `1px solid rgba(10,10,10,0.12)` border, `20px` radius, `16px` internal padding
- Toast/snackbar: `#1A1A1A` background, white text, `20px` radius
- Bottom sheet: `24px` top radius, `Paper` background, subtle card shadow
