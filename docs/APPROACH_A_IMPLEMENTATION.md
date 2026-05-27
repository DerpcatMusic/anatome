# Approach A — Thin Live Session

## Goal

```
חדר-לייב → joinSession (Runed + Convex) → PreJoin (one screen) → LiveKitRoom + VideoConference + Hebrew chrome
```

**Delete over time:** `LiveRoom` god-class, duplicate media paths, full-page connection overlays.

## Runed patterns (use these)

| Need | Runed API | Existing example |
|------|-----------|------------------|
| Device prefs | `PersistedState` | `live-persistent-devices.ts`, `usePersistentUserChoices` |
| Window events | `useEventListener` | `LiveRoomShell.svelte` |
| Convex + auth | `resource` | `useAuthQuery.svelte.ts`, `CatalogShell.svelte` |
| Scroll chat | `ScrollState` | `RoomChat.svelte` |
| Element size | `ElementSize` | `useResizeObserver.svelte.ts` |

## New modules (ownership)

| File | Owner agent | Role |
|------|-------------|------|
| `src/lib/features/live/live-session.svelte.ts` | Session | `$state` session: token, connect, toggles |
| `src/lib/features/live/live-session-connect.ts` | Session | connect/disconnect only (no UI) |
| `src/lib/features/live/LiveSession.svelte.ts` | Optional facade export | |

## Shell (ownership)

| File | Role |
|------|------|
| `LiveRoomShell.svelte` | `<LiveKitRoom>` + `<VideoConference>` + header/chat |
| `PreConnectOverlay.svelte` | PreJoin + inline joining overlay |
| `LiveControlBar.svelte` | Props: `session` not `LiveRoom` |

## Convex (unchanged surface)

- `api.livekit.token.issueJoin`
- `api.live.class.getJoinAccess`
- `api.live.session.getJoinContext` — optional; access + `classTitle` for reactive PreJoin (`docs/LIVE_JOIN_API.md`)
- Pass `now` via `useQueryNowMs()`

## Phase order

1. `live-session.svelte.ts` + tests via `bun run check`
2. Rewire `LiveRoomShell` to session
3. Adapt control bar / header / chat props
4. Delete `room.svelte.ts` chain when unused
