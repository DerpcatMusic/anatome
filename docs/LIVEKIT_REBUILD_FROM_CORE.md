# LiveKit rebuild — from official core (slow / delicate)

**Status:** in progress — v2 strangler at `src/lib/features/live/v2/` (`?roomEngine=v2`). Do not delete `src/lib/livekit/` until Phase 6.  
**Audience:** anyone rewriting the live room.  
**Principle:** Official LiveKit has **no Svelte UI package**. The supported path is:

1. [`livekit-client`](https://docs.livekit.io/home/client/connect/) — Room, tracks, connect, publish, text streams  
2. [`@livekit/components-core`](https://github.com/livekit/components-js/tree/main/packages/core) — `setup*` helpers + observables (framework-agnostic)  
3. **Your Svelte 5 UI** — thin, product-specific, in `src/lib/features/live/`

**Not in scope for “official”:** maintaining a full port of `@livekit/components-react` (~5k LOC). That is what made the codebase feel wrong.

---

## What we keep (product — do not rewrite from scratch)

These are **Homebody**, not LiveKit mistakes:

| Area | Location | Why keep |
|------|----------|----------|
| Join contract | `convex/live/joinContract.ts`, `docs/LIVE_JOIN_API.md` | `getJoinAccess` / `getJoinContext` + `issueJoin` |
| Token mint | `convex/livekit/token.ts` | Server JWT + `prepareJoin` |
| Client clock | `src/lib/convex/queryClock.svelte.ts` | `now` on queries |
| Instructor encode UI | `PreConnectSettings.svelte` | Not in LiveKit prefabs |
| Chat | `RoomChat.svelte` + `homebody.chat` text stream | Not Meet-style `useChat` |
| Hebrew / `lr-*` chrome | `room.css`, header, sidebars, overlays | Brand |
| RSVP / access rules | Convex `live/room.ts`, `joinAccess.ts` | Business logic |

Rewriting these “from LiveKit docs” would be a mistake. Rewriting **media UI + session wiring** is the goal.

---

## What we remove (eventually)

| Area | Why |
|------|-----|
| `src/lib/livekit/` as a mini library | Full React-tree port; app uses 4 exports |
| `live-session-{core,ui,media,lifecycle}.svelte.ts` inheritance stack | Replace with one explicit session module |
| Duplicate device keys (`lk-*` + `hb-live-*`) | One persistence story |
| Prefab wrappers that disable half their features | Build only what the product uses |

**Deletion rule:** only after the new path passes the phase checklist on `/חדר-לייב` with instructor + member.

---

## Target architecture (end state)

```text
Route /חדר-לייב
  └─ LiveRoomPage.svelte          (lazy shell, queryNow once)
       └─ join/                   (Convex only, no Room)
            useJoinContext.svelte.ts   → getJoinContext + issueJoin on demand
       └─ session/
            LiveSession.svelte.ts      (~300–500 LOC, flat $state, no extends)
            connect.ts                 room.connect / disconnect / pagehide
            publish.ts                 mic/cam/screen, autoSubscribe policy
            devices.ts                 hb-live-* only (PersistedState)
       └─ ui/                     (all Svelte, all lr-*)
            PreConnect.svelte          device preview (core helpers optional)
            Stage.svelte               video grid (core track refs OR raw Room API)
            ControlBar.svelte          bits-ui + room.localParticipant
            RoomChat, QualityPanel, …
```

**Optional official CSS:** `@livekit/components-styles` + map `--lk-*` → design tokens (no React).

**Dependencies (target):**

```json
"livekit-client": "...",
"@livekit/components-core": "..."
```

No `@livekit/components-react`. No `src/lib/livekit/prefabs/*`.

---

## Official references (read in order)

Read each section before coding that phase.

1. **Connect & lifecycle**  
   - https://docs.livekit.io/home/client/connect/  
   - https://docs.livekit.io/home/client/events/  
   - Disconnect, reconnect, `pagehide` (you already added — keep in `connect.ts`)

2. **Rooms, participants, tracks**  
   - https://docs.livekit.io/home/client/tracks/  
   - https://docs.livekit.io/home/client/tracks/publish/  
   - https://docs.livekit.io/home/client/tracks/subscribe/  
   - Member policy: `autoSubscribe: false` + explicit subscribe (documented in your `LIVEKIT_DOC_AUDIT.md`)

3. **Components core (when you need observers)**  
   - https://github.com/livekit/components-js/tree/main/packages/core  
   - Use `setup*` functions; bridge observables to Svelte with one small helper (see Phase 3)

4. **Data / chat**  
   - Text streams: LiveKit client docs (your `homebody.chat` topic)  
   - Do **not** port `useChat` / Meet chat UI unless product changes

5. **Server**  
   - Token grants: your Convex code + LiveKit server SDK docs  
   - Webhooks: `convex/livekit/webhook.ts` — touch only if phase requires

---

## Strangler pattern (no big bang)

Run **old and new in parallel** until Phase 6.

| Step | Mechanism |
|------|-----------|
| 1 | New folder `src/lib/features/live/v2/` — no imports from `src/lib/livekit/` |
| 2 | Feature flag or query `?roomEngine=v2` on `/חדר-לייב` (dev-only at first) |
| 3 | Same Convex APIs — byte-identical join behavior |
| 4 | When v2 passes checklist, switch default route, then delete v1 + `$lib/livekit` |

Never rewrite production join in place without a flag.

---

## Phases (each ends with manual QA + `bun run check`)

### Phase 0 — Baseline (1 session)

- [ ] Record screen: instructor join, member join, chat, leave, reconnect after 8+ min  
- [ ] `bun run check` / `bun run build` green  
- [ ] Note current bundle size for `/חדר-לייב` (vite build output)  
- [ ] Tag git commit or branch `livekit-rebuild` (user creates branch)

**Exit:** baseline video + metrics saved.

---

### Phase 1 — Join only (no video yet) — **started**

- [x] `v2/join/useJoinContext.svelte.ts`, `mintJoin.ts`, `types.ts`  
- [x] `v2/ui/JoinGate.svelte` + `LiveRoomV2Shell.svelte`  
- [x] Route flag `?roomEngine=v2` on `/חדר-לייב`

---

**Docs:** LIVE_JOIN_API.md, connect overview.

**Build:**

- `v2/join/useJoinContext.svelte.ts` — reactive `getJoinContext` + `useQueryNowMs`  
- `v2/join/issueJoin.ts` — call `issueJoin` **only** on user “Enter room” (no eager mint)  
- `v2/join/types.ts` — reuse validators from `join-token.ts` / `joinContract`

**Do not:** import `livekit-client` in this phase.

**QA:**

- [ ] PreJoin shows correct waiting / equipment / window states  
- [ ] Network tab: no `issueJoin` until Enter  
- [ ] Token refresh path designed (document in code comment; implement Phase 2)

---

### Phase 2 — Connect module (minimal Room) — **started**

**Docs:** client connect, connection state, token refresh.

**Build:**

- [x] `v2/session/connect.ts`  
- [x] `v2/session/LiveSession.svelte.ts` (flat)  
- [x] `v2/session/subscribe.ts` (member `autoSubscribe: false` policy)  
- [x] Token refresh timer wired in shell (`JOIN_TOKEN_REFRESH_MS`)  
- [x] Publish local camera/mic (`session/publish.ts`)

  - `createRoom()` → single `Room` instance  
  - `connect(wsUrl, token)` dynamic import `livekit-client`  
  - `disconnect()` on leave + `pagehide` (not `persisted`)  
  - `refreshToken(newToken)` → `room.connect(wsUrl, newToken)` per SDK  
- `v2/session/LiveSession.svelte.ts` — flat state: `room`, `connectionState`, `joinInfo`, `error`

**QA:**

- [ ] Connect/disconnect without publishing camera  
- [ ] Reconnect after forced token expiry (short TTL in dev)  
- [ ] No duplicate `Room` instances (grep `new Room`)

---

### Phase 3 — Core bridge (tiny, not a library) — **started**

**Docs:** components-core README + source for `setup*` you need.

**Build one file only:**

- [x] `v2/media/coreObservable.svelte.ts` — `subscribeObservable(obs, onValue)` → `$state` sync; cleanup on destroy
- [x] `v2/media/useStageTracks.svelte.ts` — `trackReferencesObservable` from core
- [x] `v2/ui/Stage.svelte`, `VideoTile.svelte`, `ControlBarV2.svelte`

**Use core only where it saves bugs:**

| Need | Core API | Skip core |
|------|----------|-----------|
| Track list for grid | `setupTracks` / track observer patterns | — |
| Speaking indicator | participant observer | — |
| Mute indicator | `setupTrackMutedIndicator` | — |
| Full VideoConference prefab | — | **Do not port** |

**Build:**

- `v2/ui/Stage.svelte` — renders local + remote video with explicit attach (see client track docs)  
- Start with **2 participants** case; then grid

**QA:**

- [ ] See/hear remote instructor  
- [ ] Member subscribe policy matches product  
- [ ] CPU acceptable with 6 tiles (Chrome performance panel)

---

### Phase 4 — Devices & pre-connect

**Docs:** publish local tracks, device switching.

**Build:**

- `v2/session/devices.ts` — **only** `hb-live-*` keys (delete `lk-*` migration after v1 gone)  
- `v2/ui/PreConnect.svelte` — preview + device select; no `PreJoin` prefab  
- Wire instructor `PreConnectSettings` → publish options on connect (existing Convex metadata)

**QA:**

- [ ] Device change before connect persists  
- [ ] Instructor simulcast / bitrate settings still apply  
- [ ] One `getUserMedia` path (no double open camera)

---

### Phase 5 — Product chrome

Port **behavior**, not files:

| v1 file | v2 action |
|---------|-----------|
| `LiveControlBar` | New bar: `room.localParticipant` + bits-ui |
| `RoomChat` | Copy logic; same text stream topic |
| `QualityPanel` | Read stats from `room` / participant APIs |
| `ParticipantSidebar` | Single `useParticipants` or raw `room.remoteParticipants` |
| `LiveRoomShell` | Thin composer only |

**QA:** full regression vs Phase 0 video.

---

### Phase 6 — Cutover & delete

- [ ] Default route uses `v2/`  
- [ ] Remove `src/lib/livekit/`  
- [ ] Remove `live-session-*.svelte.ts` v1 stack  
- [ ] Remove feature flag  
- [ ] Update `docs/LIVE_JOIN_API.md` callers table  
- [ ] `bun run check` / `bun run build`  
- [ ] Bundle compare to Phase 0

---

## Observable → Svelte bridge (reference implementation)

Keep this **under 40 lines**; do not grow into a framework.

```ts
import { onDestroy } from 'svelte';

export function useObservableState<T>(observable: { subscribe: (fn: (v: T) => void) => () => void }, initial: T) {
  let value = $state(initial);
  const unsub = observable.subscribe((v) => { value = v; });
  onDestroy(unsub);
  return {
    get current() { return value; },
  };
}
```

Prefer official `setup*` return values from `@livekit/components-core` over reimplementing observers.

---

## Anti-patterns (why v1 hurt)

| Anti-pattern | Official / better |
|--------------|-------------------|
| Port entire React component tree to Svelte | Core + small UI |
| `extends` session god-class | One `LiveSession` module, explicit functions |
| Eager `issueJoin` on page load | Query for gate; action on Enter |
| Two control paths (prefab + session toggles) | One API: `localParticipant` |
| Two chat systems (ported Chat + text stream) | Text stream only |
| 64-file internal “package” | &lt; 15 files under `features/live/v2` |

---

## When to pause and ask for help

- Grant / role bugs (member sees instructor-only tracks) → Convex `prepareJoin`, not UI  
- Token valid but connect fails → `wsUrl`, clock, or LiveKit Cloud project  
- OCC / reservation errors → Convex live module, not LiveKit  
- “Should we use React components?” → **No** for this codebase

---

## Estimated pace (deliberate)

| Phase | Calendar (part-time) |
|-------|----------------------|
| 0 | 0.5 day |
| 1 | 1–2 days |
| 2 | 2–3 days |
| 3 | 3–5 days |
| 4 | 2–3 days |
| 5 | 3–5 days |
| 6 | 1–2 days |

**Total:** ~3–4 weeks part-time, not one weekend.

---

## Next action

Start **Phase 0** on branch `livekit-rebuild`, then **Phase 1** only — no video until join is boringly correct.

Do not delete `src/lib/livekit/` until Phase 6 checklist is complete.
