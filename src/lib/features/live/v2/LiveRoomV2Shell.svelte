<script lang="ts">
  import { page } from "$app/state";
  import { useConvexClient } from "convex-svelte";
  import { useEventListener } from "runed";
  import { parseLiveClassId } from "$lib/convex/ids";
  import { QUERY_NOW_LIVE_ROOM_MS, useQueryNowMs } from "$lib/convex/queryClock.svelte";
  import { routePath } from "$lib/i18n/context";
  import { useI18n } from "$lib/i18n/runes.svelte";
  import PreConnectState from "$features/live/components/room/PreConnectState.svelte";
  import { useJoinContext } from "./join/useJoinContext.svelte";
  import { createLiveSessionV2, JOIN_TOKEN_REFRESH_MS } from "./session/LiveSession.svelte";
  import JoinGate from "./ui/JoinGate.svelte";
  import Stage from "./ui/Stage.svelte";
  import ControlBarV2 from "./ui/ControlBarV2.svelte";
  import InstructorJoinRoster from "$features/live/components/room/InstructorJoinRoster.svelte";
  import { useLiveLobbyHeartbeat } from "$features/live/hooks/useLiveLobbyHeartbeat.svelte";

  const client = useConvexClient();
  const session = createLiveSessionV2(client);
  const queryNow = useQueryNowMs(QUERY_NOW_LIVE_ROOM_MS);
  const { t } = useI18n();

  const liveClassId = $derived(parseLiveClassId(page.url.searchParams.get("classId")));
  const calendarHref = routePath("uCalendar");

  const join = useJoinContext({
    client,
    get liveClassId() {
      return liveClassId;
    },
    get nowMs() {
      return queryNow.nowMs;
    },
  });

  const isClassHost = $derived(join.joinAccess?.isInstructor === true);

  useLiveLobbyHeartbeat({
    get liveClassId() {
      return liveClassId;
    },
    get nowMs() {
      return queryNow.nowMs;
    },
    get status() {
      return join.status;
    },
    get isInstructor() {
      return isClassHost;
    },
    get inRoom() {
      return session.inRoom;
    },
  });

  let connecting = $state(false);
  let connectError = $state("");

  async function onEnter() {
    if (liveClassId === null) return;
    connectError = "";

    const info = join.credentials ?? (await join.enterRoom());
    if (info === null) return;

    session.joinInfo = info;
    connecting = true;
    try {
      await session.connect();
    } catch (reason) {
      connectError = reason instanceof Error ? reason.message : String(reason);
      join.clearCredentials();
      await session.leave();
    } finally {
      connecting = false;
    }
  }

  async function onLeave() {
    connectError = "";
    join.clearCredentials();
    await session.leave();
  }

  useEventListener(
    () => window,
    "pagehide",
    (event: PageTransitionEvent) => {
      if (event.persisted) return;
      if (session.room) void session.leave();
    },
  );

  $effect(() => {
    const id = liveClassId;
    if (!session.inRoom || id === null) return;

    const timer = setInterval(() => {
      void session.refreshToken(id);
    }, JOIN_TOKEN_REFRESH_MS);

    return () => clearInterval(timer);
  });

  const connectionLabel = $derived.by(() => {
    switch (session.connectionState) {
      case "connected":
        return t.live.room.connected();
      case "connecting":
        return t.live.room.connecting();
      case "reconnecting":
        return t.live.room.reconnecting();
      case "disconnected":
        return t.live.room.disconnected();
      default:
        return session.connectionState;
    }
  });
</script>

<div class="v2-room" data-connection={session.connectionState}>
  <header class="v2-room__header">
    <div class="v2-room__header-start">
      <span class="v2-room__badge">roomEngine=v2</span>
      <h1 class="v2-room__title">{session.joinInfo?.classTitle ?? join.classTitle ?? t.live.preConnect.title()}</h1>
    </div>
    {#if session.inRoom}
      <div class="v2-room__header-end">
        <span class="v2-room__state">{connectionLabel}</span>
        <button type="button" class="hb-button hb-button--secondary" onclick={() => void onLeave()}>
          {t.live.room.leave()}
        </button>
      </div>
    {/if}
  </header>

  <main class="v2-room__main">
    {#if liveClassId === null}
      <PreConnectState
        title={t.live.preConnect.missingTitle()}
        actionLabel={t.live.preConnect.missingCta()}
        actionHref={calendarHref}
      />
    {:else if session.inRoom && session.room && session.connectionState === "connected"}
      <Stage room={session.room} />
      {#if session.mediaError}
        <p class="v2-room__error v2-room__error--banner">{session.mediaError}</p>
      {/if}
    {:else}
      <div class="v2-preconnect" class:v2-preconnect--host={isClassHost}>
        <JoinGate {join} onEnter={onEnter} {connecting} />
        {#if isClassHost && liveClassId}
          <InstructorJoinRoster {liveClassId} nowMs={queryNow.nowMs} />
        {/if}
      </div>
      {#if connectError}
        <p class="v2-room__error v2-room__error--block">{connectError}</p>
      {/if}
    {/if}
  </main>

  {#if session.inRoom && session.room}
    <ControlBarV2 {session} />
  {/if}
</div>

<style>
  .v2-room {
    position: fixed;
    inset: 0;
    z-index: 60;
    display: grid;
    grid-template-rows: auto 1fr auto;
    background: var(--background);
    direction: rtl;
    padding-block: env(safe-area-inset-top) env(safe-area-inset-bottom);
    padding-inline: env(safe-area-inset-left) env(safe-area-inset-right);
  }

  .v2-room__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-3);
    padding: var(--space-3) var(--space-4);
    border-bottom: var(--border);
    background: var(--card);
  }

  .v2-room__header-start {
    display: grid;
    gap: var(--space-1);
    min-width: 0;
  }

  .v2-room__header-end {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    flex-shrink: 0;
  }

  .v2-room__badge {
    font-size: var(--step--2);
    font-weight: 700;
    color: var(--accent);
  }

  .v2-room__title {
    margin: 0;
    font-family: var(--font-display);
    font-size: var(--step-0);
    line-height: 1.2;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .v2-room__state {
    font-size: var(--step--1);
    font-weight: 600;
    color: var(--foreground-muted);
  }

  .v2-room__main {
    display: grid;
    min-height: 0;
    overflow: hidden;
  }

  .v2-preconnect {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
    min-height: 0;
    overflow: auto;
    padding: var(--space-4);
  }

  @media (min-width: 64rem) {
    .v2-preconnect--host {
      display: grid;
      grid-template-columns: minmax(0, 1fr) min(22rem, 32vw);
      align-items: start;
    }
  }

  .v2-room__error {
    margin: 0;
    color: var(--destructive);
    font-weight: 600;
  }

  .v2-room__error--block {
    place-self: center;
    text-align: center;
    max-width: 620px;
    padding: var(--space-4);
  }

  .v2-room__error--banner {
    position: absolute;
    inset-inline: var(--space-4);
    bottom: calc(72px + var(--space-3));
    padding: var(--space-2) var(--space-3);
    border-radius: var(--radius-md);
    background: color-mix(in srgb, var(--destructive) 12%, var(--card));
    border: 1px solid var(--destructive);
    z-index: 2;
  }
</style>
