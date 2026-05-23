<script lang="ts">
  import { Tooltip } from "bits-ui";
  import { useConvexClient } from "convex-svelte";
  import { useEventListener } from "runed";
  import { LiveRoom } from "$lib/features/live/room.svelte";
  import { mountMedia } from "$lib/features/live/types";
  import { Button } from "bits-ui";
  import PreConnectOverlay from "./PreConnectOverlay.svelte";
  import RoomHeader from "./RoomHeader.svelte";
  import VideoStage from "./VideoStage.svelte";
  import ParticipantSidebar from "./ParticipantSidebar.svelte";
  import RoomChat from "./RoomChat.svelte";
  import ControlBar from "./ControlBar.svelte";
  import QualityPanel from "./QualityPanel.svelte";
  import "$lib/features/live/styles/room.css";

  const client = useConvexClient();
  const room = new LiveRoom(client);

  function onKeyDown(e: KeyboardEvent) {
    const isMac = navigator.platform.includes('Mac');
    const mod = isMac ? e.metaKey : e.ctrlKey;
    if (!mod) return;
    switch (e.key.toLowerCase()) {
      case 'd':
        e.preventDefault();
        void room.toggleMic();
        break;
      case 'e':
        e.preventDefault();
        void room.toggleCamera();
        break;
    }
  }

  function onBeforeUnload(e: BeforeUnloadEvent) {
    if (room.connectionState === "connected") {
      e.preventDefault();
      e.returnValue = "";
    }
  }

  useEventListener(window, 'keydown', onKeyDown);
  useEventListener(window, 'beforeunload', onBeforeUnload);

  $effect(() => {
    void room.loadToken();
    return () => {
      room.destroy();
    };
  });
</script>

{#if room.auth.isLoading || room.status === "checking"}
  <PreConnectOverlay {room} />
{:else if room.status === "locked" || room.status === "missing" || room.status === "prep" || room.status === "error"}
  <PreConnectOverlay {room} />
{:else if room.connectionState === "disconnected"}
  <!-- Disconnect recovery overlay -->
  <div class="disconnect-overlay">
    <div class="disconnect-card">
      <span class="material-symbols-rounded" aria-hidden="true">wifi_off</span>
      <h2>החיבור נותק</h2>
      <p>ניתן לנסות להתחבר שוב או לצאת מהחדר.</p>
      <div class="disconnect-actions">
        <Button.Root class="hb-button hb-button--ink hb-button--md" type="button" onclick={() => room.reconnect()}>התחברות מחדש</Button.Root>
        <Button.Root class="hb-button hb-button--ghost hb-button--sm" type="button" onclick={() => {
          room.destroy();
          window.location.href = room.isInstructorRoom ? '/i/live' : '/u/calendar';
        }}>יציאה</Button.Root>
      </div>
    </div>
  </div>
{:else if room.status === "ready" && room.joinInfo && room.connectionState === "idle"}
  <PreConnectOverlay {room} />
{:else if room.connectionState !== "idle"}
  <Tooltip.Provider delayDuration={160}>
    <div class="lr-room">
      <RoomHeader
        connectionState={room.connectionState}
        connectionLabel={room.connectionLabel}
        participantCount={room.participants.length}
        isInstructorRoom={room.isInstructorRoom}
        showQualityPanel={room.showQualityPanel}
        showParticipants={room.showParticipants}
        onToggleParticipants={() => room.showParticipants = !room.showParticipants}
        onToggleQualityPanel={() => room.showQualityPanel = !room.showQualityPanel}
        onLeave={() => {
          room.destroy();
          window.location.href = room.isInstructorRoom ? '/i/live' : '/u/calendar';
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
        />
        <ParticipantSidebar
          open={room.showParticipants}
          participants={room.participants}
          onClose={() => room.showParticipants = false}
        />
        <RoomChat
          open={room.showChat}
          messages={room.chatMessages}
          bind:draft={room.chatDraft}
          onSend={() => room.sendChatMessage()}
          onClose={() => room.showChat = false}
        />
      </div>

      {#if room.mediaError}
        <div class="lr-media-error" role="alert">{room.mediaError}</div>
      {/if}

      <ControlBar {room} />
      <QualityPanel {room} />

      <div class="lr-audio-sink" aria-hidden="true">
        {#each room.audioTiles as tile (tile.id)}<div use:mountMedia={tile.element}></div>{/each}
      </div>
    </div>
  </Tooltip.Provider>
{/if}

<style>
  .disconnect-overlay {
    position: fixed;
    inset: 0;
    z-index: 50;
    display: grid;
    place-items: center;
    background: var(--ink);
    color: var(--white);
  }

  .disconnect-card {
    display: grid;
    gap: var(--space-4);
    max-width: 400px;
    text-align: center;
    padding: var(--space-6);
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

  .disconnect-actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-3);
    justify-content: center;
    padding-top: var(--space-2);
  }
</style>
