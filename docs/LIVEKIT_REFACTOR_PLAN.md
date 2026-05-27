# LiveKit Refactor Plan — Phase 0 Discovery

**Date:** 2026-05-27  
**Remediation (2026-05-27):** Phase 2 complete — `createLiveSession()` modules, `VideoConference` + `PreJoin` in production shell, `room.svelte.ts` removed, lazy `@event-calendar` + route chunks, slim `src/lib/livekit/index.ts` barrel. **This doc is historical discovery**; see `LIVEKIT_DELETION_CANDIDATES.md` for current delete gates.

**Scope:** Align homebody live room with LiveKit Components architecture (reference: `reference/livekit-components-js/`) while preserving Convex join flow, Hebrew/RTL, and Pilates-specific UX.

---

## Executive Summary (Phase 0 snapshot — superseded)

At audit time the Svelte LiveKit library was ported, but **the app did not use prefabs for rendering**. As of remediation pass, `/חדר-לייב` uses `LiveKitRoom` + `VideoConference` + ported `PreJoin`/`ControlBar`; the notes below describe the **pre-refactor** gap:

| Layer | What runs in production | What exists but is unused |
|-------|-------------------------|---------------------------|
| Route | `src/routes/(app)/חדר-לייב/+page.svelte` → `LiveRoomShell` | — |
| Pre-connect | `PreConnectOverlay` + custom preview/settings | `src/lib/livekit/prefabs/PreJoin.svelte` |
| In-room stage | `VideoStage` + `ParticipantVideoTile` | `VideoConference`, `GridLayout`, `FocusLayout`, `CarouselLayout`, `ParticipantTile` |
| Controls | `features/live/.../ControlBar.svelte` (Bits UI dock) | `livekit/prefabs/ControlBar.svelte` |
| Chat | `RoomChat` + `homebody.chat` text stream | `livekit/components/Chat.svelte` |
| Room wrapper | `LiveKitRoom room={room.liveKitRoom}` (context only) | Prefab assembly |

**Root causes (architectural, not cosmetic):**

1. **Custom shell bypasses prefabs** — `LiveRoomShell.svelte` imports hooks/components à la carte (`useTracks`, `VideoTrack`, `RoomAudioRenderer`) but never `VideoConference`.
2. **Two parallel UI stacks** — `.lr-*` styles in `room.css` (1150+ lines, AnatoMe chrome) vs `.lk-*` classes in ported components with **no global stylesheet** (`styles/livekit-components.css` was planned in `LIVEKIT_MIGRATION_PLAN.md` but never created).
3. **Prefabs are incomplete / broken** — `VideoConference.svelte` imports four layout components that **do not exist** on disk (`components/layout/` is empty). `index.ts` exports them anyway. Nothing in `src/` imports `VideoConference` or `PreJoin` (grep confirms: exports only).
4. **Thin tile wrapper** — `ParticipantVideoTile` wraps only `VideoTrack`; reference `ParticipantTile` adds placeholder, muted indicators, connection quality, focus toggle, speaking state, encryption badge.
5. **Bespoke session model** — `LiveRoom` class (~700+ lines across modules) owns token, connect, preview, chat, stats, wake lock. Reference uses `useSession` + `SessionProvider` + `TokenSource.endpoint`. Homebody has `UseSessionReturn` types and `session-context.svelte.ts` but **no `useSession` hook or `SessionProvider` component**.
6. **Pre-connect is app logic, not PreJoin** — `PreConnectOverlay` handles Convex gates (equipment, prep, waiting, locked, invalid class) with custom preview; it does not compose the ported `PreJoin` prefab.
7. **Student layout is Pilates-specific, not Meet-style** — instructor spotlight + student PiP is intentional product UX; it won't match reference until explicitly mapped onto pin/focus APIs.

---

## 1. What the Next.js Reference Does That We DON'T

### Architecture (not line count)

| Reference pattern | Location | Homebody gap |
|-------------------|----------|--------------|
| **`TokenSource.endpoint` + POST token API** | `pages/api/livekit/token.ts`, `minimal.tsx` | Convex action `api.livekit.token.issueJoin` (correct for us; different shape — keep) |
| **`useSession(tokenSource, { roomName, participantIdentity })`** | `packages/react/src/hooks/useSession.ts` | No hook; `LiveRoom.loadToken()` + manual `Room` construction |
| **`SessionProvider session={session}`** | `SessionProvider.tsx` | Types/context stub only; no provider component |
| **`LiveKitRoom` owns connect lifecycle** | `LiveKitRoom.tsx` + `useLiveKitRoom` | `LiveKitRoom.svelte` exists but shell passes pre-built `room` from `LiveRoom` |
| **`VideoConference` drop-in assembly** | `prefabs/VideoConference.tsx` | Ported but broken (missing layouts) and **never mounted** |
| **`PreJoin` standalone (no server connection)** | `prefabs/PreJoin.tsx` | Ported but unused; app uses `PreConnectOverlay` |
| **`ControlBar` prefab with permission gating** | `prefabs/ControlBar.tsx` | Custom dock; prefab missing `MediaDeviceMenu`, responsive `variation`, persistent device saves in UI |
| **`GridLayout` + pagination + swipe** | `components/layout/GridLayout.tsx` | Hooks exist (`useGridLayout`, `usePagination`, `useSwipe`); **layout Svelte components missing** |
| **`FocusLayout` + `CarouselLayout` + pin context** | layout prefabs | Pin context exists; layout components missing |
| **Auto screen-share pin** | `VideoConference.tsx` effect | `VideoStage` does manual screen-share grid, no pin API |
| **`@livekit/components-styles` + `data-lk-theme`** | example `globals.css` | No equivalent; scattered component-scoped `.lk-*` rules |
| **`MediaDeviceMenu`** (chevron on mic/cam groups) | prefab + PreJoin | `MediaDeviceSelect` only; no menu popover on ControlBar prefab |
| **`StartMediaButton` / autoplay workaround** | ControlBar | `StartAudio.svelte` exists; not used in production shell |
| **`ConnectionStateToast`** | VideoConference | Exported; production uses custom reconnect banners/overlays |
| **`useWarnAboutMissingStyles`** | reference dev UX | Not ported |
| **Chat via layout widget state** | `Chat.tsx` + `ChatToggle` | Custom `RoomChat` + LiveRoom state |

### Reference page patterns

- **`minimal.tsx`** — ~15 lines: `useSession` → `SessionProvider` → `VideoConference`. This is the target integration shape.
- **`simple.tsx` / `customize.tsx`** — Compose `GridLayout` + `ParticipantTile` + `ControlBar` inside `SessionProvider` (custom stage, library controls).
- **`prejoin.tsx`** — Standalone `PreJoin` before any room connection.

Homebody's equivalent of `minimal.tsx` would be roughly:

```svelte
<LiveKitRoom room={room.liveKitRoom}>
  <VideoConference chatMessageFormatter={...} />
</LiveKitRoom>
```

… but today it is:

```svelte
<LiveKitRoom room={room.liveKitRoom}>
  <VideoStage ... />
  <ControlBar {room} />
  <RoomChat ... />
</LiveKitRoom>
```

---

## 2. What to DELETE (after migration)

Delete only once replacement is wired and verified.

### High confidence — duplicate / dead shells

| File | Reason |
|------|--------|
| `src/lib/features/live/components/room/VideoStage.svelte` | Replaced by `VideoConference` or layout composition |
| `src/lib/features/live/components/room/ParticipantVideoTile.svelte` | Replaced by `ParticipantTile` + token styling |
| `src/lib/features/live/components/room/ControlBar.svelte` | Replaced by `livekit/prefabs/ControlBar.svelte` + instructor extension |
| `src/lib/features/live/components/room/ui/LiveMediaSplitControl.svelte` | Only used by deleted ControlBar (unless PreJoin adopts similar UX) |

### Medium confidence — consolidate pre-connect

| File | Reason |
|------|--------|
| `src/lib/features/live/components/room/PreConnectPreview.svelte` | Absorbed into `PreJoin` or thin wrapper |
| Preview track logic in `livekit-media.svelte.ts` (`startPreview`, `switchPreviewDevice`, …) | Overlap with `PreJoin` / `usePreviewTracks` pattern — keep only what Convex gates need |

### Keep wrapper, delete inner duplication

| Keep | Delete inner parts |
|------|-------------------|
| `PreConnectOverlay.svelte` (Convex gates) | Inline device preview UI → compose `PreJoin` for `ready`/`prep` states |
| `PreConnectSettings.svelte` | Keep — instructor codec/resolution UI has no reference equivalent |

### Library cleanup

| File | Reason |
|------|--------|
| `src/lib/livekit/hooks/useToken.svelte.ts` | GET query-string token fetch; incompatible with Convex action model |
| `src/lib/livekit/contexts/roomContext.ts` | Deprecated re-export shim |
| `src/lib/livekit/RUNED_BITS_UI_GUIDE.md` | Dev note; not product code (optional) |
| False exports in `index.ts` for missing layouts | Either implement files or remove exports until Phase 1 completes |

### Do NOT delete

- `LiveRoom` orchestration modules (`room.svelte.ts`, `livekit-connection.svelte.ts`, `livekit-media.svelte.ts`, `live-room-core.svelte.ts`, `live-room-ui.svelte.ts`)
- Convex token/join pipeline
- App chrome: `RoomHeader`, `ParticipantSidebar`, `QualityPanel`, `SelfAudioMonitor`, modals/overlays
- `room.css` (re-theme prefabs to match, don't discard design system)

---

## 3. What to KEEP

### Convex / backend

- `convex/livekit/token.ts` — `issueJoin` action
- `convex/live/joinContract.ts` — join result validator
- `convex/live/room.ts` — `prepareJoin`, reservation gates
- Room lifecycle crons (`convex/live/cron.ts`, class end → delete room)

### App integration layer (`src/lib/features/live/`)

| Module | Keep because |
|--------|--------------|
| `LiveRoom` class | Join gates, token refresh, reconnect, wake lock, class-ended, expiry, publish profiles, stats |
| `live-room-shared.ts` | `isInstructorIdentity`, disconnect codes, i18n helpers |
| `PreConnectOverlay` | Business states: locked, equipment, waiting, prep, error (no reference equivalent) |
| `PreConnectSettings` | Instructor encoding/resolution/simulcast (product-specific) |
| `RoomHeader` | Hebrew chrome, leave/end-live, class title, connection quality |
| `ParticipantSidebar` | Sorted participant list with instructor highlighting |
| `RoomChat` + `homebody.chat` topic | Custom text stream; can later wrap `useChat` with `channelTopic` |
| `QualityPanel`, `SelfAudioMonitor` | Instructor-only tooling |
| `JoinExpiryModal`, `SessionEndedOverlay`, `ConnectionStatusOverlay`, `LeaveModal` | Product UX |
| `styles/room.css` | AnatoMe live room design tokens (map `.lk-*` → `--lr-*` / global tokens) |

### i18n / RTL

- `src/lib/i18n/*` — all live strings
- RTL layout in pre-connect and panels (`direction: rtl` in overlays)
- Material Symbols icons in app chrome (prefabs use inline SVG — style bridge needed)

### Library primitives worth keeping

- All hooks under `src/lib/livekit/hooks/` (already ported)
- `ParticipantTile`, `VideoTrack`, `TrackToggle`, contexts, `RoomAudioRenderer`
- Prefabs as **targets**, once completed

---

## 4. Phased Refactor (with file lists)

### Phase 1 — Complete the library (foundation)

**Goal:** Make `VideoConference` compile and render in isolation. No route changes yet.

**Create (missing from `LIVEKIT_MIGRATION_PLAN.md`):**

- `src/lib/livekit/components/layout/GridLayout.svelte`
- `src/lib/livekit/components/layout/FocusLayout.svelte`
- `src/lib/livekit/components/layout/FocusLayoutContainer.svelte`
- `src/lib/livekit/components/layout/CarouselLayout.svelte`
- `src/lib/livekit/prefabs/MediaDeviceMenu.svelte` (reference has this; ControlBar/PreJoin need it)
- `src/lib/livekit/styles/livekit-components.css`

**Fix:**

- `src/lib/livekit/prefabs/ControlBar.svelte` — wire `useMediaQuery`, `MediaDeviceMenu`, `usePersistentUserChoices`, responsive `variation`
- `src/lib/livekit/prefabs/PreJoin.svelte` — button groups like reference (toggle + menu)
- `src/lib/livekit/prefabs/VideoConference.svelte` — verify layout context provider wraps prefab (reference uses `LayoutContextProvider`; ensure Svelte `LiveKitRoom` sets layout context correctly for standalone use)
- `src/lib/livekit/components/participant/ParticipantTile.svelte` — ensure styles work with global CSS

**Optional (align with reference architecture):**

- `src/lib/livekit/hooks/useSession.svelte.ts`
- `src/lib/livekit/components/SessionProvider.svelte`  
  **Decision:** Either port `useSession` and thin `LiveRoom` to wrap it, **or** document `LiveRoom` as the intentional session facade and skip SessionProvider. Recommendation: **keep LiveRoom as facade** for Convex; don't port full `TokenSource` — lower risk.

**Delete in Phase 1:**

- `src/lib/livekit/hooks/useToken.svelte.ts`
- `src/lib/livekit/contexts/roomContext.ts`

**Verify:** `npm run check` / `svelte-check`; dev-only page mounting `<VideoConference />` inside `<LiveKitRoom>`.

---

### Phase 2 — Instructor room: swap stage + control bar

**Goal:** Instructor view uses library layouts and rich tiles.

**Modify:**

- `src/lib/features/live/components/room/LiveRoomShell.svelte` — conditional: instructor → `VideoConference` (or `GridLayout`/`FocusLayout` composition)
- `src/lib/features/live/styles/room.css` — add `.lr-room .lk-*` token bridge OR import `livekit-components.css` with overrides

**Create:**

- `src/lib/features/live/components/room/InstructorControlBar.svelte` — wraps `livekit/prefabs/ControlBar.svelte` + self-monitor, quality link, Hebrew labels

**Delete (instructor path only, after QA):**

- `VideoStage.svelte` instructor branches
- `ParticipantVideoTile.svelte`
- `features/live/.../ControlBar.svelte`

**Keep in shell:** `RoomHeader`, `ParticipantSidebar`, `QualityPanel`, `SelfAudioMonitor`, overlays.

---

### Phase 3 — Student room: pin instructor + PiP self

**Goal:** Preserve Pilates UX using library primitives.

**Create:**

- `src/lib/features/live/components/room/StudentVideoStage.svelte`  
  - Uses `useTracks`, `layoutContext.pin.setPin(instructorTrack)`, `FocusLayout` + `CarouselLayout` or custom main + PiP using `ParticipantTile`
  - Waiting state (no instructor camera) stays custom Hebrew empty state

**Modify:**

- `LiveRoomShell.svelte` — student branch mounts `StudentVideoStage` instead of `VideoStage`

**Reference behavior to port:**

- Auto-focus screen share when instructor shares (pin API, like `VideoConference` effect)

---

### Phase 4 — Pre-connect: compose PreJoin inside gates

**Goal:** Device preview UX matches reference; business gates unchanged.

**Modify:**

- `src/lib/features/live/components/room/PreConnectOverlay.svelte` — in `showSetup` states, render `<PreJoin>` with Hebrew labels + `onSubmit` → `room.enterRoom(...)` 
- Map `LocalUserChoices` → `LiveRoom` device state / `enterRoom` publish flags
- Keep `PreConnectSettings` beside PreJoin for instructor advanced encoding (sidebar)

**Trim from `livekit-media.svelte.ts`:**

- Redundant preview stream management once PreJoin owns local tracks

---

### Phase 5 — Chat, cleanup, verification

**Goal:** Single chat path; remove dead code; visual parity sign-off.

**Option A (minimal):** Keep `RoomChat` + `homebody.chat` topic — wire unread badge through layout widget or keep LiveRoom state.

**Option B (library-native):** Replace with `livekit/components/Chat.svelte` + `useChat({ channelTopic: 'homebody.chat' })` + Hebrew formatter.

**Modify:**

- `LiveRoomShell.svelte` — chat panel source
- `livekit-connection.svelte.ts` — remove duplicate chat handler if using `useChat`

**Delete:**

- Remaining dead files from Phase 2–4
- Unused exports in `src/lib/livekit/index.ts`

**Verify:**

- Instructor: grid, pagination (>9 participants), screen share focus, carousel
- Student: instructor main + self PiP, waiting state Hebrew copy
- Pre-connect: device menus, persist choices, denied/no-devices flows
- RTL: chat panel, control bar, prejoin form
- Reconnect / class ended / join expiry unchanged
- `npm run check`, manual live class smoke test

---

## 5. UX Deltas Users Will Actually SEE

| Area | Today | After refactor |
|------|-------|----------------|
| **Participant tiles** | Name caption only; speaking border via custom CSS | Muted mic/camera icons, connection quality, placeholder avatar when cam off, optional focus/pin affordance |
| **Instructor grid (many students)** | Fixed 2–4 column CSS grid, no pagination | Paginated grid with page indicators; swipe on mobile |
| **Screen share** | Custom 3fr/1fr spotlight grid | Focus layout: large share + carousel of other tracks; auto-pin on share start |
| **Click to focus** | Not available | Click tile → pin participant (instructor/meet mode) |
| **Control bar devices** | Split button + Select dropdowns (Bits UI) | Toggle + chevron `MediaDeviceMenu` groups (reference pattern); may look different but more standard |
| **Autoplay blocked** | Unclear / inconsistent | Explicit "Start audio" prompt (`StartAudio`) |
| **Pre-connect preview** | Custom layout, functional | Cleaner PreJoin layout; persistent device choices across sessions |
| **Chat panel** | Custom `.lr-chat` styling | Either unchanged (Option A) or library chat styling with unread badge via widget state |
| **Visual polish on tiles** | Minimal overlay | Metadata bar, encryption indicator (if E2EE ever enabled), screen-share badge |
| **Student view** | Should stay familiar | Same instructor-main + self PiP; richer tile overlays on both |

**What should NOT change visibly (preserve):**

- Hebrew copy, RTL direction, AnatoMe glass header/dock (`room.css` chrome)
- Class title, join expiry warnings, equipment gate screens
- Instructor quality panel, self-audio monitor, end-live flow
- Customer waiting-for-instructor empty state messaging

---

## 6. Dependency / Risk Notes

| Risk | Mitigation |
|------|------------|
| `VideoConference` currently **cannot build** (missing imports) | Phase 1 blocker |
| Deleting `LiveRoom` media logic too early breaks Convex gates | Keep `LiveRoom` as orchestrator through Phase 5 |
| Student layout ≠ Meet grid | Explicit `StudentVideoStage`; don't force full `VideoConference` for students |
| Design drift (lk vs lr classes) | Single `livekit-components.css` mapped to `tokens.css`; scope under `.lr-room` |
| Chat topic migration | Keep `homebody.chat` topic either way |
| `useSession` / `TokenSource` | Skip; Convex action is correct — don't replicate Next.js POST token route |

---

## 7. Reference File Map (quick index)

| Reference | Homebody counterpart | Status |
|-----------|---------------------|--------|
| `examples/nextjs/pages/minimal.tsx` | *none* | Target integration |
| `examples/nextjs/pages/api/livekit/token.ts` | `convex/livekit/token.ts` | ✅ Keep Convex |
| `packages/react/src/prefabs/VideoConference.tsx` | `src/lib/livekit/prefabs/VideoConference.svelte` | ⚠️ Broken + unused |
| `packages/react/src/prefabs/PreJoin.tsx` | `src/lib/livekit/prefabs/PreJoin.svelte` | ⚠️ Unused |
| `packages/react/src/prefabs/ControlBar.tsx` | both ControlBars | ⚠️ Production uses custom |
| `packages/react/src/components/LiveKitRoom.tsx` | `LiveKitRoom.svelte` | ✅ Used as context only |
| `packages/react/src/components/layout/*` | *missing* | ❌ Phase 1 |
| `features/live/.../LiveRoomShell.svelte` | production entry | 🎯 Primary refactor target |

---

## 8. Success Criteria

- [ ] `VideoConference` renders without import errors
- [ ] Instructor live room uses `ParticipantTile` + layout components (not `VideoStage`)
- [ ] Production control bar uses livekit prefab (extended for instructor)
- [ ] Pre-connect composes `PreJoin` for device UX inside existing gates
- [ ] No duplicate tile/control implementations in `features/live/components/room/`
- [ ] RTL + design tokens preserved (`docs/design-context.md`)
- [ ] Convex join flow unchanged (`issueJoin` contract)
- [ ] User-visible tile/control improvements listed in §5 are observable in QA

---

## 9. Frontend ↔ Convex wiring (post-refactor audit)

Queries that require client `now` (never `Date.now()` in Convex query handlers):

| API | Call sites |
|-----|------------|
| `api.live.calendar.listRange` | `CalendarShell` |
| `api.live.calendar.listUpcoming` | `MemberDashboardHome` |
| `api.live.class.listMine` | `LiveStudioShell`, `InstructorUpcomingAgenda` |
| `api.live.class.getJoinAccess` | `join-token.ts`, `livekit-connection.svelte.ts` |
| `api.live.next.get` | `AppSidebar`, `/חדר-לייב` staff redirect |
| `api.oneOnOne.customer.listDayAvailability` | `CalendarShell` |

Join path: `getJoinAccess` → `api.livekit.token.issueJoin` → `internal.live.room.prepareJoin`.

Shared helper: `src/lib/convex/queryClock.svelte.ts` (`useQueryNowMs`) keeps `now` reactive for sidebar/calendar/dashboard queries. Do not pass inline `Date.now()` in `useQuery` args — it changes every evaluation and can leave queries stuck loading.

See also: `docs/live-join-flow.md`.
