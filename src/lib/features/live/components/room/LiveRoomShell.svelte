<script lang="ts">
  import { page } from "$app/state";
  import { api } from "$convex/_generated/api";
  import type { Id } from "$convex/_generated/dataModel";
  import { Tooltip } from "bits-ui";
  import { useConvexClient, useQuery } from "convex-svelte";
  import { useEventListener } from "runed";
  import { LiveRoom } from "$lib/features/live/room.svelte";
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
      {#if room.connectionState === "reconnecting"}
        <div class="lr-reconnect-banner" role="status" aria-live="polite">
          <span class="material-symbols-rounded lr-reconnect-banner__icon" aria-hidden="true">sync</span>
          <div class="lr-reconnect-banner__text">
            <strong>{t.live.room.reconnectingOverlay()}</strong>
            <span>{t.live.room.reconnectingHint()}</span>
          </div>
        </div>
      {/if}

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

      <div class="lr-room__body">
        <VideoStage
          isInstructorRoom={room.isInstructorRoom}
          videoTiles={room.videoTiles}
          screenShareTiles={room.screenShareTiles}
          hasScreenShare={room.hasScreenShare}
          activeSpeakerIdentity={room.activeSpeakerIdentity}
          tileSort={room.tileSort}
          primaryInstructorVideo={room.primaryInstructorVideo}
          selfVideo={room.selfVideo}
          classTitle={room.joinInfo?.classTitle ?? ""}
          instructorName={room.joinInfo?.instructorName ?? ""}
        />
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
      </div>

      {#if room.statusBanner}
        <div class="lr-network-hint" role="status" aria-live="polite">{room.statusBanner}</div>
      {/if}

      {#if room.mediaError}
        <div class="lr-media-error" role="alert">
          <span>{room.mediaError}</span>
          <button type="button" class="lr-media-error__dismiss" onclick={() => room.dismissMediaError()}>
            {t.live.room.mediaErrorDismiss()}
          </button>
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
    background: color-mix(in srgb, var(--ink) 92%, transparent);
    color: var(--white);
  }

  .disconnect-card {
    display: grid;
    gap: var(--space-4);
    max-width: 420px;
    text-align: center;
    padding: var(--space-6);
    border: 1px solid color-mix(in srgb, var(--white) 16%, transparent);
    background: color-mix(in srgb, var(--ink) 88%, transparent);
  }

  .disconnect-card .material-symbols-rounded {
    font-size: var(--step-4);
    color: var(--terra);
    justify-self: center;
  }

  .disconnect-card h2 {
    font-size: var(--step-3);
    margin: 0;
  }

  .disconnect-card p {
    color: color-mix(in srgb, var(--white) 72%, transparent);
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

  .lr-reconnect-banner {
    position: absolute;
    top: calc(var(--lr-header-h, 56px) + var(--space-2));
    inset-inline: var(--space-3);
    z-index: 40;
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-3) var(--space-4);
    border: 1px solid color-mix(in srgb, var(--terra) 45%, transparent);
    background: color-mix(in srgb, var(--terra-soft) 55%, var(--paper));
    color: var(--ink);
  }

  .lr-reconnect-banner__icon {
    animation: lr-spin 1.2s linear infinite;
  }

  .lr-reconnect-banner__text {
    display: grid;
    gap: 2px;
    font-size: var(--step--1);
  }

  .lr-reconnect-banner__text strong {
    font-size: var(--step-0);
  }

  .lr-network-hint {
    margin: 0 var(--space-3);
    padding: var(--space-2) var(--space-3);
    border: 1px solid color-mix(in srgb, var(--terra) 40%, transparent);
    background: color-mix(in srgb, var(--terra-soft) 40%, var(--paper));
    color: var(--ink);
    font-size: var(--step--1);
    text-align: center;
  }

  .lr-media-error {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-3);
    margin: 0 var(--space-3);
    padding: var(--space-2) var(--space-3);
    border: 1px solid color-mix(in srgb, var(--terra) 45%, transparent);
    background: color-mix(in srgb, var(--terra-soft) 45%, var(--paper));
    color: var(--ink);
    font-size: var(--step--1);
  }

  .lr-media-error__dismiss {
    flex-shrink: 0;
    padding: 4px 10px;
    border: var(--lr-chrome-border);
    background: var(--paper);
    color: inherit;
    font: inherit;
    cursor: pointer;
  }

  .lr-instructor-audio-hint {
    margin: 0;
    padding: 0 var(--space-3) var(--space-2);
    font-size: var(--step--1);
    color: var(--muted);
    text-align: center;
  }

  @keyframes lr-spin {
    to {
      transform: rotate(360deg);
    }
  }

  .lr-spin {
    animation: lr-spin 1.2s linear infinite;
  }
</style>
