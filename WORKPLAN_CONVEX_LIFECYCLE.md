# Convex lifecycle hardening plan

## Scope

- Replace primary polling lifecycles with scheduled functions.
- Keep existing crons as reconciliation/backstop jobs.
- Remove wall-clock-dependent subscription and credit lookups from reactive queries where possible.
- Preserve existing behavior for active data and avoid destructive data changes.

## Steps

1. [done] Add optional scheduling metadata to schema for subscriptions, live classes, reminders, and 1:1 requests.
2. [done] Add subscription renewal scheduling helpers and per-subscription renewal mutation.
3. [done] Schedule renewal from manual activation/grant and from renewals.
4. [done] Add live class start/end scheduling helpers and scheduled transition mutations.
5. [done] Schedule live lifecycle from class create/reschedule and 1:1 approval.
6. [done] Schedule reminder processing per reminder event instead of relying only on the reminder cron.
7. [done] Schedule stale 1:1 expiration per request.
8. [done] Remove Date.now-driven active subscription/current bucket lookups from main reactive queries by using stored status and subscription period.
9. [done] Verify with codegen, typecheck, and build.
10. [done] Re-scan for remaining Convex lifecycle/performance issues.
