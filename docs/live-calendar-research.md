# HomeBody Live Calendar And RSVP Research

Last updated: 2026-05-17

Scope: how customers discover, RSVP to, and join live classes. This covers site map, scheduling ownership, calendar libraries, Cal.com/open-source options, and backend implications.

## Decision

Build HomeBody's own class calendar and RSVP system in Convex.

Do not use Cal.com as the core booking backend for live classes.

Use a calendar UI library later only as a frontend rendering layer if the custom Svelte UI becomes too slow to build. The canonical schedule, capacity, credits, reservations, and join permissions must remain in Convex.

## Why Not Cal.com For Core Live Classes

Cal.com is strong for appointment scheduling:

- personal/team availability
- booking links
- managed users
- external calendar sync
- workflows/reminders
- API-driven booking creation
- hosted or self-hosted scheduling infrastructure

HomeBody's live product is not primarily appointment scheduling. It is class inventory with paid entitlements:

- classes are created by HomeBody/admin/instructors
- many customers reserve seats in the same class
- RSVP consumes or reserves plan credits
- capacity is a product rule, not just availability
- join tokens are short-lived and generated only after entitlement checks
- LiveKit room access depends on reservation, credits, class state, and role
- Hebrew/RTL user experience should be owned

Using Cal.com as the source of truth would duplicate or fight Convex state. We would still need Convex to check credits and issue LiveKit tokens, so Cal.com would become a second booking database that must be reconciled.

Self-hosting Cal.com also adds operational weight: another app, database, auth boundary, deployment, upgrades, and API/license uncertainty. That is not justified for group Pilates classes.

Sources:

- https://cal.com/docs
- https://cal.com/docs/api-reference/v2/bookings/get-all-bookings
- https://cal.com/docs/agents
- https://github.com/calcom/cal.com

## When Cal.com Could Be Useful Later

Consider Cal.com later for non-core scheduling:

- private 1:1 consultations
- instructor interviews
- sales calls
- physiotherapy intake appointments
- external calendar sync for instructors

If used later, Cal.com should be an integration at the edge, not the core live class entitlement system.

## Calendar UI Options

### Custom Svelte 5 Calendar

Best default for MVP.

Build only the views HomeBody needs:

- upcoming list
- weekly schedule
- class detail drawer/page
- RSVP button
- joined/reserved state
- "join live" state near class time

Pros:

- small bundle
- fits Astro/Svelte islands
- easy Hebrew/RTL polish
- no generic calendar UI baggage
- direct Convex subscriptions
- easier mobile-first class browsing

Cons:

- we build date navigation and view logic ourselves
- recurring class generation must be handled carefully

### FullCalendar

FullCalendar is a mature JavaScript calendar renderer. It supports month/week/day/list views, event sources, event clicking, recurring events through the RRule plugin, time zones, TypeScript, and several framework integrations.

Pros:

- mature calendar interactions
- good if admin/instructor scheduling needs drag/drop later
- list/week/month views out of the box
- recurring event support through `@fullcalendar/rrule`

Cons:

- visually generic unless heavily styled
- more JS than a simple class schedule needs
- Svelte is not a primary first-party integration in the docs
- some advanced resource/timeline features are premium

Use if:

- admin calendar editing becomes complex
- instructors need drag/drop scheduling
- weekly/monthly views become more important than a curated class list

Sources:

- https://fullcalendar.io/docs
- https://www.npmjs.com/package/@fullcalendar/rrule

### RRule

Use `rrule` if recurring classes are needed.

Important: do not store only an RRULE and compute everything dynamically forever. For credit/capacity/live rooms, each actual class occurrence should become a concrete `liveClasses` document before customers can RSVP.

Recommended approach:

- store optional recurring templates separately
- generate concrete class occurrences for the next 4-8 weeks
- each occurrence has its own capacity, reservations, status, room, and join window

Sources:

- https://www.npmjs.com/package/rrule
- https://www.npmjs.com/package/@fullcalendar/rrule

## Proposed Site Map

Public:

```text
/
/live
/live/:classId
```

Authenticated customer:

```text
/dashboard
/calendar
/calendar/:classId
/live-room/:classId
/account/credits
```

Instructor:

```text
/instructor
/instructor/calendar
/instructor/classes/:classId
/instructor/live/:classId
```

Admin:

```text
/admin
/admin/users
/admin/instructors
/admin/classes
/admin/classes/new
/admin/classes/:classId
/admin/calendar
```

MVP can collapse `/live`, `/calendar`, and `/dashboard/live` into one Svelte island if routing should stay simple.

## Customer Flow

Discovery:

1. Customer opens calendar/upcoming live page.
2. Convex query returns upcoming scheduled/live classes.
3. UI shows credit cost, capacity state, instructor, time, duration, and equipment requirements.

RSVP:

1. Customer clicks RSVP.
2. Convex mutation derives user from Convex Auth.
3. Convex checks active credit bucket.
4. Convex checks available credits.
5. Convex checks class status and capacity.
6. Convex creates `liveReservations`.
7. Convex increments reserved credits.

Join:

1. Join button appears only inside join window.
2. Customer clicks join.
3. Convex action requests join token.
4. Convex verifies reservation and class status.
5. Convex returns LiveKit token only for two-way classes.
6. Svelte 5 LiveKit UI connects using `livekit-client`.

Cancel:

1. Customer cancels before cutoff.
2. Convex marks reservation cancelled.
3. Convex releases reserved credits.

## Calendar States

Class card states:

- `scheduled`: RSVP possible if customer has credits and seats remain.
- `reserved`: customer has a seat.
- `full`: no seats remain.
- `live`: join possible if reserved and inside join window.
- `ended`: read-only.
- `cancelled`: read-only, refund policy applies.

Customer CTA states:

- "RSVP" if enough credits and capacity.
- "Not enough credits" if plan lacks available credits.
- "Full" if capacity reached.
- "Reserved" after RSVP.
- "Join live" inside join window.
- "Class ended" after end.

## Backend Additions Needed

Current backend already has:

- `liveClasses`
- `liveReservations`
- `liveRooms`
- credit reservation fields
- `liveClasses.reserve`
- `livekit.issueJoinToken`

Still needed:

- query that returns class plus viewer-specific reservation/credit state
- query that returns calendar range, e.g. `{ from, to }`
- cancellation cutoff field or policy
- admin cancel class mutation with refund behavior
- completion/no-show settlement job
- optional recurring class templates

Recommended table for recurring templates later:

```ts
liveClassTemplates: defineTable({
  title: v.string(),
  description: v.string(),
  type: v.union(v.literal("one_way"), v.literal("two_way")),
  instructorUserId: v.id("users"),
  timezone: v.string(),
  rrule: v.string(),
  durationMinutes: v.number(),
  capacity: v.number(),
  creditKind: v.union(v.literal("live"), v.literal("twoWay")),
  creditCost: v.number(),
  isActive: v.boolean(),
  createdAt: v.number(),
  updatedAt: v.number(),
}).index("by_instructorUserId", ["instructorUserId"])
  .index("by_isActive", ["isActive"])
```

Generated occurrences remain `liveClasses`.

## Timezone Rules

Use `Asia/Jerusalem` as the business timezone for:

- class display defaults
- credit reset windows
- recurring class generation
- admin scheduling defaults

Store actual class occurrence timestamps as epoch milliseconds in Convex.

Do not store local date strings as the source of truth for join checks.

## Recommendation

Build our own.

Specifically:

1. Keep `liveClasses` as concrete class occurrences.
2. Add calendar range and viewer-state queries.
3. Build an MVP Svelte 5 calendar/list island manually.
4. Add RRule-backed class templates only after manual class creation works.
5. Avoid Cal.com for group live class RSVP.
6. Consider FullCalendar only for admin/instructor scheduling complexity later.
