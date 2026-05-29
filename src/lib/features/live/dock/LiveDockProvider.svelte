<script lang="ts">
  import { onMount } from "svelte";
  import { afterNavigate, beforeNavigate, goto } from "$app/navigation";
  import { isAppShellPath, isLiveRoomPath } from "./live-dock-paths";
  import { page } from "$app/state";
  import { parseLiveClassId } from "$lib/convex/ids";
  import { QUERY_NOW_LIVE_ROOM_MS, useQueryNowMs } from "$lib/convex/queryClock.svelte";
  import { useConvexClient } from "convex-svelte";
  import { liveRoomHref } from "$lib/i18n/context";
  import { createLiveSession } from "../live-session.svelte";
  import { useConvexJoinToken } from "../hooks/useConvexJoinToken.svelte";
  import {
    LiveDockController,
    setLiveDockContext,
    type LiveDockContext,
  } from "./live-dock.svelte";
  import LivePip from "./LivePip.svelte";

  let { children }: { children: import("svelte").Snippet } = $props();

  const client = useConvexClient();
  const session = createLiveSession(client);
  const dock = new LiveDockController(session);
  const queryNow = useQueryNowMs(QUERY_NOW_LIVE_ROOM_MS);

  const pathname = $derived(page.url.pathname);

  const urlClassId = $derived(parseLiveClassId(page.url.searchParams.get("classId")));

  const liveClassId = $derived(dock.activeClassId ?? urlClassId);

  const joinToken = useConvexJoinToken({
    client,
    get liveClassId() {
      return liveClassId;
    },
    get nowMs() {
      return queryNow.nowMs;
    },
  });

  session.refetchJoinToken = () => joinToken.refetch();
  session.onJoinInfoMinted = (info) => joinToken.setJoinInfo(info);

  session.onInstructorLeaveInApp = () => {
    dock.enterPip();
    void goto(session.isInstructorRoom ? "/i/calendar" : "/u/calendar");
  };

  session.onExitAfterDisconnect = () => {
    void session.requestSessionEnd().finally(() => {
      dock.finishSession();
      void goto(session.isInstructorRoom ? "/i/calendar" : "/u/calendar");
    });
  };

  function ensureInstructorPipIfNeeded() {
    if (!session.isInstructorRoom) return;
    if (isLiveRoomPath(pathname)) return;
    if (!session.sessionConnect || !session.liveKitRoom) return;
    dock.enterPip();
  }

  $effect(() => {
    if (liveClassId !== null) {
      dock.setActiveClassId(liveClassId);
      session.pinnedClassId = liveClassId;
    }
  });

  $effect(() => {
    if (!session.inRoom) return;
    const access = joinToken.joinAccess;
    if (access === null) return;
    if (access.status === "ended" || access.status === "cancelled") {
      session.handleClassEnded();
    }
  });

  $effect(() => {
    session.applyJoinTokenSnapshot({
      phase: joinToken.isLoading ? "loading" : joinToken.phase,
      status: joinToken.status,
      error: joinToken.error,
      joinInfo: joinToken.joinInfo,
      joinAccess: joinToken.joinAccess,
      classTitle: joinToken.classTitle,
    });
  });

  $effect(() => {
    if (session.keepAliveAcrossNavigation || dock.presentation === "pip") return;
    if (
      session.connectionState === "disconnected" &&
      !session.inRoom &&
      !session.sessionConnect
    ) {
      session.sessionConnect = false;
    }
  });

  /** Mirror reference `useEffect([connect])` — sync on every connect flag change. */
  $effect(() => {
    session.sessionConnect;
    void session.syncSessionConnect();
  });

  $effect(() => {
    dock.syncRoute(pathname, session.inRoom, session.isInstructorRoom);
  });

  $effect(() => {
    if (session.inRoom && session.isInstructorRoom) {
      session.keepAliveAcrossNavigation = true;
    }
  });

  $effect(() => {
    if (!session.sessionEndedByHost) return;
    if (dock.presentation === "pip") {
      dock.finishSession();
      void goto("/i/calendar");
    }
  });

  beforeNavigate((navigation) => {
    const fromPath = navigation.from?.url.pathname ?? pathname;
    const toPath = navigation.to?.url.pathname ?? pathname;
    dock.handleNavigation(fromPath, toPath, session.inRoom, session.isInstructorRoom);
    if (
      session.isInstructorRoom &&
      isLiveRoomPath(fromPath) &&
      isAppShellPath(toPath) &&
      !isLiveRoomPath(toPath) &&
      (session.inRoom || session.sessionConnect)
    ) {
      dock.enterPip();
    }
  });

  afterNavigate(() => {
    ensureInstructorPipIfNeeded();
  });

  async function endLiveFromDock() {
    await session.endLive(() => {
      dock.finishSession();
      void goto("/i/calendar");
    });
  }

  function expandFromPip() {
    const classId = dock.activeClassId ?? session.pinnedClassId;
    if (classId === null) return;
    dock.focusImmersive();
    void goto(liveRoomHref(classId));
  }

  const dockContext: LiveDockContext = {
    get session() {
      return session;
    },
    get presentation() {
      return dock.presentation;
    },
    get activeClassId() {
      return dock.activeClassId;
    },
    get pipBounds() {
      return dock.pipBounds;
    },
    get joinLoading() {
      return joinToken.isLoading;
    },
    setActiveClassId: (id) => dock.setActiveClassId(id),
    syncRoute: (p, inRoom, isInstructor) => dock.syncRoute(p, inRoom, isInstructor),
    handleNavigation: (from, to, inRoom, isInstructor) =>
      dock.handleNavigation(from, to, inRoom, isInstructor),
    focusImmersive: () => dock.focusImmersive(),
    enterPip: () => dock.enterPip(),
    updatePipBounds: (bounds) => dock.updatePipBounds(bounds),
    finishSession: () => dock.finishSession(),
    endLive: endLiveFromDock,
  };

  setLiveDockContext(dockContext);

  onMount(() => {
    session.initBrowserStabilityHandlers();
    return () => {
      if (dock.presentation === "pip" || session.inRoom) return;
      session.destroy();
    };
  });

</script>

{@render children()}

{#if dock.presentation === "pip" && session.isInstructorRoom && session.sessionConnect && session.liveKitRoom}
  <LivePip
    {session}
    bounds={dock.pipBounds}
    onBoundsChange={(b) => dock.updatePipBounds(b)}
    onExpand={expandFromPip}
    onEndLive={() => void endLiveFromDock()}
  />
{/if}
