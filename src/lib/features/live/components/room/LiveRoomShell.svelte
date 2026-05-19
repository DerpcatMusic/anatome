<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { useConvexClient } from "convex-svelte";
  import { LiveRoom } from "$lib/features/live/room.svelte";
  import { mountMedia } from "$lib/features/live/types";
  import PreConnectOverlay from "./PreConnectOverlay.svelte";
  import RoomHeader from "./RoomHeader.svelte";
  import VideoStage from "./VideoStage.svelte";
  import ParticipantSidebar from "./ParticipantSidebar.svelte";
  import RoomChat from "./RoomChat.svelte";
  import ControlBar from "./ControlBar.svelte";
  import QualityPanel from "./QualityPanel.svelte";

  const client = useConvexClient();
  const room = new LiveRoom(client);

  onMount(() => { void room.loadToken(); });
  onDestroy(() => { room.destroy(); });
</script>

{#if room.auth.isLoading || room.status === "checking"}
  <PreConnectOverlay {room} />
{:else if room.status === "locked" || room.status === "missing" || room.status === "error" || (room.status === "ready" && room.joinInfo && room.connectionState === "idle")}
  <PreConnectOverlay {room} />
{:else if room.connectionState !== "idle"}
  <div class="live-room">
    <RoomHeader {room} />

    <div class="room-body">
      <VideoStage {room} />
      <ParticipantSidebar {room} />
      <RoomChat {room} />
    </div>

    {#if room.mediaError}
      <div class="room-media-error" role="status">{room.mediaError}</div>
    {/if}

    <ControlBar {room} />
    <QualityPanel {room} />

    <div class="audio-sink" aria-hidden="true">
      {#each room.audioTiles as tile (tile.id)}<div use:mountMedia={tile.element}></div>{/each}
    </div>
  </div>
{/if}

<style>
  .live-room {
    position: fixed;
    inset: 0;
    z-index: 50;
    display: grid;
    grid-template-rows: auto 1fr auto;
    grid-template-areas: "header" "body" "controls";
    background: var(--surface);
    color: var(--ink);
    overflow: hidden;
    box-sizing: border-box;
    font-family: var(--font-body);
  }

  .room-body {
    grid-area: body;
    display: grid;
    grid-template-columns: 1fr auto;
    min-height: 0;
    overflow: hidden;
  }

  .room-media-error {
    position: absolute;
    inset-inline: var(--space-3);
    inset-block-end: 88px;
    z-index: 25;
    border: 1px solid #c93322;
    background: #fff7ed;
    color: #7c2d12;
    padding: var(--space-2) var(--space-3);
    font-size: var(--step--1);
    font-weight: 800;
    text-align: center;
  }

  .audio-sink { display: none; }

  @media (max-width: 48rem) {
    .room-body {
      grid-template-columns: 1fr;
      position: relative;
    }
  }
</style>
