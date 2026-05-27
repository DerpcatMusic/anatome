# Runed + Approach A — Thin Live Session

**Runed version:** `runed@^0.37.1` (`package.json`)

**Related docs:** [`APPROACH_A_IMPLEMENTATION.md`](./APPROACH_A_IMPLEMENTATION.md), [`live-join-flow.md`](./live-join-flow.md), [`src/lib/livekit/RUNED_BITS_UI_GUIDE.md`](../src/lib/livekit/RUNED_BITS_UI_GUIDE.md)

**Target flow:**

```
חדר-לייב → createLiveSession() (Runed + Convex) → PreJoin → LiveKitRoom + VideoConference
```

**Status (2026-05-27):** The `LiveRoom` god-class chain is **removed**. Production uses `createLiveSession()` + `live-session-{core,ui,media,lifecycle}.svelte.ts` + `live-session-connect.ts`.

---

## Former `LiveRoom` layers (archived map)

| Layer | Class | Responsibilities | Runed / replacement |
|-------|--------|------------------|---------------------|
| Core | `LiveRoomCore` | Auth ref, `joinInfo`, `joinAccess`, `status`, `error`, `joinTokenPhase` | **`resource`** on `[classId, auth.isAuthenticated, auth.isLoading]` → `fetchJoinToken` (replaces `useConvexJoinToken` + `applyJoinTokenSnapshot` duplication) |
| UI | `LiveRoomUi` | Panel toggles, chat draft, modals | Plain **`$state`** on session object (not Runed) |
| Media | `LiveRoomMedia` | Devices, preview, publish, stats timers | **`PersistedState`** via `LivePersistentDevices` / `usePersistentUserChoices`; **`useInterval`** for stats/audio sampling; LiveKit hooks for tracks |
| Connection | `LiveRoomConnection` | `sessionConnect`, `inRoom`, LK `Room`, token refresh, expiry timers, online/offline | **`useEventListener`** for `online` / `offline` / `visibilitychange`; **`useInterval`** for join-expiry clock + waiting poll; connect logic stays in **`live-session-connect.ts`** |
| Façade | `LiveRoom` | i18n `$derived` labels | **`$derived`** on session (Svelte runes, not Runed) |

### Runed utilities by concern

| Concern | Runed API | Already in repo |
|---------|-----------|-----------------|
| Join token (Convex) | `resource` | `useAuthQuery.svelte.ts`, `CatalogShell.svelte`, `useConvexJoinToken` (manual — migrate to `resource`) |
| Device prefs (localStorage) | `PersistedState` | `live-persistent-devices.ts`, `usePersistentUserChoices.svelte.ts` |
| Window / document events | `useEventListener` | `LiveRoomShell.svelte`, `themeMedia.svelte.ts`, `useSwipe.svelte.ts` |
| Join expiry / waiting poll clocks | `useInterval` | Today: raw `setInterval` in `livekit-connection.svelte.ts` |
| Chat scroll stick-to-bottom | `ScrollState` | `RoomChat.svelte` |
| Stage / tile layout size | `ElementSize` | `useResizeObserver.svelte.ts` (livekit) |
| Convex query `now` arg | *(not Runed)* | `queryClock.svelte.ts` — keep; do not inline `Date.now()` in `useQuery` closures |

### Keep outside Runed

- **LiveKit** `Room` lifecycle, publish, track subscription → `live-session-connect.ts` + `@livekit` hooks
- **Convex** `issueJoin`, `getJoinAccess`, `start` / `end` mutations
- **bits-ui** for control chrome (see `RUNED_BITS_UI_GUIDE.md`)
- **`$derived`** for Hebrew labels and formatted stats (same as today on `LiveRoom`)

---

## `live-session.svelte.ts` — reference shape

Factory or class created once per shell (like `new LiveRoom(client)` today). Shell passes `classId` getter and wires keyboard / beforeunload via `useEventListener` **or** exposes hooks from the factory.

### 1. Persisted device prefs (`PersistedState`)

Reuse keys from `live-persistent-devices.ts` (`hb-live-*`). Prefer a **module-level** `PersistedState` bundle (works without component context), same pattern as `LivePersistentDevices`:

```ts
import { PersistedState } from "runed";
import { sanitizeMediaDeviceId } from "$lib/media/device-id";

const PREFIX = "hb-live";

const audioEnabled = new PersistedState(`${PREFIX}-audio-enabled`, true, { storage: "local" });
const videoEnabled = new PersistedState(`${PREFIX}-video-enabled`, true, { storage: "local" });
const audioDeviceId = new PersistedState(`${PREFIX}-audio-device`, "", { storage: "local" });
const videoDeviceId = new PersistedState(`${PREFIX}-video-device`, "", { storage: "local" });

export function readPersistedJoinChoices() {
  return {
    wantsMicOnJoin: audioEnabled.current,
    wantsCameraOnJoin: videoEnabled.current,
    selectedAudioDevice: sanitizeMediaDeviceId(audioDeviceId.current) ?? "",
    selectedVideoDevice: sanitizeMediaDeviceId(videoDeviceId.current) ?? "",
  };
}

export function writePersistedJoinChoices(choices: {
  wantsMicOnJoin: boolean;
  wantsCameraOnJoin: boolean;
  selectedAudioDevice: string;
  selectedVideoDevice: string;
}) {
  audioEnabled.current = choices.wantsMicOnJoin;
  videoEnabled.current = choices.wantsCameraOnJoin;
  if (choices.selectedAudioDevice) audioDeviceId.current = choices.selectedAudioDevice;
  if (choices.selectedVideoDevice) videoDeviceId.current = choices.selectedVideoDevice;
}
```

PreJoin can also use `usePersistentUserChoices` (`lk-*` keys) inside ported prefabs; **do not duplicate a third key namespace**.

### 2. Join token (`resource`)

Single async source — replaces parallel `useConvexJoinToken` + `room.applyJoinTokenSnapshot` + `loadTokenDirect`:

```ts
import type { ConvexClient } from "convex/browser";
import type { Id } from "$convex/_generated/dataModel";
import { resource } from "runed";
import { initAuth } from "$lib/auth/session.svelte";
import { fetchJoinToken, type JoinTokenSnapshot } from "./join-token";

const idleSnapshot: JoinTokenSnapshot = {
  phase: "idle",
  status: "checking",
  error: "",
  joinInfo: null,
  joinAccess: null,
};

export function createJoinTokenResource(
  client: ConvexClient,
  getClassId: () => Id<"liveClasses"> | null,
) {
  const auth = initAuth();

  const joinResource = resource(
    () => ({
      classId: getClassId(),
      isAuthenticated: auth.isAuthenticated,
      authLoading: auth.isLoading,
    }),
    async ({ classId, isAuthenticated, authLoading }, _prev, { signal }) => {
      if (authLoading) return idleSnapshot;
      if (classId === null) {
        return { ...idleSnapshot, status: "missing" as const };
      }
      const snapshot = await fetchJoinToken({
        client,
        isAuthenticated,
        authError: auth.error,
        classIdFromUrl: String(classId),
      });
      if (signal.aborted) return idleSnapshot;
      return snapshot;
    },
    { initialValue: idleSnapshot },
  );

  return {
    get snapshot() {
      return joinResource.current;
    },
    get phase() {
      return joinResource.current.phase;
    },
    get joinInfo() {
      return joinResource.current.joinInfo;
    },
    get joinAccess() {
      return joinResource.current.joinAccess;
    },
    get isLoading() {
      return joinResource.loading;
    },
    get error() {
      return joinResource.current.error;
    },
  };
}
```

Shell usage:

```ts
const join = createJoinTokenResource(client, () => liveClassId);
// join.snapshot → apply expiry timer + prepareJoin in connect module when phase === 'token'
// join.refetch via joinResource.refetch() for manual retry buttons
```

`resource` cancels in-flight fetches when `classId` or auth changes — important for race-free navigation.

### 3. Session state (`$state` + connect module)

```ts
import type { ConvexClient } from "convex/browser";
import type { Room } from "livekit-client";
import type { ConnectionState } from "./types";

export function createLiveSession(client: ConvexClient, getClassId: () => Id<"liveClasses"> | null) {
  const join = createJoinTokenResource(client, getClassId);

  let sessionConnect = $state(false);
  let joiningLive = $state(false);
  let inRoom = $state(false);
  let connectionState = $state<ConnectionState>("idle");
  let needsManualReconnect = $state(false);
  let browserOffline = $state(false);

  let liveKitRoom = $state<Room | null>(null);

  const devices = readPersistedJoinChoices();

  async function requestSessionStart() {
    joiningLive = true;
    sessionConnect = true;
    // live-session-connect.ts: syncSessionConnect(session, join.joinInfo, devices)
  }

  async function requestSessionEnd() {
    sessionConnect = false;
    // connect module tears down Room
  }

  return {
    join,
    get sessionConnect() { return sessionConnect; },
    get joiningLive() { return joiningLive; },
    get inRoom() { return inRoom; },
    get connectionState() { return connectionState; },
    get needsManualReconnect() { return needsManualReconnect; },
    get browserOffline() { return browserOffline; },
    get liveKitRoom() { return liveKitRoom; },
    devices,
    requestSessionStart,
    requestSessionEnd,
    // internal setters used only by live-session-connect.ts
  };
}
```

### 4. Browser stability (`useEventListener`)

Move off `LiveRoomConnection.initBrowserStabilityHandlers` into shell or `bindLiveSessionListeners(session)`:

```ts
import { useEventListener } from "runed";

export function bindLiveSessionListeners(session: ReturnType<typeof createLiveSession>) {
  useEventListener(window, "online", () => {
    session.browserOffline = false;
    if (session.inRoom && session.needsManualReconnect) {
      void session.reconnect?.();
    }
  });

  useEventListener(window, "offline", () => {
    session.browserOffline = true;
  });

  useEventListener(document, "visibilitychange", () => {
    if (document.visibilityState === "visible" && session.inRoom && session.needsManualReconnect) {
      void session.reconnect?.();
    }
  });

  useEventListener(window, "keydown", (e) => {
    const isMac = navigator.platform.includes("Mac");
    const mod = isMac ? e.metaKey : e.ctrlKey;
    if (!mod) return;
    if (e.key.toLowerCase() === "d") { e.preventDefault(); void session.toggleMic?.(); }
    if (e.key.toLowerCase() === "e") { e.preventDefault(); void session.toggleCamera?.(); }
  });

  useEventListener(window, "beforeunload", (e) => {
    const shouldWarn =
      session.connectionState === "connected" ||
      session.connectionState === "reconnecting" ||
      (session.inRoom && session.needsManualReconnect);
    if (shouldWarn) {
      e.preventDefault();
      e.returnValue = "";
    }
  });
}
```

`useEventListener` must run in a **component** `.svelte` context (or a `.svelte.ts` hook invoked from the shell). Do not call it from plain `.ts` connect modules.

### 5. Timers (`useInterval` — optional migration)

Replace `clockTimer` / `waitingPollTimer` in `livekit-connection.svelte.ts`:

```ts
import { useInterval } from "runed";

// Inside shell or live-session hook — 1s tick for join expiry labels
const expiryClock = useInterval(
  () => {
    session.nowMs = Date.now();
    session.checkJoinExpiryWarning?.();
  },
  1000,
);

// 30s waiting-room poll — only active when status === 'waiting'
const waitingPoll = useInterval(
  () => { void join.joinResource.refetch(); },
  30_000,
  { immediate: false },
);
// Pause waitingPoll when not waiting (expose pause/resume from useInterval return)
```

Token refresh (~7 minutes) fits `useInterval` or a one-shot `setTimeout` chain in the connect module — not Runed-specific.

---

## Shell wiring (target)

```svelte
<script lang="ts">
  import { useConvexClient } from "convex-svelte";
  import { createLiveSession, bindLiveSessionListeners } from "$lib/features/live/live-session.svelte";
  import { useQueryNowMs } from "$lib/convex/queryClock.svelte";

  const client = useConvexClient();
  const session = createLiveSession(client, () => liveClassId);
  const { nowMs } = useQueryNowMs();

  bindLiveSessionListeners(session);

  $effect(() => {
    if (!session.sessionConnect) void syncSessionConnect(session);
  });
</script>
```

Pass `session` (not `LiveRoom`) into `LiveControlBar`, `PreConnectOverlay`, etc.

---

## Anti-patterns to avoid

1. **Duplicating join token paths** — Do not keep both `useConvexJoinToken` `$effect` refetch and `LiveRoom.loadTokenDirect` / `applyJoinTokenSnapshot`. One `resource` (or one hook wrapping it) is the source of truth.

2. **Inlining `Date.now()` in Convex `useQuery` args** — Breaks subscription stability (`queryClock.svelte.ts`). Use `useQueryNowMs()` for `now` on `getJoinAccess` and similar.

3. **`PersistedState` inside short-lived `$effect` without cleanup** — Instantiate at module scope or in a factory once; use `.disconnect()` only when intentionally opting out of persistence (`usePersistentUserChoices` `preventSave` pattern).

4. **Calling `useEventListener` from `live-session-connect.ts`** — Runed listeners need Svelte lifecycle; keep them in the shell or a dedicated `bindLiveSessionListeners` called from the shell.

5. **Replacing LiveKit with Runed** — Runed does not manage `Room`, tracks, or participants. Use `@livekit` hooks + `live-session-connect.ts`.

6. **Replacing `$derived` with Runed `watch` for labels** — i18n/formatting derivations stay as Svelte `$derived`; use Runed `watch` only for side effects (timers, persistence sync, logging).

7. **Manual `addEventListener` + `$effect` cleanup** when `useEventListener` already covers the same events — duplicates teardown and risks leaks if `browserHandlersBound` flags drift.

8. **Two localStorage key families for the same prefs** — `hb-live-*` vs `lk-*`; align PreJoin and session on one namespace per surface or document the split explicitly.

9. **Stuffing UI panel state into `resource`** — Chat open, quality panel, modals are synchronous UI; keep as `$state` on the session object.

10. **Using `resource` for LiveKit connection state** — Connection state comes from `livekit-client` events; bridge into `$state` in the connect module, do not poll Convex for connection quality.

11. **Ignoring `signal.aborted` in fetchers** — Always bail early after `fetchJoinToken` when the resource invalidates (classId changed mid-flight).

12. **God-class regrowth** — If `live-session.svelte.ts` grows past ~200 lines of media/track logic, move that back to connect or livekit hooks; session file should orchestrate, not implement codecs and tile math.

---

## Migration checklist

- [ ] Add `live-session.svelte.ts` with `createLiveSession` + `createJoinTokenResource`
- [ ] Add `live-session-connect.ts` (port `syncSessionConnect`, `connectRoom`, `teardownActiveRoom` from `livekit-connection.svelte.ts`)
- [ ] Rewire `LiveRoomShell` to `session` + `bindLiveSessionListeners`
- [ ] Point `PreConnectOverlay` / `LiveControlBar` at `session` props
- [ ] Delete `room.svelte.ts` chain when grep shows no imports
- [ ] `bun run check` after each phase

---

## Quick reference links

| Topic | Location |
|-------|----------|
| Runed + bits-ui patterns | `src/lib/livekit/RUNED_BITS_UI_GUIDE.md` |
| Join flow diagram | `docs/live-join-flow.md` |
| Approach A file plan | `docs/APPROACH_A_IMPLEMENTATION.md` |
| Auth-gated `resource` | `src/lib/convex/useAuthQuery.svelte.ts` |
| Device persistence | `src/lib/features/live/live-persistent-devices.ts` |
| Runed upstream | https://runed.dev/docs |
