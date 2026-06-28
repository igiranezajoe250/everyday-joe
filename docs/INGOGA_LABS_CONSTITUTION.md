# The Ingoga Labs Constitution

Version 1.0 — June 2026  
Status: Living source of truth

## 1. The idea

Ingoga Labs is an independent research and development lab based in Kigali,
Rwanda. “Ingoga” means curiosity: disciplined attention directed toward
questions that matter.

The lab studies difficult systems and creates practical futures. Its work moves
across three connected scales:

1. **Human systems** — public services, education, care, access, institutions,
   culture, and social impact.
2. **Terrestrial systems** — cities, land, infrastructure, climate, real estate,
   mapping, agriculture, mobility, and the physical environment.
3. **Orbital and frontier systems** — communications, connectivity, earth
   observation, sensing, space-enabled infrastructure, and emerging technology.

Ingoga Labs is neither a conventional consultancy nor a speculative technology
brand. It is a place where evidence, engineering, design, and imagination meet.

## 2. Mission

Investigate consequential questions and turn knowledge into experiments, tools,
services, and systems that improve life in Africa and contribute useful ideas
to the world.

Ingoga Labs specifically seeks to identify where society is most vulnerable,
make those gaps legible through evidence, and design precise responses rather
than broad, generic interventions.

Current application programs include:

- **Precision medicine** — earlier insight, locally relevant diagnostics,
  prevention, treatment pathways, and care designed around people.
- **Agricultural systems** — climate, crop, soil, farmer, and market
  intelligence for resilient food systems.
- **Manufacturing systems** — stronger local production through better process,
  material, energy, quality, and workforce signals.
- **Mobility systems** — safer and more inclusive movement of people and goods
  through spatial intelligence and lived travel patterns.

## 3. Position

Ingoga Labs must feel:

- African-led, globally credible.
- Scientific, but never sterile.
- Technological, but deeply human.
- Ambitious, but grounded in evidence.
- Editorial and expressive, but structurally disciplined.
- Optimistic without becoming utopian.

It must not feel:

- Like generic corporate innovation.
- Like military or surveillance technology.
- Like neon cyberpunk science fiction.
- Like development-sector charity messaging.
- Like technology imported without local context.

## 4. Brand principles

### Curiosity is a method

Curiosity means listening carefully, naming the real problem, and remaining open
long enough for evidence to change the answer.

### Proximity before abstraction

Start close to people, place, language, and lived conditions. Models and systems
must remain accountable to reality.

### Make knowledge tangible

Research should lead to prototypes, instruments, public learning, or decisions.
Insight without application is incomplete.

### Africa is a source, not a use case

The continent is presented as a generator of knowledge, design, technology, and
new institutions—not merely a market or problem space.

### Build for long horizons

Balance immediate usefulness with the courage to explore infrastructure,
climate, intelligence, and space systems that may shape decades.

## 5. Voice and language

The voice is concise, intelligent, calm, direct, and imaginative.

Prefer:

- “We investigate complex problems and build practical futures.”
- “Bring us the hard question.”
- “Research becomes valuable when it enters the world.”
- Concrete verbs: study, listen, map, test, build, measure, connect.

Avoid:

- Empty superlatives such as revolutionary, disruptive, world-changing.
- Dense academic jargon without explanation.
- Claims of certainty where the work is exploratory.
- Savior language or reductive portrayals of African communities.

Headlines can be large, declarative, and poetic. Supporting copy should restore
precision and meaning.

## 6. Visual system

### Core palette

| Token | Value | Role |
|---|---:|---|
| `--il-blue` | `#A9D9EC` | Primary research field, optimism, atmosphere |
| `--il-blue-bright` | `#BDE9F6` | Light technical surfaces |
| `--il-night` | `#0D1011` | Depth, space, serious contrast |
| `--il-paper` | `#F1F0E9` | Editorial background, warmth |
| `--il-copper` | `#9B4F32` | Human warmth, emphasis, Rwanda-grounded earth tone |
| `--il-white` | `#F5F3EC` | Text and diagram contrast |
| `--il-line` | `rgba(13,16,17,.32)` | Rules, grids, technical structure |

Use pale cyan, paper, and near-black as fields. Copper is an accent, not a
default background. Avoid adding saturated colors unless a research domain
requires semantic distinction.

### Typography

- **Space Grotesk**: primary display and interface type.
- **Playfair Display Italic**: moments of human or conceptual emphasis.
- **JetBrains Mono**: labels, coordinates, evidence, system metadata.
- **Hanken Grotesk**: optional supporting body voice.

Display text is tightly tracked and may use extreme scale. Body text remains
comfortable, clear, and no smaller than 14px in reading contexts.

### Geometry

- Circles and orbital paths signify inquiry, systems, and changing scale.
- Fine rules, targets, coordinates, grids, and technical marks imply active
  observation.
- Large type acts as architecture.
- Image windows behave like research instruments, not ordinary cards.
- Rounded pills are reserved for small controls; major surfaces remain sharp or
  subtly rounded.

### Image direction

Images should portray:

- African researchers, technologists, communities, environments, and cities
  with dignity and contemporary specificity.
- Technical drawings, maps, prototypes, instruments, fieldwork, infrastructure,
  climate systems, and responsible frontier technology.
- Space and satellite imagery that remains scientifically grounded.

Images should combine editorial confidence with documentary or engineering
precision. Avoid stock-photo clichés, sci-fi costumes, weapons, and anonymous
“futuristic Africa” tropes.

## 7. Motion system

Motion explains scale, sequence, and discovery.

### Primary easing

- Reveal: `cubic-bezier(.19, 1, .22, 1)`
- System transition: `cubic-bezier(.25, .46, .45, .94)`
- Elastic response: `cubic-bezier(.175, .885, .32, 1.275)`
- Crossfade: linear opacity

### Timing

- Micro response: 180–350ms.
- Content reveal: 600–1000ms.
- Hero sequence: 900–1500ms with stagger.
- Ambient orbital movement: 7–20 seconds.

### Rules

- Use masked text entrances, scale settles, crossfades, orbital motion, and
  subtle depth.
- Hover motion should confirm interactivity.
- Avoid constant motion across every element.
- No motion may block reading or interaction.
- All meaningful experiences must work under `prefers-reduced-motion`.

## 8. Layout and responsiveness

Design mobile and desktop as equal expressions of the same system.

### Breakpoints

- Small mobile: 320–479px.
- Large mobile: 480–799px.
- Tablet: 800–1099px.
- Desktop: 1100px and above.

### Responsive rules

- Never rely on hover for essential content.
- Hero type must remain legible without covering the subject’s eyes or key
  interface controls.
- Research windows become smaller instruments or a horizontal strip on mobile.
- Grids collapse from three columns to one with preserved hierarchy.
- Touch targets must be at least 44px.
- Avoid horizontal page overflow; intentional horizontal tracks must be clearly
  scrollable.
- Test at 390×844, 768×1024, 1440×1000, and one width above 1600px.

## 9. Interface tokens

```css
:root {
  --il-blue: #A9D9EC;
  --il-blue-bright: #BDE9F6;
  --il-night: #0D1011;
  --il-paper: #F1F0E9;
  --il-copper: #9B4F32;
  --il-white: #F5F3EC;
  --il-line: rgba(13, 16, 17, 0.32);

  --il-font-display: var(--font-space-grotesk);
  --il-font-serif: var(--font-playfair);
  --il-font-mono: var(--font-jetbrains-mono);

  --il-ease-reveal: cubic-bezier(.19, 1, .22, 1);
  --il-ease-system: cubic-bezier(.25, .46, .45, .94);
  --il-ease-elastic: cubic-bezier(.175, .885, .32, 1.275);

  --il-space-1: 4px;
  --il-space-2: 8px;
  --il-space-3: 12px;
  --il-space-4: 16px;
  --il-space-5: 24px;
  --il-space-6: 32px;
  --il-space-7: 48px;
  --il-space-8: 72px;

  --il-radius-control: 999px;
  --il-radius-panel: 2px;
}
```

## 10. Content architecture

The core public narrative should generally follow:

1. A bold question or future-facing proposition.
2. A concise explanation of Ingoga Labs.
3. Research domains.
4. Method: listen, investigate, make, learn in public.
5. Active explorations and evidence.
6. Collaboration invitation.
7. Clear contact and location.

New pages should connect back to this narrative rather than behaving like
unrelated microsites.

## 11. Technical and ethical standards

- Prioritize semantic HTML and keyboard access.
- Maintain WCAG AA contrast for reading text.
- Optimize generated imagery before production where practical.
- Do not fabricate research results, partners, metrics, or deployed projects.
- Label speculative work clearly as concepts, prototypes, or explorations.
- Protect community data, privacy, and consent.
- Treat AI as an assistive research tool, not an unquestioned authority.
- Prefer maintainable CSS and components over one-off visual hacks.

## 12. Decision test

Before shipping a change, ask:

1. Does this make Ingoga Labs feel more curious, rigorous, and useful?
2. Is it grounded in Kigali and African agency without becoming geographically
   narrow?
3. Does the design connect humanity, land, infrastructure, and frontier
   technology?
4. Is the content honest about what is research, prototype, and reality?
5. Does it remain coherent, accessible, and responsive?

If the answer to two or more questions is no, revise the work.

## 13. Governance

This constitution is living. Update it when:

- The lab formally adds or removes a research domain.
- The brand voice or visual system changes materially.
- New ethical commitments are adopted.
- Repeated design exceptions reveal a missing rule.

Do not change it merely to justify an isolated design choice. Lasting changes
should make the system clearer, not looser.
