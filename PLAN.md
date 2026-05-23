# Homebody Legal + Subscription Plan

## Completed Legal Scope

Update `legal-checklist-hebrew.md` and `legal-research-israel-2026.md` for an Israeli online Pilates platform focused on rehabilitative movement, short self-practice exercise videos, and live sessions.

## Research Notes

- Use official Israeli sources where possible: Privacy Protection Authority, Consumer Protection Authority, Accessibility standard/public guidance, Tax Authority.
- Treat legal conclusions as risk classification, not legal advice.
- Separate confirmed legal duties from lawyer-review items and product-risk recommendations.

## Edge Cases

- Health/pathology inputs may become sensitive personal data and increase privacy/security obligations.
- Rehabilitative wording can accidentally imply medical diagnosis/treatment; copy must avoid medical claims unless licensed professionals supervise.
- Cancellation rules differ between digital video access, subscriptions, private live sessions, and group live sessions.

## Implementation

- Completed: rewrote checklist into actionable launch checklist.
- Completed: rewrote research file into structured legal/research memo with source links and platform-specific recommendations.
- Completed: added website legal routes and footer links.
- Completed: added onboarding health-info consent before saving optional sensitive notes.

## Verification

- Completed: `npm run check`.
- Completed: `npm run build`.

## Current Credit-System Hardening

Scope:

- Confirm paid-plan records are real product plans, with no payment provider selected yet.
- Confirm macroflow videos can be unlocked once with VOD credits and then watched permanently by that user.
- Confirm live group RSVP reserves live credits, authorized room access is gated by user identity, rejoin does not double-charge, and no-shows are released.
- Confirm one-on-one credits are reserved at request time and consumed only when the live session is actually joined.

Edge cases:

- Duplicate historical reservation or entitlement rows should not crash `.unique()` lookups.
- A user who receives a LiveKit token but fails to connect should not lose the credit.
- LiveKit webhook failure must leave credits reserved so settlement can release no-shows instead of silently marking usage.

Implementation:

- In progress: move live credit consumption from token issuance to verified LiveKit `participant_joined`.
- In progress: replace risky uniqueness assumptions on user/video and user/class operational rows with bounded indexed reads.

## Lifecycle + Database Audit

Scope:

- Use `bun` for frontend verification commands.
- Audit Svelte context/lifecycle hooks so `getContext`/Convex hooks are only used during component initialization.
- Audit Convex paths where missing uniqueness guarantees can crash `.unique()` lookups.

Findings:

- Fixed: `OnboardingForm.svelte` called `useConvexClient()` inside `submit()`.
- In progress: replace important profile/member/subscription/video/live `.unique()` reads with bounded indexed reads where duplicate historical rows could exist.
- In progress: remove Convex-invalid `undefined` optional field from onboarding insert payload.
