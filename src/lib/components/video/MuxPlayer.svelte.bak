<script lang="ts">
  import { onMount } from "svelte";
  import { PUBLIC_MUX_ENV_KEY } from "$env/static/public";
  import { syncMediaSession } from "$lib/pwa/media-session";

  type MuxPlayerElement = HTMLElement & {
    currentTime: number;
    duration: number;
  };

  interface Props {
    playbackId: string;
    playbackToken?: string | null;
    thumbnailToken?: string | null;
    storyboardToken?: string | null;
    thumbnailUrl?: string | null;
    title?: string;
    startTime?: number | null;
    videoId?: string;
    viewerUserId?: string | null;
    maxResolution?: "720p" | "1080p" | "1440p" | "2160p" | null;
    onProgress?: (progress: { currentTimeSeconds: number; durationSeconds: number }) => void;
  }

  let {
    playbackId,
    playbackToken,
    thumbnailToken,
    storyboardToken,
    thumbnailUrl,
    title,
    startTime,
    videoId,
    viewerUserId,
    maxResolution,
    onProgress,
  }: Props = $props();

  let player = $state<MuxPlayerElement | null>(null);
  let muxReady = $state(false);
  let muxLoadError = $state(false);
  let lastProgressSentAt = 0;

  onMount(() => {
    void import("@mux/mux-player")
      .then(() => {
        muxReady = true;
      })
      .catch(() => {
        muxLoadError = true;
      });

    return () => syncMediaSession(null);
  });

  $effect(() => {
    if (!muxReady || !title) return;
    syncMediaSession({ title, artworkUrl: thumbnailUrl ?? null });
  });

  function onPlayerPlay() {
    if (title) {
      syncMediaSession({ title, artworkUrl: thumbnailUrl ?? null });
    }
  }

  function reportProgress(force = false) {
    if (!player || !onProgress) return;
    const now = Date.now();
    if (!force && now - lastProgressSentAt < 10000) return;

    const currentTimeSeconds = Number.isFinite(player.currentTime) ? player.currentTime : 0;
    const durationSeconds = Number.isFinite(player.duration) ? player.duration : 0;
    if (durationSeconds <= 0) return;

    lastProgressSentAt = now;
    onProgress({ currentTimeSeconds, durationSeconds });
  }
</script>

<div class="mux-player-wrapper">
  {#if muxLoadError}
    <div class="mux-player-state" role="alert">לא הצלחנו לטעון את נגן הווידאו.</div>
  {:else if muxReady}
    <mux-player
      bind:this={player}
      playback-id={playbackId}
      playback-token={playbackToken ?? undefined}
      thumbnail-token={thumbnailToken ?? undefined}
      storyboard-token={storyboardToken ?? undefined}
      poster={thumbnailUrl ?? undefined}
      start-time={startTime && startTime > 0 ? startTime : undefined}
      video-title={title}
      metadata-video-id={videoId}
      metadata-video-title={title}
      metadata-viewer-user-id={viewerUserId ?? undefined}
      env-key={PUBLIC_MUX_ENV_KEY || undefined}
      stream-type="on-demand"
      playbackrates="0.75 1 1.25 1.5 2"
      max-resolution={maxResolution ?? undefined}
      max-auto-resolution="1080p"
      cap-rendition-to-player-size
      accent-color="var(--secondary)"
      style="--controls-backdrop-color: rgba(0,0,0,0.6);"
      playsinline
      onplay={onPlayerPlay}
      ontimeupdate={() => reportProgress(false)}
      onpause={() => reportProgress(true)}
      onseeking={() => reportProgress(true)}
      onended={() => reportProgress(true)}
    ></mux-player>
  {:else}
    <div class="mux-player-state">טוענים נגן...</div>
  {/if}
</div>

<style>
  .mux-player-wrapper {
    width: 100%;
    background: var(--ink);
    border: var(--border);
  }

  mux-player {
    display: block;
    width: 100%;
    aspect-ratio: 16 / 9;
    --media-object-fit: cover;
  }

  .mux-player-state {
    display: grid;
    place-items: center;
    min-height: 220px;
    aspect-ratio: 16 / 9;
    color: var(--white);
    font-weight: 700;
  }
</style>
