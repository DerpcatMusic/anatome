# Design Context — AnatoMe

## Users

Hebrew-speaking women (primarily) practicing rehabilitative Pilates at home. Often managing pain, postpartum recovery, or pathology-specific needs. Mental state: cautious hope, wanting professional guidance without clinic pressure or generic fitness noise.

## Brand Personality

Warm, trustworthy, anatomically precise — **not** flashy fitness marketing. Voice: friendlier conversational Hebrew ("יאללה", direct "you") while staying clinical-credible. Three words: **מדויק · חם · שקט**.

## Aesthetic Direction

- **Landing palette (scoped to `.landing`):** vibrant coral, peach, honey, blush — warm and inviting; app chrome uses global tokens.
- **Anti-patterns:** dual warm+cool gradients on one surface, emoji clutter, MacroFlow jargon in headlines, generic AI loading copy, bounce/elastic motion on marketing UI.
- Light + dark theme; RTL-first layout.
- Typography: Secular One display, Assistant body, Gveret Levin sparingly for personal letter moments.

## Design Principles

1. **Clarity over cleverness** — one idea per block; specific CTAs; short FAQ leads.
2. **Hierarchy through rhythm** — consistent section spacing; alternate surfaces subtly; one accent wash per hero/block.
3. **Motion with purpose** — scroll reveal below fold; load stagger in hero only; respect `prefers-reduced-motion`.
4. **Delight is subtle** — domain-specific (pathology marquee pause, soft glow on featured plan), never blocking.
5. **Tokens, not one-offs** — extend `tokens.css`; landing uses `--landing-*` aliases when marketing-only.
