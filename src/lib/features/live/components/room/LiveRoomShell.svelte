<script lang="ts">
  import { useEventListener } from "runed";
  import { Tooltip } from "bits-ui";
  import { LiveKitRoom } from "$lib/livekit";
  import RoomAudioRenderer from "$lib/livekit/components/RoomAudioRenderer.svelte";
  import InstructorStage from "./InstructorStage.svelte";
  import MemberStage from "./MemberStage.svelte";
  import { useI18n } from "$lib/i18n/runes.svelte";
  import { getLiveDockContext } from "$lib/features/live/dock/live-dock.svelte";
  import PreConnectOverlay from "./PreConnectOverlay.svelte";
  import RoomHeader from "./RoomHeader.svelte";
  import LiveRoomDockSidebar from "./LiveRoomDockSidebar.svelte";
  import LiveRoomAudioUnlock from "./LiveRoomAudioUnlock.svelte";
  import LiveControlBar from "./LiveControlBar.svelte";
  import { shouldShowMediaErrorInRoom } from "$lib/features/live/live-room-shared";
  import JoinExpiryModal from "./JoinExpiryModal.svelte";
  import SessionEndedOverlay from "./SessionEndedOverlay.svelte";
  import RoomContextMetrics from "./RoomContextMetrics.svelte";
  import SelfAudioMonitor from "./SelfAudioMonitor.svelte";
  import ConnectionStatusOverlay from "./ConnectionStatusOverlay.svelte";
  import { useConvexJoinToken } from "$lib/features/live/hooks/useConvexJoinToken.svelte";
  import { useLiveLobbyHeartbeat } from "$lib/features/live/hooks/useLiveLobbyHeartbeat.svelte";
  import { QUERY_NOW_LIVE_ROOM_MS, useQueryNowMs } from "$lib/convex/queryClock.svelte";
  import "$lib/features/live/styles/room.css";
  import "$lib/livekit/styles/livekit.css";

  const dock = getLiveDockContext();
  const session = dock.session;
  const { t } = useI18n();
  const queryNow = useQueryNowMs(QUERY_NOW_LIVE_ROOM_MS);

  useLiveLobbyHeartbeat({
    get liveClassId() {
      return session.getClassId();
    },
    get nowMs() {
      return queryNow.nowMs;
    },
    get status() {
      return session.status;
    },
    get isInstructor() {
      return session.isInstructorRoom;
    },
    get inRoom() {
      return session.inRoom;
    },
  });

  let participantCount = $state(0);

  const joinLoading = $derived(dock.joinLoading);

  const joinExpiryMinutes = $derived(
    session.secondsUntilExpiry === null
      ? 0
      : Math.max(1, Math.ceil(session.secondsUntilExpiry / 60)),
  );

  function onKeyDown(e: KeyboardEvent) {
    const isMac = navigator.platform.includes("Mac");
    const mod = isMac ? e.metaKey : e.ctrlKey;
    if (!mod) return;
    switch (e.key.toLowerCase()) {
      case "d":
        e.preventDefault();
        void session.toggleMic();
        break;
      case "e":
        e.preventDefault();
        void session.toggleCamera();
        break;
    }
  }

  function onBeforeUnload(e: BeforeUnloadEvent) {
    if (session.sessionEndedByHost) return;
    if (!session.sessionConnect && !session.inRoom) return;
    const shouldWarn =
      session.connectionState === "connected" ||
      session.connectionState === "reconnecting" ||
      (session.inRoom && session.needsManualReconnect);
    if (shouldWarn) {
      e.preventDefault();
      e.returnValue = "";
    }
  }

  useEventListener(window, "keydown", onKeyDown);
  useEventListener(window, "beforeunload", onBeforeUnload);
</script>

{#if session.sessionEndedByHost}
  <SessionEndedOverlay
    isInstructorRoom={session.isInstructorRoom}
    onExit={() => session.exitAfterDisconnect()}
  />
{:else if !session.inRoom}
  <PreConnectOverlay
    {session}
    {joinLoading}
    onEndLive={session.isInstructorRoom ? () => dock.endLive() : undefined}
  />
{:else}
  <div class="live-room-shell">
    <JoinExpiryModal
      bind:open={session.showJoinExpiryModal}
      minutesRemaining={joinExpiryMinutes}
      onStay={() => session.dismissJoinExpiryModal()}
      onLeave={() => session.exitAfterDisconnect()}
    />

    <Tooltip.Provider delayDuration={160}>
      <LiveKitRoom room={session.liveKitRoom!}>
        <LiveRoomAudioUnlock room={session.liveKitRoom!} />
        <RoomAudioRenderer room={session.liveKitRoom!} />

        <div class="lr-room">
          <div class="lr-room__viewport lr-room__viewport--sidebar">
            {#if session.isInstructorRoom}
              <InstructorStage class="lr-lk-stage" />
            {:else}
              <MemberStage
                class="lr-lk-stage"
                hostUserId={session.classHostUserId}
                broadcastHostUserId={session.joinAccess?.broadcastStartedByUserId ?? null}
                hostDisplayName={session.joinInfo?.instructorName ??
                  session.joinAccess?.instructorName ??
                  ""}
              />
            {/if}

            <div class="lr-room__header">
              <RoomHeader
                {session}
                connectionState={session.connectionState}
                connectionLabel={session.connectionLabel}
                connectionQuality={session.connectionQuality}
                connectionQualityLabel={session.connectionQualityLabel}
                showConnectionWarning={session.showConnectionWarning}
                joinExpiryLabel={session.joinExpiryLabel}
                classTitle={session.joinInfo?.classTitle ?? ""}
                {participantCount}
                isInstructorRoom={session.isInstructorRoom}
                onLeave={() => session.leave()}
                onEndLive={session.isInstructorRoom ? () => void dock.endLive() : undefined}
              />
            </div>

            <LiveRoomDockSidebar {session} {participantCount} />

            {#if session.connectionState === "reconnecting"}
              <div class="lr-reconnect-banner" role="status" aria-live="polite">
                <span class="material-symbols-rounded lr-reconnect-banner__icon" aria-hidden="true"
                  >sync</span
                >
                <div class="lr-reconnect-banner__text">
                  <strong>{t.live.room.reconnectingOverlay()}</strong>
                  <span>{t.live.room.reconnectingHint()}</span>
                </div>
              </div>
            {/if}

            {#if session.statusBanner || shouldShowMediaErrorInRoom(session.mediaError, session.cameraEnabled)}
              <div class="lr-room__toasts">
                {#if session.statusBanner}
                  <div class="lr-toast lr-toast--warn" role="status" aria-live="polite">
                    {session.statusBanner}
                  </div>
                {/if}
                {#if shouldShowMediaErrorInRoom(session.mediaError, session.cameraEnabled) && !session.needsManualReconnect}
                  <div class="lr-toast lr-toast--error" role="alert">
                    <span>{session.mediaError}</span>
                    <button
                      type="button"
                      class="lr-toast__dismiss"
                      onclick={() => session.dismissMediaError()}
                    >
                      {t.live.room.mediaErrorDismiss()}
                    </button>
                  </div>
                {/if}
              </div>
            {/if}

            <LiveControlBar {session} />

            <SelfAudioMonitor room={session.liveKitRoom!} enabled={session.selfAudioMonitorEnabled} />
            <RoomContextMetrics onParticipantCount={(n) => (participantCount = n)} />
          </div>
        </div>
      </LiveKitRoom>
    </Tooltip.Provider>
  </div>

  {#if session.needsManualReconnect}
    <ConnectionStatusOverlay
      icon="wifi_off"
      title={t.live.room.reconnectTitle()}
      message={session.mediaError || t.live.room.reconnectBody()}
      hint={t.live.room.networkHelp()}
      tone="warning"
      primaryLabel={t.live.room.reconnectAction()}
      onPrimary={() => session.reconnect()}
      secondaryLabel={t.live.room.reconnectExit()}
      onSecondary={() => session.exitAfterDisconnect()}
    />
  {/if}
{/if}

<style>
  .live-room-shell {
    position: relative;
    flex: 1 1 auto;
    min-height: 0;
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;
  }

  :global(.lr-room__viewport--sidebar .lr-lk-stage) {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    min-width: 0;
    min-height: 0;
    --lk-control-bar-height: 0px;
    z-index: 1;
  }

  :global(.lr-room__viewport--sidebar .lr-lk-stage .lk-video-conference),
  :global(.lr-room__viewport--sidebar .lr-lk-stage .lk-video-conference-inner) {
    min-height: 0;
    height: 100%;
  }

  :global(.lr-room__viewport--sidebar .lr-lk-stage .lk-grid-layout-wrapper),
  :global(.lr-room__viewport--sidebar .lr-lk-stage .lk-focus-layout-wrapper) {
    flex: 1 1 auto;
    min-height: 0;
    height: 100%;
    padding-block: 52px 88px;
    box-sizing: border-box;
  }

  :global(.lr-room__viewport--sidebar .lr-lk-stage .lk-participant-tile) {
    min-height: 0;
    height: 100%;
  }
</style>
