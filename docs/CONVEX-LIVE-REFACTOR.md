# Convex live room — backend API contract

**Audience:** frontend agents splitting `room.svelte.ts`  
**Scope:** `convex/livekit/*`, `convex/live/room.ts`, `convex/live/joinPolicy.ts`, `convex/live/joinContract.ts`  
**Last updated:** 2026-05-24

---

## Public endpoints

### `api.livekit.token.issueJoin` (action)

Issues a LiveKit JWT after server-side join policy runs. **Requires authenticated Convex session** (Convex Auth identity + `prepareJoin` user lookup).

#### Args

| Field | Type | Notes |
|--------|------|--------|
| `liveClassId` | `Id<"liveClasses">` | From route `?classId=` |

#### Returns (`IssueJoinResult`) — **stable; do not break without client update**

| Field | Type | Client usage |
|--------|------|----------------|
| `wsUrl` | `string` | `Room.connect(wsUrl, token)` |
| `token` | `string` | JWT; refresh ~7 min before expiry (client uses 7m timer; server TTL `10m`) |
| `roomName` | `string` | LiveKit room name (`homebody_liveClass_{id}`) |
| `participantRole` | `"instructor" \| "customer" \| "admin"` | UI + publish profile; privileged = instructor **or** admin |
| `joinClosesAt` | `number` | Unix ms; expiry modal + reconnect guard |
| `classTitle` | `string` | Header copy |
| `instructorName` | `string` | Header copy |
| `liveClassType` | `"group_live" \| "one_on_one"` | Layout hints |

Validators: `convex/live/joinContract.ts` → `issueJoinResultValidator`.

#### Errors (thrown)

Typical messages (Hebrew) from `prepareJoin` / policy — handle in UI:

- `"Authentication required"` — not signed in
- `"השיעור לא נמצא"` — bad class id
- `"ההצטרפות תיפתח …"` / `"חלון ההצטרפות נסגר"` — outside join window
- `"השיעור אינו חי"` — customer before class is `live`
- `"אין מספיק נקודות"` / `"השיעור מלא"` / equipment / profile errors

#### Token refresh

Call `issueJoin` again with the same `liveClassId`. Idempotent for instructors; customers with `reserved` may transition to `joined` via webhook on first connect.

---

### `api.live.class.getJoinAccess` (query) — related, not in livekit folder

Pre-flight UI before calling `issueJoin`. Returns `null` if unauthenticated.

| Field | Type |
|--------|------|
| `joinOpensAt`, `joinClosesAt`, `startsAt` | `number` |
| `status` | class status enum |
| `canEnter` | `boolean` |
| `minutesUntilOpen`, `minutesUntilClose` | `number \| null` |
| `isInstructor` | `boolean` |

Use `canEnter` before `issueJoin`; still call `issueJoin` for the actual token.

---

## Internal: `internal.live.room.prepareJoin` (mutation)

**Not callable from the browser.** Invoked only from `issueJoin` via `ctx.runMutation`.

### Responsibilities

1. Auth: `requireUserId` + `requireAppProfile`
2. Role: `getParticipantRole` in `joinPolicy.ts`
3. Customer: reservation / walk-in credits + `reserveClassSeat`
4. Persist: `liveRooms` row, `liveJoinEvents` audit log

### Returns (`PrepareJoinResult`)

Includes everything needed to mint the token plus server-only fields:

- `userId`, `displayName`, `capacity`, `maxParticipants`, `startsAt`, `endsAt`
- Same `roomName`, `participantRole`, `liveClassType`, titles as client sees on `issueJoin`

Validator: `prepareJoinResultValidator` in `joinContract.ts`.

---

## Permissions (single source of truth)

**File:** `convex/live/joinPolicy.ts`

| Helper | Meaning |
|--------|---------|
| `getParticipantRole(ctx)` | Maps user + class → `instructor` / `customer` / `admin` |
| `isPrivilegedLiveParticipant(role)` | `instructor` or `admin` — LiveKit `roomAdmin`, screen share |
| `liveKitParticipantIdentity(role, userId)` | Identity string `{role}_{userId}` |
| `liveKitRoomLayout(type)` | Room metadata layout |
| `buildLiveKitVideoGrant` | **`convex/livekit/grants.ts`** — grant from role |
| `validateBaseJoinEligibility` | Window + class status |
| `validateCustomerJoinEligibility` | Reservation + equipment |

**Webhook enforcement:** `livekitAttendance/events.handleWebhook` re-validates policy on `participant_joined`; unauthorized users are removed via `internal.livekit.webhook.removeParticipant`.

---

## LiveKit server modules

| Module | Role |
|--------|------|
| `livekit/token.ts` | Public `issueJoin` |
| `livekit/grants.ts` | VideoGrant by role |
| `livekit/ensureRoom.ts` | Create/update LiveKit room + metadata |
| `livekit/rooms.ts` | Cron: expire classes, delete LK rooms |
| `livekit/webhook.ts` | Validate signature; remove bad participants |
| `live/capacity.ts` | `reserveClassSeat` / `releaseClassSeats` |

HTTP: `POST /livekit/webhook` → `http.ts` (not a Convex `api.*` call).

---

## Recommended client split

```
livekit-connection.ts   → issueJoin, connect, refresh token, expiry timers
livekit-media.ts        → publish defaults from participantRole (privileged check)
live-room-ui.svelte.ts  → panels, chat, modals (no Convex)
```

**Privileged check (mirror server):**

```ts
const privileged =
  joinInfo.participantRole === "instructor" ||
  joinInfo.participantRole === "admin";
```

---

## Client follow-up

**None required** for this refactor — `issueJoin` return shape is unchanged.

Optional alignment:

- Import `IssueJoinResult` type from a shared package later; today duplicate the shape in TS or codegen from validators.
- Use `isPrivilegedLiveParticipant` logic inline until a shared `live/` types module exists on the client.

---

## Env (actions)

`LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`, `LIVEKIT_URL` or `LIVEKIT_WS_URL` — see `convex/lib/livekitEnv.ts`.
