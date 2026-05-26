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
- Hero spacer: full viewport (`100svh`) with fixed hero; panels scroll over
- About: credential cards + instructor narrative (no years stat badge)
- Experience: pinned bento chapter on desktop — scroll spawns tiles one-by-one, then releases
- Steps: numbered timeline with scrubbed progress line (desktop)
- Pillars: semantic left borders (`--secondary` / `--primary` / `--accent`)
- Mesh: blob colors from computed `--primary`, `--secondary`, `--accent`

## Scroll motion (May 2026)

- **Library:** `gsap` + `ScrollTrigger`, lazy-loaded from [`landing-scroll.ts`](../src/lib/features/landing/lib/landing-scroll.ts)
- **Hero:** media/scrim fade on scroll-out
- **About:** photo Y-parallax (`data-landing-about-photo`)
- **Experience:** pin + scrub sequential tile spawn (`data-bento-pinned`, `.experience-bento__track`)
- **Steps:** progress line `scaleY` scrub; step highlight class
- **Pricing:** one-shot featured glow (`.pricing__featured--glow`)
- **Reduced motion:** all pin/scrub disabled; Experience uses `.experience-scroll__fallback` stack

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
