<script lang="ts">
  import type { LocalUserChoices } from "@livekit/components-core";
  import { useI18n } from "$lib/i18n/runes.svelte";
  import {
    resolveLiveSession,
    type LiveSessionPreConnect,
  } from "$lib/features/live/live-session.svelte";
  import { getMediaErrorMessage } from "$lib/features/live/live-room-shared";
  import PreConnectFrame from "./PreConnectFrame.svelte";
  import LiveClassScheduleChip from "./LiveClassScheduleChip.svelte";
  import PreConnectState from "./PreConnectState.svelte";
  import {
    canHostStartBroadcast,
    isBroadcastActive,
  } from "$lib/features/live/lib/preconnect-ui";
  import InstructorJoinRoster from "./InstructorJoinRoster.svelte";
  import EndLiveConfirm from "./EndLiveConfirm.svelte";
  import PreConnectEntryStatus from "./PreConnectEntryStatus.svelte";
  import PreConnectPrejoinStage from "./PreConnectPrejoinStage.svelte";
  import { QUERY_NOW_LIVE_ROOM_MS, useQueryNowMs } from "$lib/convex/queryClock.svelte";

  function makeFrameSubtitle(instructorName: string | undefined, t: ReturnType<typeof useI18n>["t"]) {
    if (!instructorName) return "";
    return t.live.preConnect.classWithInstructor({ name: instructorName });
  }

  let {
    session: sessionProp,
    room: roomAlias,
    joinLoading = false,
    onEndLive,
  }: {
    session?: LiveSessionPreConnect;
    /** @deprecated Pass `session` instead. */
    room?: LiveSessionPreConnect;
    joinLoading?: boolean;
    onEndLive?: () => void | Promise<void>;
  } = $props();

  const session = $derived(resolveLiveSession(sessionProp, roomAlias, "PreConnectOverlay"));
  const { t } = useI18n();
  const queryNow = useQueryNowMs(QUERY_NOW_LIVE_ROOM_MS);
  const liveClassId = $derived(session.getClassId());

  const backHref = $derived(session.isInstructorRoom ? "/i/calendar" : "/u/calendar");
  const profileHref = $derived(
    session.isInstructorRoom ? "/i/dashboard?panel=account" : "/u/dashboard?panel=account",
  );
  const canStartBroadcast = $derived(
    canHostStartBroadcast(
      session.isClassHost,
      session.isInstructorRoom,
      session.joinAccess,
      session.status,
    ),
  );
  const isPrep = $derived(canStartBroadcast);
  const broadcastAlreadyLive = $derived(isBroadcastActive(session.joinAccess));
  const isReady = $derived(
    session.status === "ready" &&
      (session.joinInfo !== null || session.joinAccess?.canEnter === true),
  );
  const isChecking = $derived(
    joinLoading || session.status === "checking" || session.auth.isLoading,
  );
  const isJoining = $derived(
    session.joiningLive || session.connectionState === "connecting",
  );
  const showDeviceSetup = $derived(
    (isPrep || isReady) &&
      (session.joinInfo !== null || session.joinAccess?.canEnter === true),
  );
  const frameTitle = $derived(
    session.joinInfo?.classTitle?.trim() ||
      session.joinContextTitle?.trim() ||
      t.live.preConnect.title(),
  );
  const frameSubtitle = $derived(makeFrameSubtitle(session.joinInfo?.instructorName, t));

  const broadcastStatusLabel = $derived.by(() => {
    if (canStartBroadcast) return t.live.preConnect.statusAwaitingStart();
    return session.classBroadcastLabel ?? "";
  });

  const showEndLiveOnPreconnect = $derived(
    session.isClassHost && broadcastAlreadyLive && !canStartBroadcast && Boolean(onEndLive),
  );

  let showEndLiveConfirm = $state(false);
  let endingLive = $state(false);

  function onPreJoinSubmit(choices: LocalUserChoices) {
    void session.enterFromPreJoin(choices, { isPrep });
  }

  function onPreJoinError(error: Error) {
    if (error instanceof DOMException) {
      if (error.name === "NotFoundError" || error.name === "DevicesNotFoundError") return;
    }
    session.mediaError = getMediaErrorMessage("camera", error);
    session.wantsCameraOnJoin = false;
  }

  function openEndLiveConfirm() {
    showEndLiveConfirm = true;
  }

  function confirmEndLive() {
    if (!onEndLive || endingLive) return;
    endingLive = true;
    showEndLiveConfirm = false;
    void Promise.resolve(onEndLive()).finally(() => {
      endingLive = false;
    });
  }

  function handleLoadToken() {
    session.loadToken();
  }

  function handleEnterWithoutDevices() {
    void session.enterWithoutDevicesFromPreJoin({ isPrep });
  }

  function handleEnterWithoutDevicesNonInstructor() {
    void session.enterWithoutDevicesFromPreJoin({ isPrep: false });
  }

  function handleRetryReconnect() {
    void session.reconnect();
  }
</script>

<div class="preconnect-layout" class:preconnect-layout--instructor={session.isClassHost}>
  <PreConnectFrame
    title={frameTitle}
    subtitle={frameSubtitle}
    statusLabel={broadcastStatusLabel}
    statusTone={canStartBroadcast ? "prep" : session.joinAccess?.status === "live" ? "live" : "default"}
  >
    {#snippet schedule()}
      {#if session.joinAccess}
        <LiveClassScheduleChip
          startsAt={session.joinAccess.startsAt}
          endsAt={session.joinAccess.joinClosesAt}
          nowMs={queryNow.nowMs}
          variant="inline"
        />
      {/if}
    {/snippet}
  {#if session.status === "locked"}
    <PreConnectState
      title={t.live.preConnect.lockedTitle()}
      message={session.auth.error}
      actionLabel={t.live.preConnect.lockedCta()}
      actionHref="/"
    />
  {:else if session.status === "missing"}
    <PreConnectState
      title={t.live.preConnect.missingTitle()}
      actionLabel={t.live.preConnect.missingCta()}
      actionHref={backHref}
    />
  {:else if session.status === "invalidClass"}
    <PreConnectState
      title={t.live.preConnect.invalidClassTitle()}
      message={t.live.preConnect.invalidClassBody()}
      actionLabel={t.live.preConnect.missingCta()}
      actionHref={backHref}
    />
  {:else if session.status === "equipment"}
    <PreConnectState
      title={t.live.preConnect.equipmentTitle()}
      message={t.live.preConnect.equipmentBody()}
      tone="caution"
      actionLabel={session.isInstructorRoom ? t.live.preConnect.equipmentCtaStudio() : t.live.preConnect.equipmentCtaProfile()}
      actionHref={session.isInstructorRoom ? backHref : profileHref}
      secondaryLabel={session.isInstructorRoom ? t.live.preConnect.equipmentCtaProfile() : t.live.preConnect.equipmentCtaCalendar()}
      secondaryHref={session.isInstructorRoom ? profileHref : backHref}
    />
  {:else if session.status === "waiting"}
    <PreConnectState
      title={session.joinWaitingTitle}
      message={session.joinWaitingMessage ?? t.live.room.joinTooEarlyBody()}
      actionLabel={t.live.preConnect.retry()}
      onAction={handleLoadToken}
      secondaryLabel={t.live.preConnect.backCalendar()}
      secondaryHref={backHref}
    />
  {:else if session.status === "error"}
    <PreConnectState
      title={t.live.preConnect.errorTitle()}
      message={session.error}
      tone="danger"
      actionLabel={t.live.preConnect.retry()}
      onAction={handleLoadToken}
      secondaryLabel={t.live.preConnect.backCalendar()}
      secondaryHref={backHref}
    />
  {:else if showDeviceSetup}
    <div class="entry-stack" class:entry-stack--joining={isJoining}>
      <PreConnectEntryStatus
        {session}
        {isChecking}
        {isJoining}
        {canStartBroadcast}
        {showEndLiveOnPreconnect}
        {endingLive}
        onOpenEndLiveConfirm={openEndLiveConfirm}
        onRetryReconnect={handleRetryReconnect}
      />
      <PreConnectPrejoinStage
        {session}
        {isJoining}
        {isChecking}
        {isPrep}
        {canStartBroadcast}
        onPreJoinSubmit={onPreJoinSubmit}
        onPreJoinError={onPreJoinError}
        onEnterWithoutDevices={handleEnterWithoutDevices}
        onEnterWithoutDevicesNonInstructor={handleEnterWithoutDevicesNonInstructor}
      />
    </div>
  {:else if isChecking}
    <PreConnectState loading message={t.live.preConnect.checking()} />
  {/if}
</PreConnectFrame>

  {@render preConnectRoster()}
</div>

<EndLiveConfirm bind:open={showEndLiveConfirm} pending={endingLive} onConfirm={confirmEndLive} />

{#snippet preConnectRoster()}
  {#if session.isClassHost && liveClassId}
    <InstructorJoinRoster {liveClassId} nowMs={queryNow.nowMs} />
  {/if}
{/snippet}

<style>
  .preconnect-layout {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
    width: 100%;
    height: 100%;
    min-height: 0;
  }

  @media (min-width: 64rem) {
    .preconnect-layout--instructor {
      display: grid;
      grid-template-columns: minmax(0, 1fr) min(22rem, 34vw);
      align-items: stretch;
    }
  }

  .entry-stack {
    display: grid;
    gap: var(--space-4);
    min-height: 0;
  }
</style>
