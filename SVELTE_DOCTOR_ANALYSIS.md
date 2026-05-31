# Svelte Doctor Diagnostic Analysis — Homebody

**Scan Date:** 2026-05-30  
**Files Scanned:** 909  
**Total Errors:** 33  
**Total Warnings:** 598

---

## Error Breakdown by Rule

### 1. `no-legacy-lifecycle` — 16 errors (Correctness)
**Root Cause:** Svelte 5 projects should use `$effect()` instead of `onMount`, `onDestroy`, `beforeUpdate`, `afterUpdate`.

| File | Line | What To Do |
|------|------|------------|
| `src/lib/components/video/MuxPlayer.svelte` | 2 | Replace `onMount` with `$effect(() => { ... })` |
| `src/lib/features/app/components/AppLayout.svelte` | 2 | Replace `onMount` with `$effect()` |
| `src/lib/features/app/components/AppSidebar.svelte` | 2 | Replace `onMount` with `$effect()` |
| `src/lib/features/calendar/components/CustomerBookingCalendar.svelte` | 2 | Replace `onMount` with `$effect()` |
| `src/lib/features/credits/CreditCostTooltip.svelte` | 3 | Replace `onMount` with `$effect()` |
| `src/lib/features/dashboard/components/MemberLatestVideosRail.svelte` | 2 | Replace `onMount` with `$effect()` |
| `src/lib/features/landing-spine/components/ConceptLanding.svelte` | 2 | Replace `onMount` with `$effect()` |
| `src/lib/features/landing-spine/components/SpineConnector.svelte` | 3 | Replace `onMount` with `$effect()` |
| `src/lib/features/landing-spine/components/SpineScene.svelte` | 2 | Replace `onMount` with `$effect()` |
| `src/lib/features/landing-spine/components/SpineScrollBinder.svelte` | 2 | Replace `onMount` with `$effect()` |
| `src/lib/features/landing-spine/components/SpineStage.svelte` | 3 | Replace `onMount` with `$effect()` |
| `src/lib/features/live/dock/LiveDockProvider.svelte` | 2 | Replace `onMount` with `$effect()` |
| `src/lib/features/studio/components/LiveStudioShell.svelte` | 2 | Replace `onMount` with `$effect()` |
| `src/routes/(app)/+layout.svelte` | 26 | Replace `onMount` with `$effect()` |
| `src/routes/(app)/dashboard/+page.svelte` | 2 | Replace `onMount` with `$effect()` |
| `src/routes/(app)/אזור-אישי/+page.svelte` | 2 | Replace `onMount` with `$effect()` |

**Migration Pattern:**
```svelte
<!-- Before -->
<script>
  import { onMount } from "svelte";
  onMount(() => { setup(); return () => cleanup(); });
</script>

<!-- After -->
<script>
  $effect(() => { setup(); return () => cleanup(); });
</script>
```

---

### 2. `no-derived-side-effect` + `derived-with-side-effect` — 7 errors + 7 warnings (State & Reactivity)
**Root Cause:** `$derived` must be a **pure computation**. No state mutation, no impure function calls. Side effects belong in `$effect`.

| File | Line | Problem |
|------|------|---------|
| `OneOnOneRequestModal.svelte` | 46 | `$effect` calls `validateTimeInput()` which mutates `timeError`. The `$effect` itself is triggered by reactive deps. |
| `WeeklyAgenda.svelte` | 141 | `$effect` mutates `calendarOptions` object properties. This is a side effect. |
| `WatchShell.svelte` | 15 | `$derived` contains side effect (reads `window.location.search` which is fine, but if it triggers navigation changes...) |
| `HbBottomSheet.svelte` | 48, 58 | `$derived.by` reads DOM (`panelEl?.offsetHeight`, `window.innerHeight`) — these are fine as reads, but if they trigger layout thrashing... |
| `CardcomCheckoutDrawer.svelte` | 54 | Derived that depends on browser-only globals |
| `CardcomCheckoutModal.svelte` | 55 | Same pattern |

**Fix Strategy:**
- For `OneOnOneRequestModal`: Move validation into `$effect` or reactive callbacks. Remove the `$effect` that triggers on `startTimeInput` change and instead make `timeError` a `$derived`.
- For `WeeklyAgenda`: The `$effect(() => { calendarOptions.x = y; ... })` pattern should be refactored to use `$derived` for the options object, or use `$state.raw` / restructure.
- For `HbBottomSheet`: DOM reads inside `$derived` are technically reads, not mutations. If svelte-doctor flags them, the fix is to cache values in `$effect` + `$state`.

---

### 3. `no-unsafe-html` — 4 errors (Security)
**Root Cause:** `{@html}` renders raw HTML without escaping — XSS risk if data is ever user-controlled.

| File | Line | Use Case | Risk Level | Fix |
|------|------|----------|------------|-----|
| `EquipmentIcon.svelte` | 17 | SVG path injection from internal map | **Low** — paths are hardcoded internal constants | Use `<!-- svelte-ignore no-unsafe-html -->` or refactor to render `<path>` elements directly |
| `SEO.svelte` | 176 | JSON-LD structured data | **Low** — data is programmatically generated | Use `@html` with ignore comment, or use `<script type="application/ld+json">` directly inside `{#each}` |
| `LandingCopyEditor.svelte` | 196, 250 | Preview HTML from markdown | **Medium** — could be XSS if markdown parser is compromised | Sanitize with DOMPurify before `{@html}` |

**Recommended Fix for SEO.svelte:**
```svelte
{#each allLd as item}
  {@const json = JSON.stringify(item)}
  <script type="application/ld+json">
    {json}
  </script>
{/each}
```
Actually that won't work inside `{#each}`. Better:
```svelte
{#each allLd as item}
  {@const json = JSON.stringify(item)}
  <!-- svelte-ignore no-unsafe-html -->
  {@html `<script type="application/ld+json">${json}<\/script>`}
{/each}
```
Or compute the full HTML string in a `$derived` and inject once.

---

### 4. `no-public-env-secrets` — 3 errors (Security)
**Root Cause:** Variables in `$env/static/public` are bundled into client JS. Anyone can see them.

| File | Variable | Is It Actually a Secret? |
|------|----------|--------------------------|
| `MuxPlayer.svelte` | `PUBLIC_MUX_ENV_KEY` | **No** — This is a Mux public env key, meant to be public. It's for analytics/telemetry. |
| `NotificationSettings.svelte` | `PUBLIC_VAPID_PUBLIC_KEY` | **No** — VAPID public key is **intentionally public** for Web Push. It's the private key that must be secret. |
| `push-subscribe.ts` | `PUBLIC_VAPID_PUBLIC_KEY` | **No** — Same as above. |

**Verdict:** These are FALSE POSITIVES. `PUBLIC_MUX_ENV_KEY` and `PUBLIC_VAPID_PUBLIC_KEY` are designed to be public. The svelte-doctor rule is overly broad.

**Fix:** Add `<!-- svelte-ignore no-public-env-secrets -->` comments or configure the rule to ignore these specific variable names.

---

### 5. `no-unsafe-shell` — 3 errors (Security)
**Root Cause:** `exec` / `execSync` / `spawn(..., { shell: true })` with potentially untrusted input.

| File | Line | Context |
|------|------|---------|
| `reference/livekit-components-js/.../update.ts` | 10, 13, 21 | These are in `reference/` — third-party reference code, not your source |

**Verdict:** NOT YOUR CODE. The `reference/` directory contains copied third-party code. Either:
1. Add `reference/` to `.svelte-doctorignore` (if supported)
2. Delete the `reference/` directory if no longer needed
3. Ignore these findings

---

## Warning Breakdown (Top 10 by Count)

| Rule | Count | Severity | Category |
|------|-------|----------|----------|
| `no-inline-event-handler` | 220 | Performance | Inline `onclick={() => ...}` creates new function refs each render |
| `no-repeated-derived-allocation` | 98 | Performance | Objects/arrays created inside `$derived()` churn memory |
| `no-console` | 98 | Hygiene | `console.log` left in production code |
| `no-barrel-import` | 32 | Performance | Barrel imports prevent tree-shaking |
| `no-style-tag-props` | 27 | Performance | Inline `style=` attributes |
| `no-unnecessary-state` | 27 | Performance | `$state()` on refs never reassigned |
| `no-deep-nesting` | 19 | Readability | Block nesting > 3 levels |
| `no-giant-component` | 16 | Architecture | Components > 300 lines |
| `each-missing-key` | 15 | Performance | `{#each}` without `(key)` |
| `no-hydration-mismatch-template-values` | 11 | Correctness | Browser-only values in template (SSR mismatch) |

---

## Recommended Fix Priority

### P0 — Fix Immediately (Errors)
1. **Clean up `reference/` directory** — removes 3 shell errors
2. **Migrate 16 `onMount` → `$effect`** — Svelte 5 correctness
3. **Fix 7 `$derived` side effects** — prevents subtle reactivity bugs
4. **Add ignore comments for public env vars** — 3 false positives
5. **Sanitize or document `{@html}` usage** — 4 security items

### P1 — High Impact (Warnings)
1. **Add `(key)` to `{#each}` blocks** — 15 easy wins
2. **Fix hydration mismatches** — 11 SSR correctness issues
3. **Extract inline event handlers** — 220 warnings (can be batched with find/replace)
4. **Remove `no-console`** — 98 instances (automated with lint rule)

### P2 — Refactoring
1. **Split giant components** — 16 components > 300 lines
2. **Fix barrel imports** — 32 instances in convex/
3. **Reduce deep nesting** — 19 instances

---

## Specific Code Fixes

### Fix: MuxPlayer.svelte (legacy lifecycle)
```svelte
<!-- Before -->
<script>
  import { onMount } from "svelte";
  onMount(() => {
    void import("@mux/mux-player").then(...);
    return () => syncMediaSession(null);
  });
</script>

<!-- After -->
<script>
  $effect(() => {
    void import("@mux/mux-player").then(...);
    return () => syncMediaSession(null);
  });
</script>
```

### Fix: OneOnOneRequestModal.svelte (derived side effect)
```svelte
<!-- Before -->
$effect(() => {
  if (!open) return;
  startTimeInput;
  selectedWindow;
  validateTimeInput();
});

<!-- After — make timeError derived instead -->
const timeError = $derived.by(() => {
  if (selectedWindow === null) return "";
  const minutes = parseWallTimeInput(startTimeInput);
  if (minutes === null) return "בחרי שעת התחלה תקינה";
  if (minutes < minStartMinutes || minutes > maxStartMinutes) {
    return `השעה חייבת להיות בין ${formatWallMinutes(minStartMinutes)} ל-${formatWallMinutes(maxStartMinutes)}`;
  }
  return "";
});
```
Remove the `validateTimeInput()` function and the `$effect` entirely.

### Fix: SEO.svelte (each-missing-key)
```svelte
<!-- Before -->
{#each article.tags as tag}<meta ... />{/each}
{#each alternateLanguages as alt}<link ... />{/each}

<!-- After -->
{#each article.tags as tag (tag)}<meta ... />{/each}
{#each alternateLanguages as alt (alt.lang)}<link ... />{/each}
```

### Fix: WeeklyAgenda.svelte (derived side effect)
The `$effect(() => { calendarOptions.x = y; ... })` pattern mutates a `$state` object inside `$effect`. Better approach:
```svelte
const calendarOptions = $derived({
  ...baseOptions,
  events: buildCalendarEvents(availabilityPaintMode, calendarLiveClasses),
  slotHeight: calendarSlotHeight,
  selectable: isWeekView,
  // ...etc
});
```
Or keep `$state` but update via a setter function, not mutation in `$effect`.

---

## Files to Touch

| File | Changes |
|------|---------|
| `MuxPlayer.svelte` | Remove `onMount` import, use `$effect` |
| `AppLayout.svelte` | Remove `onMount` import, use `$effect` |
| `AppSidebar.svelte` | Remove `onMount` import, use `$effect` |
| `CustomerBookingCalendar.svelte` | Remove `onMount` import, use `$effect` |
| `CreditCostTooltip.svelte` | Remove `onMount` import, use `$effect` |
| `MemberLatestVideosRail.svelte` | Remove `onMount` import, use `$effect` |
| `ConceptLanding.svelte` | Remove `onMount` import, use `$effect` |
| `SpineConnector.svelte` | Remove `onMount` import, use `$effect` |
| `SpineScene.svelte` | Remove `onMount` import, use `$effect` |
| `SpineScrollBinder.svelte` | Remove `onMount` import, use `$effect` |
| `SpineStage.svelte` | Remove `onMount` import, use `$effect` |
| `LiveDockProvider.svelte` | Remove `onMount` import, use `$effect` |
| `LiveStudioShell.svelte` | Remove `onMount` import, use `$effect` |
| `(app)/+layout.svelte` | Remove `onMount` import, use `$effect` |
| `(app)/dashboard/+page.svelte` | Remove `onMount` import, use `$effect` |
| `(app)/אזור-אישי/+page.svelte` | Remove `onMount` import, use `$effect` |
| `OneOnOneRequestModal.svelte` | Refactor `timeError` to `$derived`, remove validation `$effect` |
| `WeeklyAgenda.svelte` | Refactor `calendarOptions` mutations out of `$effect` |
| `WatchShell.svelte` | Move `window.location.search` read to `$state` + `$effect` |
| `HbBottomSheet.svelte` | Refactor DOM-reading deriveds |
| `CardcomCheckoutDrawer.svelte` | Refactor browser-only derived |
| `CardcomCheckoutModal.svelte` | Refactor browser-only derived |
| `SEO.svelte` | Add keys to `#each`, consider JSON-LD refactor |
| `NotificationSettings.svelte` | Add ignore comment for PUBLIC_VAPID_PUBLIC_KEY |
| `push-subscribe.ts` | Add ignore comment or eslint-disable |
| `EquipmentIcon.svelte` | Add ignore comment or sanitize SVG paths |
| `LandingCopyEditor.svelte` | Add DOMPurify or ignore comments |

---

## Commands

```bash
# Re-run svelte-doctor after fixes
bunx svelte-doctor

# Or if using svelte-check
bun run check
```
