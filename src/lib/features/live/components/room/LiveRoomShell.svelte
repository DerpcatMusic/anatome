<script lang="ts">
  import { page } from "$app/state";
  import { api } from "$convex/_generated/api";
  import type { Id } from "$convex/_generated/dataModel";
  import { Tooltip } from "bits-ui";
  import { useConvexClient, useQuery } from "convex-svelte";
  import { useEventListener } from "runed";
  import { LiveRoom } from "$lib/features/live/room.svelte";
  import { createLiveKitStageTracks } from "$lib/features/live/livekit-tracks.svelte";
  import { mountMedia } from "$lib/features/live/types";
  import { Button } from "bits-ui";
  import { useI18n } from "$lib/i18n/runes.svelte";
  import PreConnectOverlay from "./PreConnectOverlay.svelte";
  import RoomHeader from "./RoomHeader.svelte";
  import VideoStage from "./VideoStage.svelte";
  import ParticipantSidebar from "./ParticipantSidebar.svelte";
  import RoomChat from "./RoomChat.svelte";
  import ControlBar from "./ControlBar.svelte";
  import QualityPanel from "./QualityPanel.svelte";
  import JoinExpiryModal from "./JoinExpiryModal.svelte";
  import SessionEndedOverlay from "./SessionEndedOverlay.svelte";
  import "$lib/features/live/styles/room.css";

  const client = useConvexClient();
  const room = new LiveRoom(client);
  const stageTracks = createLiveKitStageTracks({
    getRoom: () => room.liveKitRoom,
    isInstructorIdentity: (identity) => room.isInstructorIdentity(identity),
  });
  const { t } = useI18n();

  const liveClassId = $derived(page.url.searchParams.get("classId") as Id<"liveClasses"> | null);

  const classStatusQuery = useQuery(api.live.class.get, () => {
    if (liveClassId === null || !room.inRoom) return "skip";
    return { liveClassId };
  });

  $effect(() => {
    const liveClass = classStatusQuery.data;
    if (liveClass === null || liveClass === undefined) return;
    if (liveClass.status === "ended" || liveClass.status === "cancelled") {
      room.handleClassEnded();
    }
  });

  const joinExpiryMinutes = $derived(
    room.secondsUntilExpiry === null ? 0 : Math.max(1, Math.ceil(room.secondsUntilExpiry / 60)),
  );

  function onKeyDown(e: KeyboardEvent) {
    const isMac = navigator.platform.includes("Mac");
    const mod = isMac ? e.metaKey : e.ctrlKey;
    if (!mod) return;
    switch (e.key.toLowerCase()) {
      case "d":
        e.preventDefault();
        void room.toggleMic();
        break;
      case "e":
        e.preventDefault();
        void room.toggleCamera();
        break;
    }
  }

  function onBeforeUnload(e: BeforeUnloadEvent) {
    const shouldWarn =
      room.connectionState === "connected" ||
      room.connectionState === "reconnecting" ||
      (room.inRoom && room.needsManualReconnect);
    if (shouldWarn) {
      e.preventDefault();
      e.returnValue = "";
    }
  }

  useEventListener(window, "keydown", onKeyDown);
  useEventListener(window, "beforeunload", onBeforeUnload);

  $effect(() => {
    room.initBrowserStabilityHandlers();
    void room.loadToken();
    return () => {
      room.destroy();
    };
  });
</script>

{#if room.sessionEndedByHost}
  <SessionEndedOverlay
    isInstructorRoom={room.isInstructorRoom}
    onExit={() => room.exitAfterDisconnect()}
  />
{:else if room.inRoom}
  <JoinExpiryModal
    bind:open={room.showJoinExpiryModal}
    minutesRemaining={joinExpiryMinutes}
    onStay={() => room.dismissJoinExpiryModal()}
    onLeave={() => room.exitAfterDisconnect()}
  />

  <Tooltip.Provider delayDuration={160}>
    <div class="lr-room">
      <div class="lr-room__viewport">
        <VideoStage
          isInstructorRoom={room.isInstructorRoom}
          videoTiles={stageTracks.videoTiles}
          screenShareTiles={stageTracks.screenShareTiles}
          hasScreenShare={stageTracks.hasScreenShare}
          activeSpeakerIdentity={room.activeSpeakerIdentity}
          tileSort={stageTracks.tileSort}
          primaryInstructorVideo={stageTracks.primaryInstructorVideo}
          selfVideo={stageTracks.selfVideo}
          classTitle={room.joinInfo?.classTitle ?? ""}
          instructorName={room.joinInfo?.instructorName ?? ""}
        />

        <div class="lr-room__header">
          <RoomHeader
            connectionState={room.connectionState}
            connectionLabel={room.connectionLabel}
            connectionQuality={room.connectionQuality}
            connectionQualityLabel={room.connectionQualityLabel}
            showConnectionWarning={room.showConnectionWarning}
            joinExpiryLabel={room.joinExpiryLabel}
            classTitle={room.joinInfo?.classTitle ?? ""}
            participantCount={room.participants.length}
            isInstructorRoom={room.isInstructorRoom}
            showQualityPanel={room.showQualityPanel}
            showParticipants={room.showParticipants}
            onToggleParticipants={() => (room.showParticipants = !room.showParticipants)}
            onToggleQualityPanel={() => (room.showQualityPanel = !room.showQualityPanel)}
            onLeave={() => {
              room.destroy();
              window.location.href = room.isInstructorRoom ? "/i/live" : "/u/calendar";
            }}
            onEndLive={room.isInstructorRoom ? () => room.endLive() : undefined}
          />
        </div>

        <ParticipantSidebar
          open={room.showParticipants}
          participants={room.participants}
          onClose={() => (room.showParticipants = false)}
        />
        <RoomChat
          open={room.showChat}
          messages={room.chatMessages}
          bind:draft={room.chatDraft}
          onSend={() => room.sendChatMessage()}
          onClose={() => (room.showChat = false)}
        />

        {#if room.connectionState === "reconnecting"}
          <div class="lr-reconnect-banner" role="status" aria-live="polite">
            <span class="material-symbols-rounded lr-reconnect-banner__icon" aria-hidden="true">sync</span>
            <div class="lr-reconnect-banner__text">
              <strong>{t.live.room.reconnectingOverlay()}</strong>
              <span>{t.live.room.reconnectingHint()}</span>
            </div>
          </div>
        {/if}

        {#if room.statusBanner || room.mediaError}
          <div class="lr-room__toasts">
            {#if room.statusBanner}
              <div class="lr-toast lr-toast--warn" role="status" aria-live="polite">{room.statusBanner}</div>
            {/if}
            {#if room.mediaError}
              <div class="lr-toast lr-toast--error" role="alert">
                <span>{room.mediaError}</span>
                <button
                  type="button"
                  class="lr-toast__dismiss"
                  onclick={() => room.dismissMediaError()}
                >
                  {t.live.room.mediaErrorDismiss()}
                </button>
              </div>
            {/if}
          </div>
        {/if}

        {#if room.isInstructorRoom && room.connectionState === "connected"}
          <p class="lr-instructor-audio-hint">{t.live.room.instructorAudioHint()}</p>
        {/if}

        <ControlBar {room} />
        <QualityPanel {room} />

        <div class="lr-audio-sink" aria-hidden="true">
          {#each room.audioTiles as tile (tile.id)}
            <div use:mountMedia={tile.element}></div>
          {/each}
        </div>
      </div>
    </div>
  </Tooltip.Provider>

  {#if room.needsManualReconnect}
    <div class="disconnect-overlay">
      <div class="disconnect-card">
        <span class="material-symbols-rounded" aria-hidden="true">wifi_off</span>
        <h2>{t.live.room.reconnectTitle()}</h2>
        <p>{room.mediaError || t.live.room.reconnectBody()}</p>
        <p class="disconnect-card__hint">{t.live.room.networkHelp()}</p>
        <div class="disconnect-actions">
          <Button.Root
            class="hb-button hb-button--ink hb-button--md"
            type="button"
            onclick={() => room.reconnect()}
          >
            {t.live.room.reconnectAction()}
          </Button.Root>
          <Button.Root
            class="hb-button hb-button--ghost hb-button--sm"
            type="button"
            onclick={() => room.exitAfterDisconnect()}
          >
            {t.live.room.reconnectExit()}
          </Button.Root>
        </div>
      </div>
    </div>
  {/if}
{:else if room.auth.isLoading || room.status === "checking"}
  <PreConnectOverlay {room} />
{:else if room.status === "locked" || room.status === "missing" || room.status === "waiting" || room.status === "prep" || room.status === "error"}
  <PreConnectOverlay {room} />
{:else if room.status === "ready" && room.joinInfo && room.connectionState === "idle"}
  <PreConnectOverlay {room} />
{:else if room.connectionState === "disconnected"}
  <div class="disconnect-overlay">
    <div class="disconnect-card">
      <span class="material-symbols-rounded" aria-hidden="true">wifi_off</span>
      <h2>{t.live.room.reconnectTitle()}</h2>
      <p>{room.mediaError || t.live.room.reconnectBody()}</p>
      <div class="disconnect-actions">
        <Button.Root
          class="hb-button hb-button--ink hb-button--md"
          type="button"
          onclick={() => room.reconnect()}
        >
          {t.live.room.reconnectAction()}
        </Button.Root>
        <Button.Root
          class="hb-button hb-button--ghost hb-button--sm"
          type="button"
          onclick={() => room.exitAfterDisconnect()}
        >
          {t.live.room.reconnectExit()}
        </Button.Root>
      </div>
    </div>
  </div>
{:else if room.connectionState === "connecting"}
  <div class="disconnect-overlay">
    <div class="disconnect-card">
      <span class="material-symbols-rounded lr-spin" aria-hidden="true">sync</span>
      <h2>{t.live.room.connecting()}</h2>
    </div>
  </div>
{/if}

<style>
  .disconnect-overlay {
    position: fixed;
    inset: 0;
    z-index: 60;
    display: grid;
    place-items: center;
    background: var(--ink);
    color: var(--white);
  }

  .disconnect-card {
    display: grid;
    gap: var(--space-4);
    max-width: 420px;
    text-align: center;
    padding: var(--space-6);
    border: 1px solid var(--white);
    background: var(--ink);
  }

  .disconnect-card .material-symbols-rounded {
    font-size: var(--step-4);
    color: var(--primary);
    justify-self: center;
  }

  .disconnect-card h2 {
    font-size: var(--step-3);
    margin: 0;
  }

  .disconnect-card p {
    color: var(--white);
    margin: 0;
  }

  .disconnect-card__hint {
    font-size: var(--step--1);
    opacity: 0.85;
  }

  .disconnect-actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-3);
    justify-content: center;
    padding-top: var(--space-2);
  }

  .lr-spin {
    animation: lr-spin 1.2s linear infinite;
  }
</style>
