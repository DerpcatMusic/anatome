# Live Availability Refactor

## Current Problem

The studio calendar currently uses one drag gesture for two different mental models:

- Creating group live sessions is date-specific and creates a `liveClasses` document.
- Painting 1:1 availability is stored as weekly recurring rules in `oneOnOneAvailabilityRules`.

That mismatch is why dragging availability feels surprising: selecting one visible time edits the weekly template for that weekday/time, then the UI expands it across the visible calendar range.

## Immediate UI Rule

Availability mode must look and behave like a separate editing mode:

- The toolbar control says `זמינות 1:1` and has a strong active state.
- The calendar shows a persistent `סימון זמינות 1:1` strip while the mode is active.
- Group/live events stay visible as dimmed context and are not editable while drawing availability.
- Availability blocks stay fully opaque and interactive.

## Target Model

Separate exact availability windows from repeating templates.

### One-Off Windows

Use exact, dated records for availability created by dragging:

- `instructorUserId`
- `startsAt`
- `endsAt`
- `status`: `open`, `requested`, `reserved`, `blocked`, `expired`
- `source`: `manual`, `template`
- `templateId`, optional
- `createdAt`, `updatedAt`

Dragging on the calendar should create or remove only the selected dated window.

### Repeating Templates

Use templates only when the instructor explicitly chooses repetition:

- `instructorUserId`
- `daysOfWeek`
- `startMinute`
- `endMinute`
- `timezone`
- `effectiveFrom`
- `effectiveUntil`, optional
- `isActive`

The UI should make repetition explicit: after selecting a time, offer `חד-פעמי` as the default action and `חוזר שבועי...` as the secondary action. The repeat form can show weekday chips, start time, duration, date range, and a preview of the next occurrences.

## Customer Booking Flow

The customer should see available windows, request one, and wait for instructor approval.

The requested credit policy is approval-time reservation:

1. `requestSlot` creates a pending request without reserving credit.
2. `approveRequest` atomically verifies credit availability, reserves one 1:1 credit, creates the 1:1 `liveClasses` row, and creates the reservation.
3. `rejectRequest` closes the request without releasing credit because none was reserved.
4. If an approved class is cancelled before it ends, release the reserved credit.
5. When the 1:1 live is ended/settled, consume the reserved credit.

Current code reserves the credit in `requestSlot`, so this change needs a migration path for existing pending requests that may already have a reserved wallet entry.

