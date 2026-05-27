# LiveKit doc audit (static + agents)

Generated from `lk` CLI 2.16.3, LiveKit docs, and code review. Runtime verification: see `.cursor/debug-669be5.log` after reproduction.

## Client (P1)

| Issue | Verdict | Fix |
|-------|---------|-----|
| Member connect uses default `autoSubscribe: true` then manual `setSubscribed` | RISKY | `connect(url, token, { autoSubscribe: false })` for members |
| PreJoin `createLocalTracks` then `setCameraEnabled` on join | RISKY | Double getUserMedia; logs hypothesis A |
| `disconnectOnPageLeave: false` without always calling disconnect | RISKY | `pagehide` → `room.disconnect()` |
| LiveSession missing wake lock / connection quality handlers | RISKY | Port from legacy `connectRoom` |
| `LiveKitRoom` without `prepareConnection` when self-connecting | RISKY | Add prepare or external-room only |

## Server (P1)

| Issue | Verdict | Fix |
|-------|---------|-----|
| Webhook requires `status === live` but token allows instructor earlier | WRONG | Align webhook + `prepareJoin` |
| `emptyTimeout` derived from `joinClosesAt` | WRONG | Use fixed pre-join timeout; use cron for lifecycle |
| No `participant_connection_aborted` handler | RISKY | Close attendance rows |
| Webhook 500 triggers retries | RISKY | 200 + idempotent `event.id` |

## OK

- `prepareConnection` → `connect` → publish on same Room
- JWT grants match UI (screen share instructor-only)
- Webhook signature validation + `removeParticipant` on deny
