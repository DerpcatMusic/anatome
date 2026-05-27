<script lang="ts">
  import { RoomEvent, Track, type LocalVideoTrack } from "livekit-client";
  import { getRoomContext } from "$lib/livekit/contexts/room-context.svelte.js";
  import { VideoConference } from "$lib/livekit";

  let { compact = false }: { compact?: boolean } = $props();

  const room = getRoomContext();

  let screenVideoEl = $state<HTMLVideoElement | null>(null);
  let screenTrack = $state<LocalVideoTrack | null>(null);

  function syncScreenTrack() {
    const publication = room.localParticipant.getTrackPublication(Track.Source.ScreenShare);
    screenTrack = (publication?.track as LocalVideoTrack | undefined) ?? null;
  }

  $effect(() => {
    syncScreenTrack();
    const events = [
      RoomEvent.LocalTrackPublished,
      RoomEvent.LocalTrackUnpublished,
      RoomEvent.TrackPublished,
      RoomEvent.TrackUnpublished,
    ] as const;
    for (const event of events) {
      room.on(event, syncScreenTrack);
    }
    return () => {
      for (const event of events) {
        room.off(event, syncScreenTrack);
      }
    };
  });

  $effect(() => {
    const track = screenTrack;
    const el = screenVideoEl;
    if (!track || !el) return;
    track.attach(el);
    return () => {
      track.detach(el);
    };
  });
</script>

<div class="live-pip-video" class:live-pip-video--compact={compact}>
  {#if screenTrack}
    <video
      bind:this={screenVideoEl}
      class="live-pip-video__el"
      muted
      playsinline
    ></video>
  {:else}
    <VideoConference class="live-pip-video__conference" />
  {/if}
</div>

<style>
  .live-pip-video {
    position: relative;
    flex: 1 1 auto;
    min-height: 0;
    width: 100%;
    background: var(--video-bg, #000);
    border-radius: inherit;
    overflow: hidden;
  }

  .live-pip-video__el {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: contain;
    background: #000;
  }

  .live-pip-video :global(.live-pip-video__conference) {
    position: absolute;
    inset: 0;
    --lk-control-bar-height: 0px;
  }

  .live-pip-video--compact :global(.lk-participant-tile) {
    border-radius: 0;
  }
</style>
