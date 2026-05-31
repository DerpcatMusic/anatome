---
target: video library cards
total_score: 25
p0_count: 0
p1_count: 2
timestamp: 2026-05-30T11-56-13Z
slug: rc-lib-features-videos-components-videocard-svelte
---
# Design Critique: Video Library Cards

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Lock states clear; missing processing progress for uploads |
| 2 | Match System / Real World | 3 | Hebrew copy fixed; equipment icons abstract but legible |
| 3 | User Control and Freedom | 3 | Filters work; no bulk actions or advanced sort |
| 4 | Consistency and Standards | 3 | Cards consistent; studio vs public cards diverge in info density |
| 5 | Error Prevention | 3 | Locked preview prevents accidental plays |
| 6 | Recognition Rather Than Recall | 3 | Tags + equipment visible; no tooltip on hover for icons |
| 7 | Flexibility and Efficiency | 2 | No keyboard nav, no bulk select, no sort controls |
| 8 | Aesthetic and Minimalist Design | 2 | Cards now crowded: status + title + tags + equipment + duration |
| 9 | Error Recovery | 3 | Processing errors surfaced in studio; empty states exist |
| 10 | Help and Documentation | 2 | No inline help for access models; jargon leaks through |
| **Total** | | **25/40** | **Acceptable — significant improvements needed** |

## Anti-Patterns Verdict

**LLM assessment**: The cards no longer look AI-generated — the gradient placeholder with title initial is intentional, the sage tag pills align with the design system, and the equipment icons are custom SVG. However, the information density is pushing toward clutter. Four distinct information layers (status, title, tags, equipment) compete for attention on a 280px-wide card.

**Deterministic scan**: Clean — no automated issues detected in the markup.

## Overall Impression

The video library went from broken (missing thumbnails, rounded durations, mystery buttons) to functional. The single biggest opportunity now is **information hierarchy on the card surface**. Four data layers need to be read in <2 seconds; currently they all shout at the same volume.

## What's Working

1. **Gradient placeholder** — The `primary → secondary` gradient with the title initial is a confident fallback. It signals "this video is real, we just don't have a frame yet" rather than "something broke."
2. **Equipment icon row** — Using the existing `EquipmentIcon` SVG set keeps the visual language consistent with the calendar and onboarding. The 16px size is appropriate for the card scale.
3. **Duration accuracy** — `12:34` format is instantly scannable vs the old rounded-minute lie.

## Priority Issues

### [P1] Card Information Density
**What**: Status label + title + tag pills + equipment icons + duration badge = 5 visual layers in ~280px width.
**Why it matters**: Cognitive overload. Users scan video libraries in a grazing pattern; too much text forces them to stop and read.
**Fix**: Establish clearer hierarchy:
- Move status label into the thumbnail corner (replace or co-locate with duration)
- Reduce tag pill contrast (lower opacity background) so they read as metadata, not content
- Consider showing tags only on hover/focus to keep the default card clean

### [P1] Missing Thumbnail Backfill Strategy
**What**: New videos get signed Mux thumbnail URLs, but existing videos with `thumbnailUrl: null` stay on the gradient placeholder forever.
**Why it matters**: A library full of gradient cards looks unfinished.
**Fix**: Add a one-off Convex migration or admin action that iterates published videos without thumbnails and generates signed URLs via the Mux JWT. This is data hygiene, not frontend code.

### [P2] Equipment Icon Accessibility
**What**: Equipment icons rely on `title` attributes for labeling. Screen readers won't announce them consistently. Keyboard users can't access `title`.
**Why it matters**: WCAG violation — information is not programmatically determinable.
**Fix**: Add an `aria-label` on the equipment row container (already exists in `equipmentAriaLabel`). Ensure the VideoCard's equipment row is wrapped in a `<span>` with that label.

### [P2] Tag Clickability Expectation
**What**: Tags look like interactive pills (similar to filter chips elsewhere in the app) but are static text.
**Why it matters**: Violates recognition heuristic — users will try to click them to filter.
**Fix**: Either make tags clickable (filter the catalog by that tag) or reduce their visual affordance so they don't look like buttons. Flat text with `#` prefix instead of pill background.

### [P2] Card Body Height Instability
**What**: Videos without tags or equipment have a shorter card body than videos with both. This causes grid misalignment when cards wrap.
**Why it matters**: Visual raggedness in grid layouts looks broken.
**Fix**: Reserve min-height for the card body, or always render the tag/equipment containers (empty) to stabilize layout.

## Persona Red Flags

**Alex (Power User)**:
- No sort controls (by duration, date, popularity)
- No bulk-select for owned videos
- Filter reset is hidden in the search clear button only

**Jordan (First-Timer)**:
- "שיעורי עומק" vs "מנוי" terminology is internal jargon leaking into the UI
- Equipment icons have no visible label; Jordan won't know what the spiky ball icon means
- Tag pills look clickable but do nothing

**Sam (Accessibility)**:
- Equipment row missing accessible grouping label in VideoCard (fixed in calendar HTML but not Svelte)
- Tag pills have no semantic list structure (`<ul>` / `<li>`)
- Placeholder gradient has no `alt` text; screen reader announces "image" with no description

## Minor Observations

- The play icon on the studio "צפייה" button is a good affordance, but verify optical centering — Material Symbols can sit low.
- Tag pills use `border-radius: 2px` while the card uses `var(--border)` which may be 1px or different radius. Minor drift.
- Duration badge on thumbnail uses `var(--step--2)` which is ~11px. Verify it's still legible on mobile.

## Questions to Consider

1. What if the primary card surface showed only title + duration, and metadata (tags, equipment) revealed on hover?
2. Should the gradient placeholder include a generic video icon (e.g., `movie` Material Symbol) in addition to the letter?
3. Does the catalog need a list view option for users who prefer scanning text over thumbnails?
