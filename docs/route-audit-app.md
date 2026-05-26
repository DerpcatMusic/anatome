# Authenticated app route styling audit

**Date:** 2026-05-26  
**Scope:** `src/routes/(app)/**`, `src/lib/features/app/**`, dashboard, profile, calendar (app-used), onboarding form CSS (profile edit path).

**Design stack:** `--paper` canvas → `--surface` inset → `--elevated` cards. Selection/hover/focus: `--primary` / `--accent-soft`. `--secondary-cool` only for live/group-video calendar semantics.

---

## Route inventory

| Route / alias | Page implementation | Styling surface |
|---------------|---------------------|-----------------|
| `(app)/+layout.svelte` | `AppLayout` + Convex auth context | Paper main canvas ✓ |
| `u/dashboard`, `i/dashboard`, `dashboard/+page.ts` | `AppShell` → `Dashboard` | Dashboard + `PageShell` |
| `u/calendar`, `לוח/+page.ts` | `CalendarShell` | Calendar feature CSS |
| `u/profile`, `i/profile`, `profile/+page.ts` | `ProfileShell` | Profile + `SubscriptionManager` |
| `u/+layout`, `i/+layout` | Role guard only | No local CSS |
| `u/library` | Catalog (other agent) | **Not audited** |
| `u/videos`, `i/videos`, `videos/+page.ts` | Catalog redirects | **Not audited** |
| `i/live`, `סטודיו/לייב` | Studio live | **Not audited** (live agent) |
| `watch`, `צפייה`, `live-room`, `חדר-לייב` | Watch / live room | **Not audited** |
| `one-on-one`, `u/one-on-one`, `i/one-on-one` | Redirects / thin wrappers | No scoped CSS |
| `studio/videos`, `סטודיו/וידאו` | Studio video | **Not audited** |
| `אזור-אישי/+page.ts` | Redirect | — |

Hebrew alias routes mirror the same `+page` targets above.

---

## Top issues fixed (cross-cutting)

1. **Fake card backgrounds** — `linear-gradient(135deg, var(--white), var(--white))` and white-on-paper panels replaced with `var(--elevated)` on `--paper` canvas.
2. **Wrong hover/selection hue** — Sidebar links, action cards, calendar list rows, and file-drop zones used `--surface` or blush `--secondary` for hover; aligned to `--accent-soft` + `--primary`.
3. **Duplicate elevation** — Sidebar footer dropped extra `--surface` layer on already-`--elevated` chrome.
4. **Live vs neutral color** — Group-live agenda accents moved to `--secondary-cool`; 1:1 / pending flows use pink `--primary` / `--accent-soft`.
5. **Token aliases** — On-dark text uses `--on-primary` / `--on-primary-muted` instead of raw white / rgba.

---

## Per-route before → after

### `/u/dashboard`, `/i/dashboard` (via `AppShell` → `Dashboard`)

| Before | After |
|--------|-------|
| Empty state, profile summary, subscription panel, instructor action cards: flat `--white` gradients | `background: var(--elevated)` |
| Action card hover: `--surface` (reads cool/inset on cards) | `--accent-soft` |
| Kicker numbers / edit links: `--secondary` blush as accent | `--primary` |
| Subscription warning badge: blush `--secondary` | `--warning` wash + `--ink-secondary` |
| Credit tiles: `--white` on elevated panel | `--paper` inset inside card |
| `LiveAlert` small text: hard-coded rgba white | `--on-primary-muted` |

### `/u/calendar`

| Before | After |
|--------|-------|
| Filter chips, pending panel, agenda stream: `--white` | `--elevated` |
| List row hover: `color-mix(--surface …)` | `--accent-soft` |
| Group-live list border / featured card: warm `--secondary` | `--secondary-cool` (live context) |
| 1:1 pending banner: `--secondary-soft` + blush border | `--accent-soft` + `--primary` |
| Day headers: `color-mix(surface, white)` | `--surface` |
| Instructor avatar ring: `color-mix(…, white)` | `--line-light` + `--accent-soft` |

### `/u/profile`, `/i/profile`

| Before | After |
|--------|-------|
| Profile view / form sections: white→surface gradients | `--elevated` |
| Form inputs on elevated section: `--white` | `--paper` |
| File-drop hover: `--secondary` border | `--primary` + `--accent-soft` |
| Avatar placeholder gradient | `--accent-soft` + `--primary` initials |

### App chrome (all routes)

| Before | After |
|--------|-------|
| Nav hover/active: `--surface` + blush text | `--accent-soft` + `--primary` accent bar |
| Footer: stacked `--surface` on `--elevated` sidebar | Border only (no extra fill) |
| `PageShell` badge / skeleton: `--white` / `--surface` | `--accent-soft` / `--elevated` |
| Locked / skeleton shells: `--white` | `--elevated` |

### Onboarding form (profile edit + session flow)

| Before | After |
|--------|-------|
| Form panel: `--white` | `--elevated` |
| Success mark / notes focus: `--secondary` | `--primary` + focus ring |
| Notes textarea: `--white` | `--paper` |

---

## Files changed

- `src/lib/features/app/components/AppSidebar.css`
- `src/lib/features/app/components/PageShell.svelte`
- `src/lib/features/app/components/AppSkeleton.svelte`
- `src/lib/features/app/components/AppLocked.svelte`
- `src/lib/features/app/components/AppShell.svelte`
- `src/lib/features/dashboard/components/Dashboard.svelte`
- `src/lib/features/dashboard/components/InstructorActions.svelte`
- `src/lib/features/dashboard/components/ProfileSummary.svelte`
- `src/lib/features/dashboard/components/SubscriptionManager.svelte`
- `src/lib/features/dashboard/components/SubscriptionPlanModal.svelte`
- `src/lib/features/dashboard/components/LiveAlert.svelte`
- `src/lib/features/calendar/styles/agenda-card.css`
- `src/lib/features/calendar/styles/agenda-list.css`
- `src/lib/features/calendar/components/CalendarShell.svelte`
- `src/lib/features/calendar/components/BookingAgendaList.svelte`
- `src/lib/features/calendar/components/OneOnOneRequestModal.svelte`
- `src/lib/features/calendar/components/CustomerBookingCalendar.svelte`
- `src/lib/features/calendar/components/InstructorAvatar.svelte`
- `src/lib/features/profile/components/ProfileShell.svelte`
- `src/lib/features/profile/components/MemberProfileView.svelte`
- `src/lib/features/profile/components/InstructorProfileView.svelte`
- `src/lib/features/profile/components/AvatarUpload.svelte`
- `src/lib/features/onboarding/components/OnboardingForm.css`
- `src/lib/features/onboarding/components/steps/NotesStep.svelte`

---

## Left for other agents

| Area | Reason |
|------|--------|
| `u/library`, public `library/*`, `u/videos` catalog UI | Catalog agent scope |
| `i/live`, `i/videos`, `studio/videos`, live room, watch | Live/studio agent scope |
| `AppSidebar.svelte` debug ingest `fetch` (session `dcdf18`) | Instrumentation; remove when debugging ends |
| Compliance / subscription **success** greens (`--success`) | Semantic status, not selection chrome |
| `hb-button` vs raw `<button class="hb-button">` | Sidebar sign-out/theme remain native buttons; profile/calendar already use `Button.Root` where added |

---

## Verification

Run: `bun run check`
