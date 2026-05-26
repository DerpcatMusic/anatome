# Video library & catalog route audit

**Date:** 2026-05-26  
**Scope:** Public/member catalog, legacy library shell, watch player, Hebrew aliases. Excludes landing, app shell chrome, live, studio.

## Token rules applied

| Rule | Implementation |
|------|----------------|
| Hero gradients | `linear-gradient(145deg, var(--accent-soft), var(--elevated))` on `.videos-hero-block` only |
| Surface stack | `--paper` canvas (catalog page, `/library` main), `--elevated` cards, `--surface` inset (row counts, credits pill) |
| `--secondary-cool` | Video eyebrows, card status/owned ring, credits badge icon, rail focus — not blush `--secondary` washes |
| No stray accents | Removed warning radial on Macroflow hero; rail hover uses `--accent-soft` not blush color-mix |

Shared styles live in `src/lib/features/videos/videos-feature.css` (replaces per-component `*Shell.css` / `CatalogBrowse.css`).

---

## Routes

### `/library` (+ `+layout.svelte`, `+page.ts` prerender)

| Item | Notes |
|------|--------|
| **Entry** | `CatalogRoute` → `CatalogShell` |
| **Layout** | Marketing navbar; `catalog-layout-main` uses `--paper` full-bleed |
| **Auth** | Signed-in customers → `/u/library`; staff → `/i/videos` |
| **Styling** | Split catalog: sticky rail `--paper`, main `--paper`, zone titles uppercase |
| **Empty** | `t.catalog.macroEmpty()` when catalog resource returns null |

### `/u/library` (app shell)

| Item | Notes |
|------|--------|
| **Entry** | Same `CatalogRoute` / `CatalogShell` with `inAppShell` |
| **Styling** | `.catalog-page--app` — full height, reduced scroll-margin |
| **Auth** | Guests redirected to `/library` |

### `/u/videos` → `/u/library`

| Item | Notes |
|------|--------|
| **Load** | `+page.ts` 307 redirect only; no UI |

### `/videos`, `/וידאו` (app group)

| Item | Notes |
|------|--------|
| **Load** | Redirect to `/library` (public catalog) |

### `/watch` (+ `/צפייה` alias)

| Item | Notes |
|------|--------|
| **Entry** | `WatchShell` |
| **Styling** | `.videos-state-card` / `.meta-card` on `--elevated`; eyebrow `--secondary-cool` |
| **Empty** | Missing `videoId`, auth gate, playback/token errors — each with back link to `/u/library` |

### Legacy `/videos` member library (if routed via `VideosShell`)

| Item | Notes |
|------|--------|
| **Note** | `VideosShell` + `VideoLibraryShell` remain for authenticated non-staff flows that still mount them; macro hero uses `.videos-hero-block`, micro block `--elevated` flat (no gradient) |

### `/i/videos`, `/סטודיו/וידאו`, `/studio/videos`

| Item | Notes |
|------|--------|
| **Scope** | Out of this pass (studio instructor manager) |

---

## Components touched

| Component | Change summary |
|-----------|----------------|
| `CatalogShell` | `resource` + `client.query` for refetch; shared CSS import |
| `CatalogBrowse` | Layout classes in `videos-feature.css` |
| `CatalogCategoryRail` | Active/hover `--accent-soft`, accent bar `--primary` |
| `VideoLibraryShell` | Hero block tokens; dropped warning glow |
| `MicroflowCategorySection` | `--elevated` panel; video eyebrow |
| `VideoCard` | Cool accent for status/owned/focus |
| `MacroflowCreditsBadge` | Elevated/surface gradient; cool icon ring |
| `WatchShell` / `VideosShell` | Unified state/eyebrow classes |

---

## Follow-ups (not in scope)

- `CatalogMemberBar.svelte` — unused; remove or wire if product wants member bar back
- Rail `aria-current` polish (see `docs/catalog-library-audit.md`)
- Run `bun run check` locally after pull (agent env lacked `bun` on default PATH)
