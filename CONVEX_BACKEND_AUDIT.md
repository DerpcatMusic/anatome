# Convex Backend Audit

Date: 2026-05-31

## Sources Used

- `convex/_generated/ai/guidelines.md`
- `.agents/skills/convex/SKILL.md`
- `.agents/skills/convex-performance-audit/SKILL.md`
- Official Convex documentation via Context7 for schema, internal functions,
  and query/index best practices.
- Convex deployment metadata and read-only insights.
- Three independent read-only subagent passes over schema, architecture, and
  Convex correctness/performance risks.

## Deployment Signals

- Development deployment showed two recent OCC retry warnings:
  `live/roster.js:clearLobbyPresence` and `liveReminders/process.js:due`.
- Production showed one recent OCC retry warning inside the Resend component
  workpool, not app backend code.
- No deployment insight signal pointed to broad read-limit or byte-limit
  failures in the app code during the last 72 hours.

## Honest Summary

The backend is not a monolithic mess. The schema is centralized, most high-churn
domains are normalized into separate tables, public functions generally derive
identity server-side, and function validators are broadly present.

The backend does have several real refactor targets:

- duplicated payment/order schema and CardCom flow logic,
- live class and roster modules carrying too many responsibilities,
- repeated singleton-per-user lookups without one consistent invariant helper,
- a real video admin pagination bug from filtering after pagination,
- a few bounded-today but unbounded-by-shape read/delete paths.

## Priority Findings

### P1: Video Admin Pagination Filters After Pagination

`convex/video/admin.ts` paginates videos by instructor and then filters the page
by status. This can return sparse or empty pages even when matching videos
exist later in the index.

Evidence:

- `convex/video/admin.ts:65`
- `convex/video/admin.ts:71`
- `convex/schema.ts:442`

Recommended refactor:

- Add `videos.by_instructorUserId_and_status_and_createdAt`.
- Query with both `instructorUserId` and `status`.
- Update `listAll` and `listByStatusPaginated` together.

### P1: CardCom Checkout Code Is Duplicated Across Order Kinds

Subscription and credit checkout actions duplicate low-profile creation,
buyer fallback, result validators, response handling, redirect-ready mutation,
failed mutation, and CSS fallback behavior.

Evidence:

- `convex/payments/cardcom/create.ts:9`
- `convex/payments/cardcom/createCredit.ts:10`
- `convex/payments/cardcom/orders.ts:12`
- `convex/payments/cardcom/creditOrders.ts:12`

Recommended refactor:

- Extract `payments/cardcom/lowProfile.ts` for shared execution and response
  handling.
- Extract shared status patch payload builders in `payments/cardcom/orderState.ts`.
- Keep thin table-specific actions for subscription and credit orders.
- Replace silent checkout CSS fallbacks with explicit catalog/presentation
  metadata or auditable fallback handling.

### P1: Live Class And Roster Modules Are The Main Monoliths

`convex/live/class.ts` is 558 lines and repeats auth/role/ownership checks
across mutations. It also mixes scheduling, room lifecycle, reminder handling,
reservation settlement, and instructor listing. `convex/live/roster.ts` repeats
reserved/joined/lobby reads across summary, instructor panel, and member panel.

Evidence:

- `convex/live/class.ts:117`
- `convex/live/class.ts:216`
- `convex/live/class.ts:298`
- `convex/live/class.ts:419`
- `convex/live/roster.ts:59`
- `convex/live/roster.ts:196`
- `convex/live/roster.ts:324`

Recommended refactor:

- Add `requireLiveClassManager(ctx, liveClassId)`.
- Extract lifecycle helpers for ending rooms, deleting LiveKit rooms, cancelling
  reminders, and rescheduling reminders.
- Add `loadLiveRosterRows(ctx, liveClassId, now)` and derive summary/panel
  shapes from the same bounded row set.
- Consider stored roster counters if instructor calendar summaries become hot.

### P2: Singleton Per User Tables Need One Invariant Pattern

`userWallets`, `appProfiles`, `notificationPreferences`, and `memberProfiles`
all imply one row per user, but enforcement and read behavior vary.

Evidence:

- `convex/schema.ts:32`
- `convex/schema.ts:208`
- `convex/schema.ts:545`
- `convex/schema.ts:552`
- `convex/lib/authz.ts:30`
- `convex/push/preferences.ts:16`

Recommended refactor:

- Add shared helpers for singleton read/upsert patterns.
- Use `take(2)` duplicate detection for financial/profile-critical records.
- Keep `unique()` only where duplicate failure is the desired behavior.
- Document singleton invariants next to each schema table.

### P2: Schema/Contract Validators Repeat Domain Shapes

Order statuses, credit pools, CardCom fields, role validators, video enums, and
live-class enums are repeated across schema, contracts, and modules.

Evidence:

- `convex/schema.ts:70`
- `convex/schema.ts:139`
- `convex/contracts/payments.ts:3`
- `convex/contracts/credits.ts:9`
- `convex/schema.ts:212`
- `convex/schema.ts:241`
- `convex/schema.ts:419`

Recommended refactor:

- Create shared validator modules for order, profile, live, and video domains.
- Reuse schema-safe field maps for CardCom order fields and credit order lines.
- Preserve migration compatibility; this can be code-only if validators are
  equivalent.

### P2: Bulk Video Cleanup Can Hit Transaction Limits

`cleanupVideo` collects and deletes every entitlement, category link, tag link,
and progress row in one mutation.

Evidence:

- `convex/videoInternal/admin.ts:35`
- `convex/videoInternal/admin.ts:44`
- `convex/videoInternal/admin.ts:53`
- `convex/videoInternal/admin.ts:62`

Recommended refactor:

- Convert cleanup into batched `.take(n)` deletion.
- Reschedule itself until child rows are gone.
- Delete the parent video only after children are drained.

### P3: Repeated Smaller Domain Logic

Lower-priority but worthwhile consolidation:

- 1:1 live class creation is duplicated in `convex/oneOnOne/instructor.ts`.
- Active plan lookup is duplicated in subscription checkout/customer paths.
- Customer billing guards repeat between subscription and credit checkout.
- `livekitAttendance/events.ts` collects all prior attendance rows for a
  class/user to find an open session; modest now, unbounded over time.

## Good Shape

- Schema is centralized in `convex/schema.ts`.
- Large/high-churn domains are mostly normalized: reservations, attendance,
  lobby presence, reminders, progress, rate limits, push subscriptions, and
  video taxonomy joins are separate tables.
- Convex function argument validators are broadly present.
- Public functions sampled derive auth identity server-side instead of trusting
  user IDs for authorization.
- No `ctx.db` use inside actions was found.
- No mixed Node-runtime files exporting queries/mutations were found.

## Suggested Refactor Sequence

1. Fix video admin pagination with the compound index and direct indexed query.
2. Batch `cleanupVideo` to remove transaction-limit risk.
3. Extract shared validators and order field maps, starting with payment/order
   shapes.
4. Extract CardCom low-profile orchestration while keeping table-specific
   actions thin.
5. Split live class management helpers and roster row loading.
6. Normalize singleton-per-user helpers and duplicate detection.
7. Consolidate 1:1 class creation and billing auth/plan lookup helpers.

Steps 1 and 2 are correctness/performance fixes. Steps 3 through 7 are the
larger maintainability refactor.
