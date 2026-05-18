<script lang="ts">
  import "@mux/mux-player";

  interface Props {
    playbackId: string;
    playbackToken?: string | null;
    thumbnailUrl?: string | null;
    title?: string;
  }

  let { playbackId, playbackToken, thumbnailUrl, title }: Props = $props();
</script>

<div class="mux-player-wrapper">
  <mux-player
    playback-id={playbackId}
    playback-token={playbackToken ?? undefined}
    poster={thumbnailUrl ?? undefined}
    title={title}
    accent-color="#4a90a4"
    style="--controls-backdrop-color: rgba(0,0,0,0.6);"
  ></mux-player>
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
</style>
