<script lang="ts">
  import type { TrackReference } from "@livekit/components-core";
  import { Track } from "livekit-client";
  import { participantIdentity } from "../../live-room-shared";

  let {
    trackRef,
  }: {
    trackRef: TrackReference;
  } = $props();

  let videoEl = $state<HTMLVideoElement | null>(null);

  const label = $derived(
    trackRef.participant.name ||
      trackRef.participant.identity ||
      participantIdentity(trackRef.participant),
  );

  const isLocal = $derived(trackRef.participant.isLocal);
  const isScreen = $derived(trackRef.publication.source === Track.Source.ScreenShare);

  $effect(() => {
    const track = trackRef.publication.track;
    const el = videoEl;
    if (track === undefined || el === null || track.kind !== "video") return;

    track.attach(el);
    return () => {
      track.detach(el);
    };
  });
</script>

<article class="v2-tile" data-local={isLocal ? "true" : "false"} data-screen={isScreen ? "true" : "false"}>
  <video
    bind:this={videoEl}
    class="v2-tile__video"
    autoplay
    playsinline
    muted={isLocal}
  ></video>
  <footer class="v2-tile__label">{label}{isLocal ? " (את)" : ""}</footer>
</article>

<style>
  .v2-tile {
    position: relative;
    aspect-ratio: 16 / 9;
    border-radius: var(--radius-lg);
    overflow: hidden;
    background: var(--surface-elevated, #111);
    border: var(--border);
  }

  .v2-tile__video {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    background: #000;
  }

  .v2-tile__label {
    position: absolute;
    inset-inline: 0;
    bottom: 0;
    margin: 0;
    padding: var(--space-2) var(--space-3);
    font-size: var(--step--1);
    font-weight: 700;
    background: linear-gradient(transparent, rgb(0 0 0 / 0.72));
    color: #fff;
    text-align: start;
  }

  .v2-tile[data-screen="true"] {
    grid-column: 1 / -1;
    aspect-ratio: auto;
    min-height: 40vh;
  }
</style>
