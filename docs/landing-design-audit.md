# Landing Design Audit — May 2026

Scope: marketing landing (`+page.svelte`, `landing/**`, `MarketingNavbar.svelte`).

## Changes (latest pass)

### Buttons
- **Removed `hb-button--pill` everywhere on marketing** — hero, pricing, final CTA, navbar login.
- CTAs use standard variants only: `hb-button--brand`, `hb-button--paper` (no `--pill`), so global hover morph applies (`4px → 26px` in `ui.css`).
- Deleted landing-scoped pill hover overrides (`.landing .hb-button--pill:hover { border-radius: 999px }`) and matching rules in `MarketingNavbar.svelte`.
- Landing action rows keep slightly taller CTAs via `.landing .l-actions .hb-button { min-height: 50px }`.

### Footer (light + dark)
- Replaced `--media-surface` / `--media-on` dark slab with elevation stack:
  - Light: `accent-soft → surface` gradient, `--ink` text, `--line-light` top rule.
  - Dark: subtle primary tint into `--surface` / `--paper`.
- Nav links: `--muted` → `--primary` on hover; email: `--primary` with contact label block.
- No footer mesh layer (hero mesh only).

### Color hierarchy
- Hero accent: `--primary` (was `--accent-bright`).
- About photo: `accent-soft → surface → elevated` + `--line-light` border (was blush/coral mix only).
- Video preview card: warm `--primary` gradient (was `--media-surface` dark mix on light).
- Play glyph: `--primary` (was `--accent-bright`).
- Featured pricing band: `--primary` (was `--accent-bright`); card prices: `--primary`.
- Panels unchanged: canvas `--paper`, inset `--surface`, cards `--elevated`.
- No `--secondary-cool` on landing; no pill buttons on marketing.

## Prior pass (retained)

- `bits-ui` `Button.Root` + `hb-button` on all CTAs.
- Semantic tokens for cards, FAQ dividers, navbar glass.
- Hero mesh opacity `0.38`; paper scrim over video.
- `l-actions--center` for final CTA block.

## Button classes on landing

| Location | Classes |
|----------|---------|
| Navbar login | `hb-button hb-button--brand` |
| Hero primary | `hb-button hb-button--brand` |
| Hero secondary | `hb-button hb-button--paper` |
| Pricing featured | `hb-button hb-button--brand` |
| Pricing cards | `hb-button hb-button--paper` |
| Final CTA | `hb-button hb-button--brand` |

## Before / after (worst fixes)

| Issue | Before | After |
|-------|--------|-------|
| Footer on light | Heavy `--media-surface` band, low-contrast `--media-on` links | Warm `--surface` gradient, readable `--ink` / `--muted` / `--primary` |
| Video placeholder | Dark media gradient on light page | Brand pink gradient, on-primary text |
| Featured pricing | Neon `--accent-bright` block | `--primary` aligned with app chrome |
| CTAs | Pill + radius locked on hover | Standard buttons with global morph |

## Remaining risks / follow-ups

| Area | Risk | Owner |
|------|------|-------|
| About photo | Placeholder gradient until real instructor photo | Content |
| Experience video card | Styled placeholder, not real poster | Catalog |
| Hero mesh | Client-only; SSR = video + scrim | — |
| `MeshGradient` footer variant | Unused blob presets still in component | Optional cleanup |

## Verification

- `prerender = true` on `(marketing)/+page.ts`.
- Run `bun run check` after edits.
