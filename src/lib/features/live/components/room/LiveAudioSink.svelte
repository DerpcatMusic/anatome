<script lang="ts">
  import { mountAudioSink, type AudioSinkTile } from "$lib/features/live/livekit-room-tracks.svelte";

  let { tiles }: { tiles: AudioSinkTile[] } = $props();
</script>

<div class="lr-audio-sink" aria-hidden="true">
  {#each tiles as tile (tile.id)}
    <div use:mountAudioSink={tile}></div>
  {/each}
</div>
