# LiveKit Deletion Candidates — Approach A Cleanup

**Last audited:** 2026-05-27 (remediation pass complete)

## Status: Phase 2 done

| Item | Status |
|------|--------|
| `live-session.svelte.ts` + `live-session-{core,ui,media,lifecycle}.svelte.ts` + `live-session-connect.ts` | **Present** — flat composition, no `LiveRoom` god-class |
| `useToken.svelte.ts`, `room.svelte.ts`, `live-room-*.svelte.ts`, `livekit-*.svelte.ts` | **Deleted** |
| `AudioConference` prefab | **Not in public barrel** (file may remain for port completeness) |
| `LiveRoomShell` | `createLiveSession()` + `VideoConference` / `PreJoin` |
| `@event-calendar/core` | **Lazy** via `event-calendar-load.ts` (studio `WeeklyAgenda`; booking calendar ready) |

## Still on disk (intentional)

- Full `src/lib/livekit/` port (hooks, layouts, prefabs) — import via subpaths when extending; app barrel is slim
- `CustomerBookingCalendar.svelte` — not wired to a route yet; kept with lazy calendar load

## Next deletion gate (optional)

1. Grep zero imports for `AudioConference`, unused layout exports
2. `bun run check` + manual live room smoke test before deleting port files
