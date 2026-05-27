# RSVP + LiveKit Fix Plan

## Findings

- `CreditCostTooltip` is rendered on calendar cards without a `Tooltip.Provider` ancestor, which matches the production `Context "Tooltip.Provider" not found` crash.
- Group live classes allow customer walk-in joins during the live window. `live.calendar.listRange` marks an unreserved customer as joinable, and `live.room.prepareJoin` silently reserves credits when issuing a LiveKit token.
- The reported LiveKit room is no longer active; `lk` confirms no active room or participants to inspect.

## Changes

1. Add one app-wide Bits UI tooltip provider in the root Svelte layout.
2. Require an active reservation before issuing customer LiveKit tokens.
3. Make calendar join eligibility depend on an existing active reservation; live classes can still be reserved while open.
4. Run type/check verification with Bun.
