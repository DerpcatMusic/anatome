# Catalog `/library` audit (2026-05-25)

## Audit Health Score

| # | Dimension | Score | Key finding |
|---|-----------|-------|-------------|
| 1 | Accessibility | 3 | Carousel keyboard OK; rail needs `aria-current` on active (follow-up) |
| 2 | Performance | 3 | Lazy images; IntersectionObserver scoped to catalog |
| 3 | Theming | 4 | Tokens used; minimal hard-coded |
| 4 | Responsive | 3 | Full-bleed layout; mobile rail horizontal strip |
| 5 | Anti-patterns | 3 | Reduced copy bloat post-distill; zone titles uppercase intentional |
| **Total** | | **16/20** | **Good** |

## Fixes applied this pass

- **P0** `macroDescSignedIn({ count })` → `macroDescSignedIn(ownedMacroflowCount)` (typesafe-i18n positional arg).
- **P1** Removed redundant headers, leads, eyebrows, row titles, category subtitles in feed.
- **P1** Full-bleed split: rail flush to edge, no page max-width padding.
- **P1** Structure: **MACROFLOW** (large) → carousels → rule → **MICROFLOW** (large) → category title + carousel per category.

## Recommended next

1. `/polish` — rail `aria-current="true"` on active item.
2. `/adapt` — verify touch targets on rail buttons ≥44px.
