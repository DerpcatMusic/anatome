# HomeBody Architecture Review

> Date: 2026-05-18
> Scope: Full-stack review of the online Pilates platform
> Tech stack: Astro 6 (static), Svelte 5 (runes), RUNED, Convex (backend + auth), LiveKit, Mux

---

## 1. Executive Summary

The app is a **well-structured Multi-Page Application (MPA)** built with Astro static generation and Svelte 5 islands. The Convex backend shows good separation of concerns (customer / instructor / admin) and solid authorization patterns. The custom auth system is intentional for MPA behavior but introduces repeated boilerplate across every page shell.

### Critical Gaps
1. **No VOD player** — `/watch?videoId=...` is linked but the route does not exist.
2. **Query refresh on every tab switch** — Full page MPA navigation destroys and recreates all islands, re-fetching all data.
3. **Duplicated backend utilities** — `missingRequiredEquipment` and `getCurrentCreditBucket` exist in two files.
4. **Race condition in class reservation** — Capacity check is non-atomic across two queries.
5. **N+1 query in calendar** — `listCalendarRange` queries reservations per-class in a loop.

---

## 2. Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│  Astro 6 (Static MPA)                                       │
│  ├── PublicLayout.astro (RTL, Hebrew, SEO, Navbar)         │
│  └── Pages: /dashboard, /calendar, /videos, /live, ...     │
│       └── Each page → <*Shell client:load />               │
├─────────────────────────────────────────────────────────────┤
│  Svelte 5 Islands                                           │
│  ├── AppShell, CalendarShell, VideosShell, ...             │
│  ├── LiveRoomShell (client:only, heavy WebRTC)             │
│  └── AuthPanel, CallbackHandler (client:only)              │
├─────────────────────────────────────────────────────────────┤
│  State & Auth                                               │
│  ├── session.svelte.ts — custom HTTP auth, tokens, role    │
│  ├── RUNED: PersistedState (localStorage), resource()      │
│  └── convex/client.ts — shared WS client (unauthenticated) │
├─────────────────────────────────────────────────────────────┤
│  Convex Backend                                             │
│  ├── Schema: 12 custom tables + authTables                 │
│  ├── Auth: Email magic-link via @convex-dev/auth           │
│  ├── LiveKit token issuance (Node action)                  │
│  └── Mux direct upload + webhook finalization              │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Convex Backend Review

### 3.1 Schema (Good)
- **12 custom tables** with well-named compound indexes (`by_status_and_startsAt`, `by_userId_and_status`, etc.)
- **High-churn separated** from stable data: `liveRooms`, `liveReservations`, `liveJoinEvents`, `videoUploads` are isolated.
- **Soft deletes** used: videos → `archived`, reservations → status transitions.

### 3.2 Auth (Good, One Issue)
- Email-only magic link auth. Token maxAge 10 minutes.
- `appProfiles` table extends `users` with role, display name, documents.
- **Issue:** `livekit.ts` uses `identity.subject` as user ID. Per Convex guidelines, prefer `identity.tokenIdentifier`.
- **Issue:** No unique constraint on `appProfiles.userId`. `getOrCreateAppProfile` could race and create duplicates.

### 3.3 Queries & Mutations (Mostly Good)

| File | Lines | Purpose |
|------|-------|---------|
| `liveClasses.ts` | 493 | Core live class CRUD + reservation + join |
| `videos.ts` | 312 | VOD listing, selection, metadata, internal upload helpers |
| `appProfiles.ts` | 256 | Profile CRUD, admin role management, audit logging |
| `users.ts` | 142 | Dashboard aggregation, onboarding completion |
| `instructorLive.ts` | 170 | Instructor scheduling, start/end live |
| `videosUpload.ts` | 143 | Mux direct upload creation, webhook handler |
| `livekit.ts` | 94 | LiveKit JWT issuance (Node action) |
| `liveReminders.ts` | 56 | Cron-fired reminder processor |
| `http.ts` | 63 | Mux webhook routing |
| `crons.ts` | 8 | 5-min reminder cron |

#### Positive Patterns
- Bounded reads with `.take(n)` almost everywhere.
- Batch fetching in `liveReminders.processDue` and `users.dashboard` to avoid N+1.
- Audit events logged for admin mutations.
- Argument validators present on all public functions.

#### Issues

**P0 — N+1 in `liveClasses.listCalendarRange`** (line ~140)
```ts
for (const liveClass of classes) {
  const allReservations = await ctx.db
    .query("liveReservations")
    .withIndex("by_liveClassId_and_status", ...)
    .take(liveClass.capacity);
}
```
For 100 classes this is 100 queries. **Fix:** Fetch all reservations for the class IDs in a single query, then group in JS.

**P0 — Race condition in `reserve` capacity check**
```ts
const active = await query(...eq("status","reserved")).take(capacity);
const joined = await query(...eq("status","joined")).take(capacity);
if (active.length + joined.length >= capacity) throw ...
```
Two separate queries + insert are not atomic. Two concurrent reservations can both succeed. **Fix:** Query both statuses in a single index query, or maintain a `seatsTaken` counter on `liveClasses`.

**P1 — Unbounded `.collect()` in `getCurrentCreditBucket`**
```ts
const buckets = await ctx.db.query("creditBuckets")
  .withIndex("by_user_period", q => q.eq("userId", userId))
  .collect();
```
In practice bounded, but if historical buckets accumulate this hits limits. **Fix:** Use `.take(10)` or `.first()` if you only need the current bucket.

**P1 — Missing pagination on list endpoints**
`videos.listAll` fetches up to 200 docs. `liveClasses.listUpcoming` fetches 100. These will break at scale.

---

## 4. Astro + Svelte 5 Frontend Review

### 4.1 Astro Configuration
- Static output (default). No server-side rendering.
- Only `@astrojs/svelte` integration registered.
- No `<ViewTransitions />`, no `clientRouter`.

### 4.2 Islands Architecture

| Directive | Components | Note |
|-----------|-----------|------|
| `client:load` | AppShell, CalendarShell, VideosShell, ProfileShell, LiveStudioShell, Navbar | Hydrates immediately |
| `client:only="svelte"` | AuthPanel, CallbackHandler, LiveRoomShell | No SSR, client-only |

**Observation:** Every app page is a thin `.astro` wrapper around a single Svelte shell. This is clean but means every navigation is a full page load with island teardown/recreation.

### 4.3 Svelte 5 Runes Usage (Excellent)
- Full adoption of `$state`, `$derived`, `$effect`, `$props()`, `$bindable()`.
- No legacy Svelte 4 stores (`writable`/`readable`) found.

### 4.4 RUNED Library Usage
- **`PersistedState`** — Token and role caching in `localStorage`.
- **`resource()`** — Used in 5 shell components for reactive async data with `loading`/`error`/`current` states.

### 4.5 `convex-svelte` Installed but Unused
`package.json` includes `convex-svelte@^0.0.12` but the frontend uses a custom `authQuery()` wrapper with `ConvexHttpClient`. This dependency can be removed.

---

## 5. Auth Architecture Review

### 5.1 Design
The auth system is **custom-built for MPA behavior**:
- Tokens stored in `localStorage` via `PersistedState`.
- `ConvexClient` WebSocket is **never authenticated** (`convex.setAuth()` not called). This avoids WebSocket reconnection/auth storms on every MPA page load.
- Auth queries create one-shot `ConvexHttpClient` instances per request, passing the token in the `auth` header.
- Auto-refresh deduplication via module-level `refreshPromise`.

### 5.2 Auth in Islands (Repeated Boilerplate)
Every shell component repeats this pattern:
```svelte
<script>
  import { initAuth } from "../lib/auth/session.svelte.ts";
  const auth = initAuth();
</script>

{#if auth.isLoading}
  <Skeleton />
{:else if !auth.isAuthenticated}
  <Unauthorized />
{:else}
  <!-- actual content -->
{/if}
```

**Problem:** This is duplicated in `AppShell`, `CalendarShell`, `VideosShell`, `ProfileShell`, `LiveStudioShell`, `InstructorVideoManager`, etc.

**Problem:** There is no server-side auth gating. A logged-out user can load `/dashboard` and sees the skeleton → unauthorized flash. Astro static pages cannot protect routes server-side without switching to `output: "server"` or `output: "hybrid"`.

### 5.3 Recommendations
1. **Extract an `AuthGuard.svelte`** component that wraps the loading/unauthorized/ready states.
2. **Consider Astro hybrid output** for critical routes if you want server-side auth redirects (requires moving auth check to Astro frontmatter).
3. **Remove `convex-svelte`** if you intend to keep the custom HTTP auth pattern.

---

## 6. LiveKit + Mux Video Review

### 6.1 LiveKit (Strong)
- Custom Svelte 5 + `livekit-client` implementation (~1,125 lines in `LiveRoomShell.svelte`).
- Proper track mounting, adaptive stream, dynacast, screen-share for instructors.
- Stats panel (bitrate, resolution, FPS, packet loss) for instructors.
- Security: 10-minute JWT, `prepareJoin` entitlement gate, role-encoded identity.

### 6.2 Mux (Functional but Incomplete)
- Direct upload flow works end-to-end (request → upload → webhook → finalize).
- **Missing:** No `/watch` page. `VideosShell.svelte` links to `/watch?videoId=...` but the route does not exist.
- **Missing:** No video player component. No `@mux/mux-player` or custom player.
- **Security gap:** `playback_policy: ["public"]` means anyone with the playback ID can watch. For a credit-based platform, use Mux signed URLs tied to the user's selection.

### 6.3 Schema Inconsistency
- `videos.provider` supports `cloudflare_stream`, `bunny_stream`, `mux`, but `_createDraftInternal` hardcodes `"mux"`.
- `VIDEO_SYSTEM_DESIGN.md` documents Cloudflare Stream architecture, but the actual implementation uses Mux.

---

## 7. Overlapping Code & Duplication

### 7.1 Backend Utilities (Extract to `convex/lib/`)

| Function | Locations | Fix |
|----------|-----------|-----|
| `missingRequiredEquipment` | `liveClasses.ts`, `videos.ts` | Extract to `convex/lib/equipment.ts` |
| `getCurrentCreditBucket` | `liveClasses.ts`, `videos.ts` | Extract to `convex/lib/credits.ts` |

### 7.2 Frontend Auth Guards
Every shell reimplements the same auth state machine. Extract `AuthGuard.svelte` or a `PageShell.svelte` that accepts an async fetcher and handles loading/error/unauthorized.

### 7.3 UI Duplication
- **Equipment picker checkbox grid** appears in `LiveStudioShell`, `InstructorVideoManager`, `VideosShell`.
- **Button/input CSS** (`.btn`, `.btn--ink`, `.field`, `.form-grid`) copy-pasted across instructor shells.
- **Skeleton loaders** duplicated in multiple shells.

### 7.4 Data Fetching Pattern
All 5 shells use the same `resource(auth.isAuthenticated, async () => authQuery(...))` pattern. This could be wrapped:
```ts
export function useAuthQuery(queryRef, args) {
  const auth = getAuthState();
  return resource(() => auth.isAuthenticated, () => authQuery(queryRef, args));
}
```

---

## 8. The Sidebar Tab Switch Problem

### Root Cause
The app is a **pure MPA**. Sidebar links are plain `<a href="...">` tags. Every tab switch triggers a full browser navigation, which:
1. Destroys all Svelte islands on the previous page.
2. Re-creates fresh islands on the new page.
3. Triggers `resource()` fetchers on mount.
4. Re-fetches all dashboard/calendar/video data from scratch.

### Current Mitigations
- `PersistedState` keeps auth tokens across pages.
- `getCachedRole()` renders the correct sidebar immediately without async fetch.
- One-shot HTTP queries avoid WebSocket subscription teardown/setup cost.

### What Is NOT Being Done
- No Astro `ViewTransitions` / `clientRouter`.
- No shared query cache across pages.
- No prefetch on sidebar hover.
- No persistent layout that survives navigation (the sidebar itself is recreated on every page).

### Solutions (Pick One)

#### Option A: Astro ViewTransitions (Recommended — Low Effort, High Impact)
Add `<ViewTransitions />` to `PublicLayout.astro` and switch sidebar links to use `data-astro-reload` only where needed.
- Astro will keep persistent DOM elements (like a shared layout) across navigations.
- Svelte islands can be marked with `transition:persist` to survive page transitions.
- This is the idiomatic Astro 6 solution for "SPA-like feel in an MPA."

#### Option B: Client-Side Router (Higher Effort)
Introduce a lightweight client-side router (e.g., `page.js` or Astro's experimental `clientRouter`) and render the app shell once, swapping only the main content area.
- More invasive but gives full SPA behavior.
- Requires rethinking the auth guard pattern.

#### Option C: Shared Query Cache (Medium Effort)
Keep a module-level Svelte `$state` cache in `src/lib/cache.svelte.ts`:
```ts
const queryCache = $state(new Map());
export function getCachedAuthQuery(key, fetcher) {
  if (!queryCache.has(key)) {
    queryCache.set(key, resource(...));
  }
  return queryCache.get(key);
}
```
- Survives across page loads because the module is re-evaluated, but `localStorage` or `sessionStorage` can persist across full reloads.
- Less effective than Option A because islands are still destroyed.

#### Option D: Hybrid Astro + Middleware (Server-Side)
Switch Astro to `output: "hybrid"` and use Astro middleware or page frontmatter to:
- Verify the JWT server-side.
- Redirect unauthenticated users before the page renders.
- Embed initial data into the HTML to avoid client-side fetch on every page.
- This eliminates the auth flash and can reduce queries, but requires the most rework.

---

## 9. Priority Action Items

### P0 — Fix Before Launch
- [ ] **Create `/watch` page** with Mux player (or custom player using `playbackId`).
- [ ] **Fix N+1 in `listCalendarRange`** — batch-fetch reservations by class ID.
- [ ] **Fix reservation race condition** — make capacity check atomic or add `seatsTaken` counter.
- [ ] **Add unique constraint** on `appProfiles.userId` to prevent duplicate profiles.

### P1 — High Impact
- [ ] **Extract `AuthGuard.svelte`** to eliminate repeated auth boilerplate in every shell.
- [ ] **Extract shared utilities** — `missingRequiredEquipment`, `getCurrentCreditBucket` to `convex/lib/`.
- [ ] **Add Astro ViewTransitions** to reduce query re-fetching and improve perceived performance.
- [ ] **Use Mux signed URLs** instead of public playback IDs for VOD.
- [ ] **Add pagination** to `videos.listAll` and `liveClasses.listUpcoming`.

### P2 — Polish
- [ ] **Extract `EquipmentPicker.svelte`** component reused across studio, upload, and video shells.
- [ ] **Extract shared CSS** for forms/buttons into `src/styles/components.css` or a CSS layer.
- [ ] **Remove `convex-svelte`** from dependencies if unused.
- [ ] **Update `VIDEO_SYSTEM_DESIGN.md`** to reflect the actual Mux implementation, or migrate to Cloudflare if that was the intent.
- [ ] **Switch `identity.subject` to `identity.tokenIdentifier`** in `livekit.ts` per Convex guidelines.

### P3 — Scale & Monitoring
- [ ] Add `convex-test` + vitest for critical paths (reservation, credit deduction, join flow).
- [ ] Run `npx convex insights --details` once deployed to validate hot paths.
- [ ] Consider a `seatsTaken` digest field on `liveClasses` to eliminate reservation count queries entirely.

---

## 10. Svelte 5 Islands + Auth — Specific Risks

1. **Auth state is module-level, not global.** Every island imports `initAuth()` and gets the same reactive object (good), but if an island mounts before `localStorage` is read, it sees `isLoading = true` until the effect runs.
2. **No server-side auth redirect.** A user sharing `/dashboard` on Twitter will have the skeleton flash publicly before the client-side auth guard kicks in.
3. **Token refresh in one island does not broadcast to others.** If two islands are on the same page (rare in this architecture), both may try to refresh a stale token simultaneously. The `refreshPromise` deduplication helps within the same module, but concurrent islands could still race if they are in separate JS chunks.
4. **LiveRoomShell is `client:only`.** This means no server-rendered fallback. On slow networks the user sees a blank area until the JS chunk loads.

---

*End of review.*
