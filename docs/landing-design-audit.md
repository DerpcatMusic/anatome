# Landing Design Audit — May 2026

Scope: marketing landing (`+page.svelte`, `landing/**`, `MarketingNavbar.svelte`).

## Unified semantic tokens (May 2026)

| Role | Token | Landing usage |
|------|-------|----------------|
| Canvas | `--background` | Panels, hero scrim mix |
| Inset band | `--muted` | About, experience, FAQ, CTA sections |
| Raised | `--card` | Pillars, pricing tiers |
| Brand CTA | `--primary` / `--primary-foreground` | Buttons, featured pricing, video card gradient |
| Warm accent | `--secondary` | Hero headline accent, step timeline, macro pillar |
| Cool accent | `--accent` | Live pillar border only |
| De-emphasized text | `--foreground-muted` | Leads, body copy |
| Wash | `--primary-subtle` | FAQ open, footer gradient |

Removed: `--landing-*`, `--accent-bright`, separate marketing hues.

## Layout (May 2026)

- Section padding: `--l-section-y: clamp(2.5rem, 6vw, 4rem)`
- Hero spacer: `min(72vh, 640px)` (was full viewport dead scroll)
- Steps: numbered timeline with `--secondary` border (not 3 identical cards)
- Pillars: semantic left borders (`--secondary` / `--primary` / `--accent`)
- Mesh: blob colors from computed `--primary`, `--secondary`, `--accent`

## Buttons

| Location | Classes |
|----------|---------|
| Navbar login | `hb-button hb-button--brand` |
| Hero primary | `hb-button hb-button--brand` |
| Hero secondary | `hb-button hb-button--paper` |
| Pricing featured | `hb-button hb-button--brand` |
| Pricing cards | `hb-button hb-button--paper` |
| Final CTA | `hb-button hb-button--brand` |

## Verification

- `prerender = true` on `(marketing)/+page.ts`.
- Run `bun run check` after edits.

## Remaining follow-ups

| Area | Notes |
|------|-------|
| About photo | Placeholder until real instructor photo |
| Experience video | Styled placeholder, not real poster |
| Hero mesh | Client-only; SSR = video + scrim |
