# LiveKit Hardening Plan

1. Completed: Extract shared live join helpers in `convex/live/joinPolicy.ts` for role parsing, active reservation lookup, equipment checks, customer requirements, and admin/instructor role rules.
2. Completed: Update token issuance to use shared policy, keep RSVP/walk-in reservation behavior, return admin/instructor capacity allowance, use `TTL.JOIN_TOKEN`, and reconcile existing LiveKit room metadata.
3. Completed: Update LiveKit webhook handling to re-run authorization policy, consume credits only once, and record each join as a separate attendance session.
4. Completed: Verify RSVP customer reservation flow remains capacity-gated and idempotent by preserving `liveReservations` seat checks before customer token/webhook access.
5. Completed: Run app and Convex type validation.
