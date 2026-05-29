<script lang="ts">
  import { RoomEvent, Track, type LocalVideoTrack } from "livekit-client";
  import { getRoomContext } from "$lib/livekit/contexts/room-context.svelte.js";
  import VideoConference from "$lib/livekit/prefabs/VideoConference.svelte";
  import { useI18n } from "$lib/i18n/runes.svelte";

  let { class: className = "" }: { class?: string } = $props();

  const room = getRoomContext();
  const { t } = useI18n();

  let screenVideoEl = $state<HTMLVideoElement | null>(null);
  let screenTrack = $state<LocalVideoTrack | null>(null);

  function syncLocalScreenTrack() {
    const publication = room.localParticipant.getTrackPublication(Track.Source.ScreenShare);
    const track = publication?.track;
    screenTrack = track?.kind === "video" ? (track as LocalVideoTrack) : null;
  }

  $effect(() => {
    syncLocalScreenTrack();
    const events = [
      RoomEvent.LocalTrackPublished,
      RoomEvent.LocalTrackUnpublished,
      RoomEvent.TrackPublished,
      RoomEvent.TrackUnpublished,
      RoomEvent.Reconnected,
    ] as const;
    for (const event of events) {
      room.on(event, syncLocalScreenTrack);
    }
    return () => {
      for (const event of events) {
        room.off(event, syncLocalScreenTrack);
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

<div class="lr-instructor-stage {className}">
  <VideoConference class="lr-instructor-stage__conference" />

  {#if screenTrack}
    <div class="lr-instructor-stage__screen" data-testid="instructor-screen-share">
      <video
        bind:this={screenVideoEl}
        class="lr-instructor-stage__video"
        muted
        playsinline
        aria-label={t.live.room.screenShare()}
      ></video>
      <span class="lr-badge lr-badge--screen">{t.live.room.screenShare()}</span>
    </div>
  {/if}
</div>

<style>
  .lr-instructor-stage {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    min-width: 0;
    min-height: 0;
    z-index: 1;
  }

  .lr-instructor-stage__screen {
    position: absolute;
    inset: 0;
    z-index: 3;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #000;
    overflow: hidden;
  }

  .lr-instructor-stage__video {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: contain;
    background: #000;
  }

  .lr-instructor-stage__screen .lr-badge {
    position: absolute;
    inset-block-start: var(--space-3);
    inset-inline-start: var(--space-3);
  }

  .lr-instructor-stage :global(.lr-instructor-stage__conference) {
    position: absolute;
    inset: 0;
    z-index: 1;
  }
</style>
