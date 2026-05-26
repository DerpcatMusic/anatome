<script lang="ts">
  import { mountStageTrack, type StageTrackTile } from "$lib/features/live/livekit-room-tracks.svelte";

  let {
    tile,
    speaking = false,
    badge,
  }: {
    tile: StageTrackTile;
    speaking?: boolean;
    badge?: string;
  } = $props();
</script>

<figure
  class="lr-tile"
  class:lr-tile--self={tile.isLocal}
  class:lr-tile--speaking={speaking}
  data-lk-participant={tile.identity}
  data-lk-source={tile.source}
>
  <div class="lr-tile__video" use:mountStageTrack={tile}></div>
  {#if badge}
    <span class="lr-badge lr-badge--screen">{badge}</span>
  {/if}
  <figcaption class="lr-tile__name">{tile.name}</figcaption>
</figure>
