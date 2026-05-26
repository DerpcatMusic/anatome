# LiveKit room separation

How Homebody keeps each live class in its own LiveKit room and aligns with [LiveKit tokens & grants](https://docs.livekit.io/frontends/reference/tokens-grants/).

## Model

| Layer | Mechanism |
| --- | --- |
| **Naming** | One canonical room per class: `{namespace}_liveClass_{liveClassId}` via `roomNameForClass()` in `convex/lib/live.ts`. |
| **Namespace** | Optional `LIVEKIT_ROOM_PREFIX` (default `homebody`) separates dev/staging/prod on a shared LiveKit project. |
| **JWT** | `issueJoin` sets `VideoGrant.room` to that name only — participants cannot join another room with the same token. |
| **Convex** | `liveRooms` row keyed by `liveClassId`; webhook resolves `roomName` → room → class and re-checks reservation/role. |
| **Metadata** | LiveKit room metadata includes `liveClassId`; `ensureLiveKitRoom` rejects a name already bound to another class. |
| **Lifecycle** | `deleteRoomByName` scheduled when a class ends or is cancelled (`convex/live/class.ts`, `convex/live/cron.ts`). |

## Join flow

1. Client: `?classId=` → `getJoinAccess` (equipment, window, reservation).
2. Client: `livekit.token.issueJoin` → `prepareJoin` + `ensureLiveKitRoom` + signed JWT.
3. Server asserts `join.roomName === roomNameForClass(liveClassId)` and `join.liveClassId === args.liveClassId`.
4. Client: `assertIssueJoinMatchesClass()` before `Room.connect(wsUrl, token)`.
5. LiveKit webhook: `liveClassIdFromRoomName` must match `liveRooms.liveClassId` when parseable.

## Ops

- **Dev vs prod on one project:** set `LIVEKIT_ROOM_PREFIX=homebody_dev` in Convex env for dev.
- **CLI:** `lk room list`, `lk token create --room <name>` (see [CLI docs](https://docs.livekit.io/reference/developer-tools/livekit-cli/)).
- **Stale rooms:** if delete fails, the same class id reuses the same name; metadata collision checks prevent cross-class reuse.

## Frontend tracks (components-core)

- `src/lib/features/live/livekit-room-tracks.svelte.ts` — video stage, audio sink, active speaker (rxjs observables from `@livekit/components-core`).
- `src/lib/features/live/livekit-participants.svelte.ts` — participant sidebar list (`connectedParticipantsObserver` + `observeParticipantMedia` / speaking observers).
- `ParticipantVideoTile.svelte` / `VideoStage.svelte` — Homebody `lr-*` tokens, not `@livekit/components-styles`.
- Connection/publish logic stays in `livekit-connection.svelte.ts` / `livekit-media.svelte.ts` (RoomEvent handlers still drive `subscribeIfAllowed`, not the sidebar list).

## Concurrent instructors

Each `liveClassId` maps to its own LiveKit room (`{prefix}_liveClass_{id}`). Multiple instructors can be `live` at once without room name collisions. The sidebar **LIVE** tab shows one eligible class per user: the instructor’s own class (by `instructorUserId`) or a member’s reserved/joined class with matching equipment (`convex/live/next.ts`). Creating overlapping classes for the **same** instructor is blocked via `hasLiveClassConflict` on create and reschedule.

## Not in scope (future)

- Full `VideoConference` prefab port (no official Svelte package).
- Per-participant encryption keys (only needed for E2EE).
