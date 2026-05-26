# Marketing / legal / public routes audit (2026-05-26)

## Scope

| Area | Paths | Owner |
|------|-------|-------|
| Legal | `src/routes/(marketing)/legal/**` | This pass |
| Marketing chrome | `src/routes/(marketing)/+layout.svelte`, `MarketingNavbar.svelte` | Shared (landing agent owns `+page.svelte` hero) |
| Public catalog | `src/routes/library/**` | Uses same navbar; token audit only |
| Out of scope | `src/routes/(marketing)/+page.svelte`, `landing.css`, hero | Landing agent |

## Audit health

| # | Dimension | Score | Finding |
|---|-----------|-------|---------|
| 1 | Token stack | 4 | Legal pages use `--paper` / `--surface` / `--ink` / `--muted`; no sage or hard-coded hex |
| 2 | Button system | 4 | No `.button` on legal routes; navbar uses `hb-button` |
| 3 | Focus / a11y | 3 | Pink `--primary` focus on legal links + navbar; hb-button focus still `--secondary` globally |
| 4 | Chrome / nav | 3 | Sticky `MarketingNavbar`; legal had no footer/back — fixed |
| 5 | Duplication | 4 | Five duplicate `@import "../legal.css"` — consolidated to `legal/+layout.svelte` |
| **Total** | | **18/20** | **Good** |

## Issues found

### P1 — Legal chrome incomplete

- **Symptom:** Legal pages ended abruptly (navbar only, no cross-links or home escape).
- **Fix:** `legal/+layout.svelte` with token-based footer; per-page `legal-nav` back link.

### P1 — Styles duplicated per page

- **Symptom:** Each of 5 pages `@import "../legal.css"` in `<style>`.
- **Fix:** Single import in `legal/+layout.svelte`.

### P2 — Typography / hierarchy

- **Symptom:** Global `h1` weight 800 conflicted with legal doc tone; eyebrow matched global `.eyebrow` muted style inconsistently.
- **Fix:** Scoped `font-display` on legal `h1`, `ink-secondary` eyebrow, explicit `h2` ink color.

### P2 — Focus ring on marketing nav link

- **Symptom:** `MarketingNavbar` link focus used `--secondary` (blush); product rule prefers pink primary for focus on marketing chrome.
- **Fix:** `outline-color: var(--primary)` on `.navbar__link:focus-visible`.

### P3 — Legacy `.button` in `global.css`

- **Symptom:** Duplicate button system (~70 lines) parallel to `ui.css` `.hb-button`.
- **Status:** **No Svelte/HTML uses `class="button"`** (grep 2026-05-26). Only `.button-link` remains in app shells.
- **Action:** Deprecation comment added; removal deferred until landing pass confirms hero markup.

### P3 — `/library` public route

- Uses `MarketingNavbar` + catalog tokens; `--white` in one guest card (prefer `--elevated` in a future catalog pass).
- Not blocking; outside legal deliverable.

## Fixes applied

1. **`src/routes/(marketing)/legal/+layout.svelte`** — shell, shared CSS import, legal footer nav.
2. **`src/routes/(marketing)/legal/legal.css`** — shell layout, nav/back, footer, primary focus rings, display heading. Imported via `import './legal.css'` in layout script (global CSS; avoids svelte-check unused-selector warnings on child pages).
3. **All five `legal/*/+*page.svelte`** — back nav; removed per-page style blocks.
4. **`MarketingNavbar.svelte`** — primary focus on library link.
5. **`global.css`** — legacy `.button` deprecation header (no removal).

## Routes matrix

| URL | Layout stack | Background | Buttons |
|-----|----------------|------------|---------|
| `/legal/privacy` | marketing → legal | `--paper` / footer `--surface` | none |
| `/legal/terms` | same | same | none |
| `/legal/health` | same | same | none |
| `/legal/accessibility` | same | same | none |
| `/legal/cancellations` | same | same | none |
| `/library` | `library/+layout` + `MarketingNavbar` | catalog CSS | `hb-button` |
| `/` | marketing + landing (other agent) | landing scoped | `hb-button` |

## `global.css` `.button` cleanup recommendation

**Phase 1 (now):** Deprecation comment ✅ — documents that `.hb-button` is canonical.

**Phase 2 (after landing agent sign-off):**

1. Grep repo for `class="button` and `class='button` (confirm zero).
2. Remove lines ~106–172 (`.button` variants) and the `@media (max-width: 520px) { .button { width: 100%; } }` rule unless landing hero still references `.button` (currently uses `hb-button`).
3. Keep `.button-link` in `components.css` (still used by `WatchShell` / `VideosShell`).
4. Optional: align `.hero__actions` responsive rule to `.hb-button` if landing retains that wrapper.

**Risk:** Low — no production markup binds to `.button` today.

## Follow-ups (optional)

- [ ] Extract `legal-nav` into a tiny `LegalPageChrome.svelte` if copy diverges per page.
- [ ] Align `hb-button:focus-visible` to `--primary` app-wide (separate token pass).
- [ ] Add `legal/+layout.ts` `prerender = true` if not inherited (marketing layout already prerenders).

## Verification

```bash
bun run check
```
