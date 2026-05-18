# HomeBody Live Meetings Research

Last updated: 2026-05-17

Scope: backend architecture for instructor-led live classes using Convex Auth, Convex, and LiveKit. This document intentionally avoids frontend implementation details except where backend contracts require them.

## Product Constraint

HomeBody uses Convex Auth only.

Users can self-sign-up only as customers. Instructor access is not a signup option and must be granted by an admin-controlled Convex mutation or directly through the Convex dashboard during early operations.

Convex is the source of truth for:

- authenticated user identity
- app roles
- instructor enablement
- class schedule and status
- reservations
- credit checks
- LiveKit room names
- LiveKit token issuance authorization

LiveKit is only the media transport. The frontend must never sign LiveKit tokens.

## Source Notes

LiveKit access tokens are JWTs signed with the API secret. They encode participant identity, room name, capabilities, and permissions. Token expiration controls initial connection; LiveKit Cloud also supports token revocation when permissions change or participants are removed.

LiveKit room service APIs allow the backend to create/list/delete rooms, list/remove participants, mute tracks, update participant permissions, update subscriptions, update room metadata, and send data.

Convex Auth provides a Convex-managed users table through `authTables`. Backend functions should derive the current authenticated user with `getAuthUserId(ctx)` and must not accept a client-provided user ID for authorization.

Convex schema guidance says to keep high-churn operational data separate from stable profile data, avoid unbounded arrays in documents, and query through named indexes.

Sources:

- https://docs.livekit.io/frontends/authentication/tokens
- https://docs.livekit.io/home/server/generating-tokens/
- https://docs.livekit.io/home/server/managing-rooms/
- https://docs.livekit.io/home/server/managing-participants
- https://docs.livekit.io/reference/other/roomservice-api/
- https://docs.convex.dev/auth/convex-auth
- https://docs.convex.dev/scheduling/cron-jobs
- `convex/_generated/ai/guidelines.md`

## Current Repo Facts

Current backend files:

- `convex/auth.ts` configures `@convex-dev/auth` Email OTP/magic-link auth.
- `convex/schema.ts` includes `authTables`, `plans`, `creditBuckets`, and `memberProfiles`.
- `convex/users.ts` already uses `getAuthUserId(ctx)`.
- `README.md` identifies Convex Auth as the current auth stack.

Current issue:

- The parent `design.md` previously mentioned Clerk. That is stale and has been corrected. The implementation direction is Convex Auth only.

## User Roles

Use an app-owned role/profile table instead of overloading Convex Auth's generated `users` documents.

Recommended table:

```ts
appProfiles: defineTable({
  userId: v.id("users"),
  email: v.string(),
  displayName: v.string(),
  role: v.union(v.literal("customer"), v.literal("instructor"), v.literal("admin")),
  instructorEnabledAt: v.optional(v.number()),
  instructorDisabledAt: v.optional(v.number()),
  updatedAt: v.number(),
}).index("by_userId", ["userId"])
  .index("by_email", ["email"])
  .index("by_role", ["role"])
```

Rules:

- Default role is `customer`.
- Signup and onboarding cannot set role.
- `instructor` can only be set by admin/internal mutation.
- `admin` should initially be seeded manually from Convex dashboard or a one-off internal-only bootstrap function.
- Role checks must happen in Convex functions, not in Astro/Svelte.

## Live Class Model

Separate stable schedule data from room runtime data.

Recommended stable class table:

```ts
liveClasses: defineTable({
  title: v.string(),
  description: v.string(),
  type: v.union(v.literal("one_way"), v.literal("two_way")),
  instructorUserId: v.id("users"),
  startsAt: v.number(),
  endsAt: v.number(),
  joinOpensAt: v.number(),
  joinClosesAt: v.number(),
  capacity: v.number(),
  creditKind: v.union(v.literal("live"), v.literal("twoWay")),
  creditCost: v.number(),
  status: v.union(
    v.literal("draft"),
    v.literal("scheduled"),
    v.literal("live"),
    v.literal("ended"),
    v.literal("cancelled"),
  ),
  createdAt: v.number(),
  updatedAt: v.number(),
}).index("by_startsAt", ["startsAt"])
  .index("by_status_and_startsAt", ["status", "startsAt"])
  .index("by_instructorUserId_and_startsAt", ["instructorUserId", "startsAt"])
```

Recommended room runtime table:

```ts
liveRooms: defineTable({
  liveClassId: v.id("liveClasses"),
  provider: v.literal("livekit"),
  roomName: v.string(),
  status: v.union(v.literal("pending"), v.literal("active"), v.literal("ended")),
  startedAt: v.optional(v.number()),
  endedAt: v.optional(v.number()),
  startedByUserId: v.optional(v.id("users")),
  updatedAt: v.number(),
}).index("by_liveClassId", ["liveClassId"])
  .index("by_roomName", ["roomName"])
  .index("by_status", ["status"])
```

Room names should be generated server-side and not accepted from the client.

Example:

```text
homebody_liveClass_<liveClassId>
```

## Reservation And Credit Model

The current `creditBuckets` table tracks used credits but not reserved credits. Live classes need reservation semantics because capacity and credits are held before media join.

Recommended extension:

```ts
liveReserved: v.number(),
twoWayReserved: v.number(),
```

Reservation table:

```ts
liveReservations: defineTable({
  liveClassId: v.id("liveClasses"),
  userId: v.id("users"),
  status: v.union(
    v.literal("reserved"),
    v.literal("joined"),
    v.literal("cancelled"),
    v.literal("refunded"),
    v.literal("no_show"),
  ),
  creditKind: v.union(v.literal("live"), v.literal("twoWay")),
  creditsReserved: v.number(),
  reservedAt: v.number(),
  joinedAt: v.optional(v.number()),
  cancelledAt: v.optional(v.number()),
}).index("by_liveClassId_and_userId", ["liveClassId", "userId"])
  .index("by_liveClassId_and_status", ["liveClassId", "status"])
  .index("by_userId_and_reservedAt", ["userId", "reservedAt"])
```

Credit policy recommendation:

- RSVP reserves credits.
- Joining marks the reservation as joined.
- Class completion converts joined/reserved reservations to used credits.
- User cancellation before cutoff releases reserved credits.
- Instructor/admin cancellation refunds reserved credits.
- No-show policy can be decided later; MVP can convert no-shows to used if RSVP held a spot.

MVP simplification:

- Treat RSVP as credit usage immediately.
- Refund only on cancellation.

The reservation model is safer for fairness and capacity, but it requires more bookkeeping.

## Token Issuance

Backend-only action:

```ts
livekit.issueJoinToken({ liveClassId })
```

Required checks:

- user is authenticated
- app profile exists or is created as customer
- class exists
- class is not cancelled or ended
- current time is inside join window, unless instructor
- instructor user matches class instructor or has admin role
- customer has a valid reservation or can atomically reserve
- customer has sufficient credits for the class plan
- class capacity is not exceeded

Returned shape:

```ts
{
  wsUrl: string,
  token: string,
  roomName: string,
  participantRole: "instructor" | "customer",
}
```

Never store LiveKit tokens in Convex. Generate short-lived tokens after checks.

## LiveKit Permission Model

Instructor:

```ts
{
  roomJoin: true,
  roomAdmin: true,
  canPublish: true,
  canSubscribe: true,
  canPublishData: true,
  canPublishSources: ["camera", "microphone", "screen_share", "screen_share_audio"]
}
```

Two-way customer:

```ts
{
  roomJoin: true,
  canPublish: true,
  canSubscribe: true,
  canPublishData: true,
  canPublishSources: ["camera", "microphone"]
}
```

One-way classes should remain a Cloudflare Stream concern per product design. LiveKit should be used for two-way correction classes.

## Backend Modules

Suggested files:

- `convex/lib/authz.ts`: require current user, require profile, require instructor/admin.
- `convex/appProfiles.ts`: viewer profile and admin role operations.
- `convex/liveClasses.ts`: list classes, reserve, cancel reservation, class details.
- `convex/instructorLive.ts`: instructor class controls.
- `convex/livekit.ts`: token generation and room actions.
- `convex/crons.ts`: cleanup stale live sessions and no-shows.

Keep public functions narrow. Sensitive room creation/deletion and role toggles should be internal or admin-guarded.

## Convex Runtime Concern

The LiveKit server SDK depends on Node APIs. Convex actions can run in Node when the file includes:

```ts
"use node";
```

Mutations should do transactional database checks and updates. Actions should perform LiveKit API calls and then call mutations. Avoid splitting authorization across too many function calls because it can introduce race conditions.

Practical pattern:

- mutation validates user/class/credits and creates or updates reservation/room state
- action calls LiveKit if external side effect is needed
- mutation finalizes state if needed

For token signing, an action can validate by calling one internal query/mutation and then sign the token. If token generation does not mutate state, still log join attempts in a separate mutation.

## Edge Cases

Authorization:

- Client passes another user ID.
- Customer tries to create instructor token.
- Instructor tries to start a class assigned to someone else.
- Disabled instructor tries to start future class.
- Admin toggles role while class is live.

Credits and capacity:

- Two browser tabs attempt reservation at once.
- User has enough credits before RSVP but not at join.
- Class fills while user is loading checkout/join screen.
- Plan changes mid-period.
- Credits reset according to Israel timezone.

LiveKit:

- Token is leaked.
- User removed from room tries to reconnect with old token.
- Room exists in LiveKit but Convex says ended.
- Convex says active but LiveKit room was deleted.
- Instructor closes tab without ending.
- Participant joins from two devices with same identity.

Scheduling:

- Class starts late.
- Class exceeds scheduled end.
- Class cancelled after reservations exist.
- User joins after `joinClosesAt`.
- Instructor starts too early.

Operational:

- LiveKit env vars missing.
- API key changed.
- LiveKit Cloud outage.
- Convex action succeeds but mutation finalization fails.
- Mutation succeeds but LiveKit room creation fails.

## Research Conclusions

Use Convex as the entitlement boundary and LiveKit as a replaceable media provider.

The backend should be implemented in this order:

1. App profile and roles.
2. Instructor toggle/admin guard.
3. Live class schedule schema.
4. Reservation and credit reservation semantics.
5. LiveKit token action.
6. Instructor start/end room actions.
7. Cleanup cron and audit events.

Do not start with Svelte room UI. The first backend milestone is proving that a customer cannot obtain a LiveKit token unless Convex Auth, role, class window, reservation, capacity, and credits all pass.
