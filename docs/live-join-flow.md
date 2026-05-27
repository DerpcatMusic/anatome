# Live join flow (reference-aligned)

Aligned with [LiveKit Next.js `token.ts`](../../reference/livekit-components-js/examples/nextjs/pages/api/livekit/token.ts) and [`simple.tsx` / `customize.tsx`](../../reference/livekit-components-js/examples/nextjs/pages/simple.tsx) connect toggles.

## Flow diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│  /חדר-לייב?classId=…  →  LiveRoomShell                                 │
└───────────────────────────────┬─────────────────────────────────────────┘
                                │
        ┌───────────────────────▼───────────────────────┐
        │  useConvexJoinToken (idle/loading/error/token)   │
        │  fetchJoinToken → getJoinAccess + issueJoin      │
        └───────────────────────┬───────────────────────┘
                                │ phase === token
        ┌───────────────────────▼───────────────────────┐
        │  PreConnectOverlay + LivePersistentDevices       │
        │  (localStorage device prefs, preview tracks)     │
        └───────────────────────┬───────────────────────┘
                                │ user: Enter / Start live
        ┌───────────────────────▼───────────────────────┐
        │  sessionConnect = true  (reference: connect)     │
        │  $effect → syncSessionConnect()                  │
        │    1. teardownActiveRoom() if disconnecting      │
        │    2. connectRoom(joinInfo) if connecting        │
        └───────────────────────┬───────────────────────┘
                                │
        ┌───────────────────────▼───────────────────────┐
        │  livekit-client Room (inRoom, publish tracks)    │
        │  token refresh timer → issueJoin every ~7m       │
        └──────────────────────────────────────────────────┘

Disconnect path (reference: connect=false → session.end()):
  leave / destroy / disconnected → sessionConnect=false → teardownActiveRoom()
```

## State machines

| Layer | States | Backend |
|--------|--------|---------|
| Join token | `idle` → `loading` → `error` \| `token` | Convex `getJoinAccess` + `issueJoin` |
| Room UI status | `checking`, `waiting`, `prep`, `ready`, … | Derived from access + role |
| Session connect | `sessionConnect` boolean | Reference `connect` flag |
| LK connection | `idle` → `connecting` → `connected` / `reconnecting` / `disconnected` | `livekit-client` |

## Key files

| File | Role |
|------|------|
| `convex/livekit/token.ts` | Mint JWT (`issueJoin`) — unchanged contract |
| `src/lib/features/live/join-token.ts` | Shared `fetchJoinToken` |
| `src/lib/features/live/hooks/useConvexJoinToken.svelte.ts` | Reactive token hook |
| `src/lib/features/live/live-persistent-devices.ts` | PreJoin-style device persistence |
| `src/lib/features/live/livekit-connection.svelte.ts` | Sequential connect/disconnect |
| `src/lib/features/live/components/room/LiveRoomShell.svelte` | Wires hook + session effect |
