# Design Context — AnatoMe

## Users

Hebrew-speaking women (primarily) practicing rehabilitative Pilates at home. Often managing pain, postpartum recovery, or pathology-specific needs. Mental state: cautious hope, wanting professional guidance without clinic pressure or generic fitness noise.

## Brand Personality

Warm, trustworthy, anatomically precise — **not** flashy fitness marketing. Voice: friendlier conversational Hebrew ("יאללה", direct "you") while staying clinical-credible. Three words: **מדויק · חם · שקט**.

## Aesthetic Direction — Mindful Flow

Earthy, grounded luxury inspired by sage/forest/clay tones. Soft minimalism: tonal surfaces, gentle elevation, glass chrome, editorial labels.

- **Semantic colors (`tokens.css`):** one palette for marketing and app — no landing-only color tokens.
  - `--background` — warm stone canvas (`#fbf9f4` light)
  - `--foreground` / `--foreground-muted` — deep forest text and sage-muted body copy
  - `--muted` / `--card` — inset bands and raised surfaces (tonal elevation steps)
  - `--primary` — deep forest (`#18241b`) — CTAs, key links, featured pricing, anchor text
  - `--secondary` — sage (`#566342`) — eyebrows, tags, step highlights, accents
  - `--accent` — clay (`#351c00`) — live, video, warm tertiary moments
  - `--destructive` / `--success` / `--warning` — state
- **Legacy aliases:** `--paper` → `--background`, `--surface` → `--muted`, `--elevated` → `--card`, `--secondary-cool` → `--accent`
- **Subtle washes:** `--primary-subtle`, `--secondary-subtle`, `--accent-subtle` (legacy `--accent-soft` → `--primary-subtle`)
- **Elevation:** `--shadow-ambient` — soft diffuse shadow (`0 40px 40px -20px` forest tint); prefer over harsh borders on cards
- **Glass:** `--glass-bg` / `--glass-blur` (40px) for nav and overlays
- **Shape:** `--radius-xl` (24px) cards, `--radius-pill` CTAs on marketing
- **Typography:** Secular One display, Assistant body, Gveret Levin sparingly. Editorial eyebrows: mono, uppercase, tracked, `--secondary` color (`.l-eyebrow`)
- **Credit coins (psychology):** vod → violet (learning/recorded), live → blue (together/live group), 1:1 → gold (premium/private). Prestige scales with unit price — richer rim/glow on `oneOnOne`.
- **Anti-patterns:** dual warm+cool gradients on one surface, emoji clutter, MacroFlow jargon in headlines, generic AI loading copy, bounce/elastic motion on marketing UI, pink/coral legacy brand hues.
- Light + dark theme (dark = cool forest neutrals); RTL-first layout.

## Design Principles

1. **Clarity over cleverness** — one idea per block; specific CTAs; short FAQ leads.
2. **Hierarchy through rhythm** — generous section spacing; alternate surfaces subtly; one accent wash per hero/block.
3. **Motion with purpose** — scroll reveal below fold; hero breath on background (respect `prefers-reduced-motion`); load stagger in hero only.
4. **Delight is subtle** — domain-specific (pathology marquee pause, soft glow on featured plan), never blocking.
5. **Tokens, not one-offs** — extend `tokens.css`; use semantic roles everywhere.
