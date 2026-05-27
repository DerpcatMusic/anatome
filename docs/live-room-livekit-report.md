# Live Room & LiveKit — Architecture Report

**Route:** `/חדר-לייב?classId=…` → [`src/routes/(app)/חדר-לייב/+page.svelte`](../src/routes/(app)/חדר-לייב/+page.svelte) → [`LiveRoomShell.svelte`](../src/lib/features/live/components/room/LiveRoomShell.svelte)

**Date:** 2026-05-24  
**Updated:** 2026-05-27 — Phase 2: `createLiveSession()`, `VideoConference`, dynamic route/shell imports. Superseded in part by `LIVEKIT_REFACTOR_PLAN.md` (historical) and `LIVEKIT_DELETION_CANDIDATES.md` (current).

---

## A. Route & layout truth

| Layer | File | What renders |
|--------|------|----------------|
| Root | [`src/routes/+layout.svelte`](../src/routes/+layout.svelte) | Global `Navbar` + `global.css` (unless hidden) |
| App group | [`src/routes/(app)/+layout.svelte`](../src/routes/(app)/+layout.svelte) | `AppLayout` sidebar — **skipped** for live room |
| Live breakout | [`src/routes/(app)/חדר-לייב/+layout@.svelte`](../src/routes/(app)/חדר-לייב/+layout@.svelte) | Resets to **root** only (`@` = no `(app)` layout) |
| Page | `+page.svelte` | `LiveRoomShell` only |

**Yes — this is the correct route.** The UI you see at `http://localhost:5173/חדר-לייב?classId=…` is `LiveRoomShell`, not the studio calendar.

### Why it still felt “unchanged” / broken

1. **Global `Navbar`** — Root layout always rendered `Navbar` above full-screen `lr-room` (both `z-index: 50`/`100`). Looked like a double header and wrong paper/beige strip. **P0 fix:** hide `Navbar` when pathname includes `חדר-לייב` (and encoded variant).
2. **RTL centering bug** — Dock used `inset-inline: 50%` + `translate: -50%`, which anchors from the **inline-start** (right in RTL), not the visual center. **P0 fix:** `left: 50%; transform: translateX(-50%)`.
3. **Nested boxes in dark mode** — `hb-button--control` defaults to `background: var(--white)`; dock used `--glass-strong-bg` (light-tinted glass). On dark `--paper` you get dark buttons inside a lighter dock = “boxes in boxes”. **P0 fix:** dock uses `--lr-dock-bg`; all controls inside `.lr-control-bar` forced transparent with shared hover chip.

---

## B. Current Homebody architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Svelte UI (17 room components)                              │
│  LiveRoomShell → LiveKitRoom, VideoConference, LiveControlBar  │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│  createLiveSession() — live-session-*.svelte.ts (~2.3k LOC)  │
│  • Convex: getJoinAccess + issueJoin on connect              │
│  • livekit-client Room via live-session-connect.ts           │
│  • UI: PreJoin prefab, panels, instructor/customer           │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│  Convex                                                     │
│  • livekit/token.ts — AccessToken + ensureLiveKitRoom        │
│  • live/room.ts — prepareJoin, roles, capacity               │
│  • livekit/rooms.ts, webhook.ts — lifecycle                  │
└─────────────────────────────────────────────────────────────┘
```

### Pain points

| Area | Issue |
|------|--------|
| **Monolith** | `room.svelte.ts` mixes LK wiring, Convex, chat, stats, pre-connect, tiles, reconnect |
| **UI** | Custom `lr-*` + `hb-button` parallel to app design system; easy to drift |
| **Tracks/tiles** | ~~Manual `mediaTiles`~~ → `createLiveKitRoomTracks` (`@livekit/components-core`) + `lr-*` tiles |
| **Pre-connect** | Custom `PreConnectOverlay` vs standard `PreJoin` flow |
| **Duplication** | Meet/components solve: grid, focus layout, device menu, control bar |

### What’s already good (keep)

- **Convex-issued tokens** + `prepareJoin` (roles, join window, capacity) — richer than Meet demo
- **Instructor vs customer** subscription rules in one place
- **Hebrew RTL**, typesafe-i18n, bits-ui modals
- **Class lifecycle** (end live, join expiry) tied to product domain

---

## C. Official stacks comparison

### 1. [livekit/components-js](https://github.com/livekit/components-js)

| Package | Role |
|---------|------|
| `@livekit/components-core` | Framework-agnostic logic (tracks, layouts, sort) |
| `@livekit/components-react` | React UI + hooks + **prefabs** |
| `@livekit/components-styles` | `lk-*` CSS theme |

**Prefabs (high value):**

- `PreJoin` — device preview + join
- `VideoConference` — grid + focus + screen share + built-in `ControlBar` + chat slot
- `ControlBar` — mic/camera/screen/chat/settings with **MediaDeviceMenu**
- `ParticipantTile`, `GridLayout`, `FocusLayout`, `CarouselLayout`

**Svelte:** React-only. For Homebody you either port patterns or use **livekit-svelte** (below).

### 2. [livekit-examples/meet](https://github.com/livekit-examples/meet)

Reference app architecture:

1. **Lobby** — `PreJoin` → fetch `/api/connection-details` (token + URL)
2. **Room** — `RoomContext` + `VideoConference` + `@livekit/components-styles`
3. **Thin page** — `PageClientImpl.tsx` wires E2EE, codec, room options

**Map to Homebody:**

| Meet | Homebody today |
|------|----------------|
| `connection-details` API | `api.livekit.token.issueJoin` (Convex action) ✓ |
| `PreJoin` | `PreConnectOverlay` + `PreConnectSettings` (instructor) |
| `VideoConference` | `VideoStage` + `ControlBar` + side panels |
| `Room` in React context | `LiveRoom._room` inside class |

Meet proves: **token API + prefab UI**; domain logic stays server-side. Homebody already has the server half; client UI is the heavy custom layer.

### 3. [powxenv/livekit-svelte](https://github.com/powxenv/livekit-svelte)

Svelte 5 port of components-js (uses `@livekit/components-core` + `livekit-client`):

- Hooks: `useLiveKitRoom`, `useTracks`, `useTrackToggle`, `useMediaDeviceSelect`, …
- Prefabs: `video-conference`, `control-bar`, `pre-join`, `media-device-menu`, `chat`
- **Peer:** Svelte 5, same stack as Homebody

**Caveat:** Small community (0★), version `0.1.1` — evaluate stability; alternative is vendoring hooks only.

---

## D. LiveKit video conferencing best practices

From [LiveKit video conferencing](https://livekit.com/use-cases/video-conferencing):

- **Server:** Issue short-lived tokens; create/update rooms server-side (you do this in `token.ts`).
- **Client:** Let SDK handle simulcast, adaptive stream, selective subscription — avoid hand-rolling quality logic unless instructor tooling requires it.
- **UI:** Use prefabs/hooks for tracks and layouts; style with one theme (`lk` or your tokens).
- **Moderation:** RoomService + participant permissions for instructor controls.
- **Scale:** For large classes, selective subscription + dynacast (LiveKit defaults); instructor spotlight = focus layout pattern.

---

## E. Phased migration plan

### P0 — UI fixes (this pass)

| Item | Status |
|------|--------|
| Hide global `Navbar` on `/חדר-לייב` | Done in `+layout.svelte` |
| Center control dock (`left: 50%` + `translateX(-50%)`) | Done in `room.css` |
| Dark dock: `--lr-dock-bg`, transparent inner buttons | Done in `room.css` |
| Flat header buttons (no nested tiles) | Already in `room.css` `.lr-room .lr-header` |

**Verify:** Hard refresh dev server; URL must be `/חדר-לייב?classId=…` (not old `/live-room` redirect only).

### P1 — Architecture streamlining (2–3 weeks)

1. **Split `room.svelte.ts`**
   - `livekit-connection.ts` — Room connect/disconnect/events
   - `livekit-media.ts` — publish, devices, screen share
   - `live-room-ui.svelte.ts` — panels, chat draft, modals
   - Keep `LiveRoom` as thin façade

2. **`@livekit/components-core`**
   - Done: `createLiveKitRoomTracks`, `createLiveKitDeviceLists`, `createLiveKitParticipants`, styled `ParticipantVideoTile` / `LiveAudioSink`
   - Next (optional): `setupDeviceSelector` when switching devices in-room

3. **Pre-connect**
   - Align `PreConnectOverlay` with `PreJoin` API (preview tracks, single submit → `issueJoin` → connect)

### P2 — UI consolidation (2–4 weeks)

| Adopt from components-js / livekit-svelte | Keep custom |
|------------------------------------------|-------------|
| `VideoConference` layout logic (grid/focus/screen share) | Hebrew copy, RTL, Convex class title |
| `ControlBar` + split device menu | Instructor quality panel, end-live flow |
| `ParticipantTile` styling patterns | Role badges, join expiry |
| `RoomAudioRenderer` pattern | — |

**Do not** drop in React components. Path: **livekit-svelte** OR fork hooks + rebuild Svelte shells with `hb-*` / `lr-*` tokens.

### P3 — Optional product features

- Krisp / noise filter (Meet uses `@livekit/krisp-noise-filter`)
- Egress/recording (Convex cron already touches room lifecycle)
- Breakout rooms (LiveKit multi-room — only if product needs)

---

## F. Adoption matrix (Homebody files)

| components-js / Meet | Homebody target | Action |
|---------------------|-----------------|--------|
| `issueJoin` / connection-details | `convex/livekit/token.ts` | Keep |
| `PreJoin` | `PreConnectOverlay.svelte` | Refactor toward prefab behavior |
| `VideoConference` | `VideoStage.svelte` + `LiveRoomShell` | Port layout/focus logic |
| `ControlBar` + `MediaDeviceMenu` | `ControlBar.svelte` + `LiveMediaSplitControl.svelte` | Replace with svelte prefab or mirror API |
| `ParticipantTile` | Tile rendering in `VideoStage` / `types.ts` `mountMedia` | Use track refs from hooks |
| `RoomContext` | `LiveRoom` singleton | Keep pattern; reduce surface area |
| `useTracks` | `room.svelte.ts` debounced refresh | **Replace** — biggest win |

---

## G. Files changed (P0)

- [`src/routes/+layout.svelte`](../src/routes/+layout.svelte) — hide site Navbar on live room paths
- [`src/lib/features/live/styles/room.css`](../src/lib/features/live/styles/room.css) — RTL-safe dock centering, dark dock tokens, no nested button backgrounds

---

## H. Recommended next commands

1. `/normalize` — finish header grid alignment (title truncation, expiry on second row mobile)
2. `/harden` — keyboard order through `Toolbar` + `DropdownMenu`
3. Spike: add `@livekit/components-core` + evaluate `livekit-svelte` in a branch (`bun add livekit-svelte` or copy hooks)

---

## Summary

- **Route is correct**; bad UX was layout stacking (global Navbar), RTL dock positioning, and light glass / `hb-button` backgrounds on dark theme.
- **Architecture** is sound on the server; **~1.6k-line client god-object** is the main debt.
- **Best streamline path:** keep Convex token/join policy; adopt **components-core hooks + livekit-svelte prefabs** (or port) for tracks/layout/controls; restyle with existing `hb-*` tokens.
