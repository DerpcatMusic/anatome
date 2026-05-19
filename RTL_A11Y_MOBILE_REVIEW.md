# src/ Components Review: RTL Hebrew, Accessibility, Mobile Responsiveness

**Scope:** `src/` Svelte components, styles, and layouts  
**Date:** 2026-05-18  
**Reviewer:** Svelte Frontend Scout

---

## Executive Summary

The project has a **strong RTL foundation** (`lang="he" dir="rtl"`, logical CSS properties, Hebrew font stack) and **good mobile responsiveness** overall (fluid clamps, breakpoint grids, touch-friendly targets). However, there are **accessibility gaps** that block screen-reader and keyboard users, plus a handful of **RTL edge cases** where physical directional properties leak through.

| Category | Score | Critical Issues |
|----------|-------|-----------------|
| RTL Hebrew | 8/10 | 2 hardcoded directional bugs |
| Accessibility | 5/10 | Broken modal escape, missing reduced-motion, no focus rings, ARIA gaps |
| Mobile Responsive | 7/10 | `100vh` dynamic toolbar bug, a few cramped grids |

---

## 1. RTL Hebrew Support

### ✅ What's Working
- `src/app.html` declares `<html lang="he" dir="rtl">` correctly.
- CSS logical properties are used extensively: `padding-inline`, `padding-block`, `border-inline-start/end`, `margin-inline-start`, `inset-inline`, `inset-block`.
- Hebrew-aware font stack: `"Noto Sans Hebrew", "Assistant", "Arial", sans-serif`.
- `Intl.DateTimeFormat("he-IL", …)` used consistently for dates/times.
- AppSidebar active indicator uses `border-inline-end` (adapts to RTL).

### ⚠️ Issues Found

#### P0 — `SidebarItem.svelte`: Hardcoded LTR arrow
**File:** `src/components/layout/SidebarItem.svelte`  
**Line:** `.sidebar-item--current .sidebar-item__label::before { content: "→ "; }`

In RTL, the active-item arrow points the wrong way. It should be `← ` (or better, use a CSS-generated marker that flips with `dir`).

**Fix:**
```css
.sidebar-item--current .sidebar-item__label::before {
  content: "← "; /* Hebrew is RTL */
  font-family: var(--font-mono);
}
```
Or use an inline SVG/icon that respects `dir`.

---

#### P1 — `+page.svelte`: Physical `border-left` on step separators
**File:** `src/routes/+page.svelte`  
**Lines:** `.step:not(:last-child) { border-left: var(--border); }` and `.pain-item { border-left: var(--border); }`

With `dir="rtl"`, `border-left` places the border on the visual left edge. The intent is a separator between items in the text flow. If the page were ever mirrored to LTR, these would break. Best practice: use logical properties.

**Fix:**
```css
.step:not(:last-child) { border-inline-end: var(--border); }
.pain-item { border-inline-start: var(--border); }
```

---

#### P1 — `InstructorVideoManager.svelte`: Physical `right` on badge
**File:** `src/components/app/InstructorVideoManager.svelte`  
**Line:** `.thumb-badge { position: absolute; top: var(--space-2); right: var(--space-2); }`

In RTL, the badge should anchor to the visual start edge (`inset-inline-end`).

**Fix:**
```css
.thumb-badge {
  position: absolute;
  inset-block-start: var(--space-2);
  inset-inline-end: var(--space-2);
}
```

---

#### P1 — `LiveRoomShell.svelte`: Physical `left` on control bar
**File:** `src/components/live/LiveRoomShell.svelte`  
**Line:** `.room-controls { left: calc(var(--stats-rail-size) + …); }` and `left: 50%;`

The controls are absolutely positioned with physical `left`. In RTL, they should center via `inset-inline-start`.

**Fix:**
```css
.room-controls {
  inset-inline-start: 50%;
  transform: translateX(-50%);
}
```
(The transform is symmetric so it still works.)

---

#### P2 — `LiveRoomShell.svelte`: Explicit `direction: ltr` on workspace
**File:** `src/components/live/LiveRoomShell.svelte`  
**Line:** `.room-workspace { direction: ltr; }`

This is intentional (video grid and stats read better LTR), and the inner `.quality-panel` resets to `direction: rtl`. Not a bug, but worth documenting. The stats values are numbers so LTR display is acceptable.

---

## 2. Accessibility (a11y)

### ✅ What's Working
- Skip-to-content link present in `app.html` (`דלג לתוכן`).
- Semantic HTML: `<main>`, `<nav>`, `<aside>`, `<section>`, `<header>`, `<figure>`, `<figcaption>`, `<details>`, `<summary>`.
- `aria-label` on nav regions (`aria-label="ניווט ראשי"`, `aria-label="תפריט צד"`, etc.).
- `aria-current="page"` on active sidebar/nav links.
- `aria-live="polite"` on calendar agenda container.
- `aria-label` on live-room media controls.
- `aria-hidden="true"` on icon font spans (`Material Symbols Rounded`).
- `role="dialog"` + `aria-modal="true"` on auth card.
- `aria-label` on onboarding progress dots.
- `role="radiogroup"` on live-type switch.
- `aria-disabled="true"` on disabled sidebar items.

### ⚠️ Issues Found

#### P0 — Auth overlay: Escape key handling is broken
**File:** `src/routes/+page.svelte`  
**Line:** `onkeydown={(e) => { if(e.key === "Escape") e.currentTarget.classList.remove("is-open"); }}`

The overlay has `tabindex="-1"`. It will **not** receive keyboard events when focus is inside the form (which it is — focus moves to the first input on open). The Escape handler only fires if the overlay itself has focus. Users cannot close the modal with Escape.

**Fix:** Add a global `keydown` listener in `AuthPanel.svelte` or the landing page script that closes the overlay when Escape is pressed regardless of focus location. Also remove `role="button"` from the backdrop (see next issue).

---

#### P0 — Auth overlay: `role="button"` on backdrop is semantically wrong
**File:** `src/routes/+page.svelte`  
**Line:** `<div id="auth-overlay" class="auth-overlay" role="button" tabindex="-1" …>`

A modal backdrop is not a button. `role="button"` + `tabindex="-1"` is contradictory and confuses screen readers. It should be a `<div>` with a click handler.

**Fix:**
```svelte
<div id="auth-overlay" class="auth-overlay"
  onclick={(e) => { if(e.target === e.currentTarget) e.currentTarget.classList.remove("is-open"); }}
>
```
Remove `role="button"` and `tabindex="-1"`.

---

#### P0 — No `prefers-reduced-motion` support
**Files:** `src/styles/global.css`, `src/components/app/AppLayout.svelte`, `src/components/app/AppShell.svelte`, `src/components/app/OnboardingForm.svelte`, `src/routes/+page.svelte`

Multiple background mesh-drift animations run unconditionally. Users with vestibular disorders (motion sickness, vertigo) have no way to disable them.

**Fix:** Wrap all animated backgrounds in a media query:
```css
@media (prefers-reduced-motion: no-preference) {
  @keyframes mesh-drift { … }
  .animated-bg { animation: mesh-drift 20s ease-in-out infinite alternate; }
}
```
Also disable `scroll-behavior: smooth` for reduced-motion users.

---

#### P0 — Focus indicators insufficient or missing
**Files:** `src/components/ui/Input.svelte`, `src/styles/components.css`, multiple components

`input:focus { outline: none; }` removes the default browser focus ring. The replacement is only a border-color change (`border-color: var(--sky-strong)`). This is not sufficient for keyboard users — many users rely on a visible focus ring.

**Fix:** Add an explicit focus ring:
```css
input:focus, textarea:focus, button:focus-visible, a:focus-visible {
  outline: 2px solid var(--sky-strong);
  outline-offset: 2px;
}
```
Use `:focus-visible` (not `:focus`) so mouse clicks don't show rings, but keyboard navigation does.

---

#### P1 — `Notice.svelte`: Missing `role="alert"` for errors
**File:** `src/components/ui/Notice.svelte`

Error/danger notices are not announced by screen readers because they have no live-region role.

**Fix:**
```svelte
<script>
  let { tone = "neutral", children } = $props();
</script>
<p class={`notice notice--${tone}`} role={tone === "danger" ? "alert" : undefined}>
  {@render children?.()}
</p>
```
Optionally add `aria-live="polite"` for neutral notices.

---

#### P1 — `CalendarShell.svelte`: Day buttons missing selected state for AT
**File:** `src/components/app/CalendarShell.svelte`

Day strip buttons use visual-only active styling (`class:day-strip__day--active`). Screen readers cannot tell which day is selected.

**Fix:** Add `aria-pressed={day.date === selectedDay}`:
```svelte
<button
  type="button"
  class:day-strip__day--active={day.date === selectedDay}
  class="day-strip__day"
  aria-pressed={day.date === selectedDay}
  onclick={() => { selectedDay = day.date; }}
>
```

---

#### P1 — `AppSkeleton.svelte`: Loading state invisible to screen readers
**File:** `src/components/app/AppSkeleton.svelte`

Skeleton loaders have no `aria-busy="true"`, `role="status"`, or visually-hidden text. Screen reader users hear silence during loading.

**Fix:**
```svelte
<div class="loading" role="status" aria-busy="true" aria-live="polite">
  <span class="visually-hidden">טוען תוכן...</span>
  …
</div>
```

---

#### P1 — Hidden radio/checkbox inputs may create ghost tab stops
**Files:** `src/components/app/OnboardingForm.svelte`, `src/components/ui/EquipmentPicker.svelte`

Inputs are hidden with `position: absolute; opacity: 0;`. They remain in the keyboard tab order but are invisible. This creates a confusing experience where focus seems to "disappear".

**Fix:** Use a visually-hidden pattern that keeps inputs screen-reader accessible but removes them from the tab order, or ensure labels are focusable and forward focus to inputs:
```css
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```
Alternatively, keep the input in tab order but make sure the label has a visible focus indicator when the input is focused (using `:focus-visible + span` or `:has(input:focus-visible)`).

---

#### P2 — `Input.svelte`: No `aria-invalid` or `aria-describedby`
**File:** `src/components/ui/Input.svelte`

When a form field has an error, there's no programmatic linkage between the input and its error message.

**Fix:** Accept optional `error` prop and wire it up:
```svelte
<input
  bind:value {name} {type} {autocomplete} {inputmode} {required}
  aria-invalid={!!error}
  aria-describedby={error ? `${name}-error` : undefined}
/>
{#if error}
  <span id="{name}-error" class="error-text" role="alert">{error}</span>
{/if}
```

---

#### P2 — `ProfileShell.svelte`: File drop zone keyboard trap risk
**File:** `src/components/app/ProfileShell.svelte`

The file input inside `.file-drop` uses `position: absolute; opacity: 0;` but the parent `<label>` has no `position: relative`. The invisible input may stretch to the nearest positioned ancestor, creating a large invisible clickable/tappable area.

**Fix:**
```css
.file-drop {
  position: relative; /* contain the absolute child */
  …
}
.file-drop input {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
}
```

---

## 3. Mobile Responsiveness

### ✅ What's Working
- Fluid typography via `clamp()` on type scale tokens.
- CSS Grid with `auto-fit`/`auto-fill` + `minmax()` for video grids, instructor actions.
- Breakpoint-based stacking: landing page, dashboard, studio, calendar all collapse gracefully.
- Navbar hides tagline at <520px.
- Buttons go full-width at <520px.
- Calendar day strip is horizontally scrollable (`overflow-x: auto`).
- Touch targets are mostly ≥44px (buttons, day strip items).
- Live room has dedicated mobile breakpoint at <47.5rem.

### ⚠️ Issues Found

#### P1 — `100vh` causes mobile browser toolbar overlap
**Files:** `src/routes/+page.svelte`, `src/components/app/AppLayout.svelte`, `src/components/app/AppShell.svelte`, `src/components/app/OnboardingForm.svelte`, `src/components/app/OnboardingShell.svelte`, `src/components/app/ProfileShell.svelte`, `src/components/live/LiveRoomShell.svelte`

`min-height: calc(100vh - 56px)` (and similar) uses the static viewport height. On iOS Safari and Android Chrome, the browser chrome (address bar, toolbars) is dynamic — `100vh` can be taller than the visible area, causing the bottom of layouts to be hidden behind toolbars.

**Fix:** Use `dvh` (dynamic viewport height) with fallback:
```css
min-height: calc(100vh - 56px);
min-height: calc(100dvh - 56px);
```
Or set a CSS custom property:
```css
:root {
  --viewport-height: 100vh;
  --viewport-height: 100dvh;
}
```

---

#### P2 — `LiveRoomShell.svelte`: No touch-action optimization
**File:** `src/components/live/LiveRoomShell.svelte`

The live room is a full-screen fixed-position interface. Double-tap-to-zoom and pinch-zoom may interfere with controls. Not critical, but adding `touch-action: manipulation` to buttons would prevent double-tap zoom delays on older browsers.

**Fix:**
```css
.room-controls button,
.room-controls a {
  touch-action: manipulation;
}
```

---

#### P2 — `Notice.svelte`: Long Hebrew words may overflow
**File:** `src/components/ui/Notice.svelte`

Hebrew can have long compound words. Without `overflow-wrap`, notices may break layout on narrow screens.

**Fix:**
```css
.notice {
  overflow-wrap: break-word;
  word-break: break-word; /* fallback */
}
```

---

#### P2 — `OnboardingForm.svelte`: Equipment grid only drops to 2 columns
**File:** `src/components/app/OnboardingForm.svelte`

At <860px, equipment grid becomes 2 columns. On very small screens (~320–360px), two equipment cards side-by-side may be cramped (each ~140px). Not broken, but touch targets could be tight.

**Suggestion:** Add a <400px breakpoint:
```css
@media (max-width: 400px) {
  .equip-grid { grid-template-columns: 1fr; }
}
```

---

#### P2 — `Dashboard.svelte`: Live alert may overflow
**File:** `src/components/app/Dashboard.svelte`

`.live-alert { width: fit-content; }` — on very narrow screens, long text could overflow the viewport.

**Fix:**
```css
.live-alert {
  width: fit-content;
  max-width: 100%;
}
```

---

## 4. Recommended Fixes (Prioritized)

| Priority | File | Issue | Fix |
|----------|------|-------|-----|
| P0 | `src/components/layout/SidebarItem.svelte` | Hardcoded LTR arrow | Change `→` to `←` or use logical CSS marker |
| P0 | `src/routes/+page.svelte` | Broken Escape key on auth overlay | Add global `keydown` listener for Escape |
| P0 | `src/routes/+page.svelte` | Backdrop has `role="button"` | Remove `role="button"` and `tabindex="-1"` |
| P0 | Multiple | No `prefers-reduced-motion` | Wrap mesh-drift animations in media query |
| P0 | Multiple | Missing focus rings | Add `:focus-visible { outline: 2px solid … }` |
| P1 | `src/components/ui/Notice.svelte` | Errors not announced | Add `role="alert"` for danger tone |
| P1 | `src/components/app/CalendarShell.svelte` | Day buttons no AT state | Add `aria-pressed` |
| P1 | `src/components/app/AppSkeleton.svelte` | Loading invisible to AT | Add `role="status" aria-busy="true"` |
| P1 | Multiple | `100vh` mobile toolbar bug | Replace with `100dvh` |
| P1 | `src/routes/+page.svelte` | Physical `border-left` on steps | Use `border-inline-end` |
| P1 | `src/components/app/InstructorVideoManager.svelte` | Physical `right` on badge | Use `inset-inline-end` |
| P1 | `src/components/live/LiveRoomShell.svelte` | Physical `left` on controls | Use `inset-inline-start` |
| P2 | `src/components/app/OnboardingForm.svelte` | Ghost tab stops | Add visible focus indicator on custom radio/checkbox labels |
| P2 | `src/components/ui/Input.svelte` | No error linkage | Add `aria-invalid` + `aria-describedby` |
| P2 | `src/components/app/ProfileShell.svelte` | File drop positioning | Add `position: relative` to `.file-drop` |
| P2 | `src/components/ui/Notice.svelte` | Hebrew overflow | Add `overflow-wrap: break-word` |

---

*Review complete. No file reservations held.*
