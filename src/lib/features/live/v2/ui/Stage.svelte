<script lang="ts">
  import type { Room } from "livekit-client";
  import { useI18n } from "$lib/i18n/runes.svelte";
  import { useStageTracks } from "../media/useStageTracks.svelte";
  import VideoTile from "./VideoTile.svelte";

  let {
    room,
  }: {
    room: Room;
  } = $props();

  const { t } = useI18n();
  const stage = useStageTracks(() => room);
  const tracks = $derived(stage.tracks);

  let audioStarted = $state(false);

  async function startAudio() {
    try {
      await room.startAudio();
      audioStarted = true;
    } catch {
      audioStarted = false;
    }
  }
</script>

<section class="v2-stage" aria-label={t.live.room.participantsTitle()}>
  {#if tracks.length === 0}
    <p class="v2-stage__empty">{t.live.room.waitingForCameras()}</p>
  {:else}
    <div class="v2-stage__grid">
      {#each tracks as trackRef (`${trackRef.participant.identity}-${trackRef.publication.source}`)}
        <VideoTile {trackRef} />
      {/each}
    </div>
  {/if}

  {#if !audioStarted}
    <button type="button" class="hb-button hb-button--secondary v2-stage__audio" onclick={() => void startAudio()}>
      הפעלת שמע
    </button>
  {/if}
</section>

<style>
  .v2-stage {
    display: grid;
    gap: var(--space-3);
    width: 100%;
    height: 100%;
    min-height: 0;
  }

  .v2-stage__grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr));
    gap: var(--space-3);
    align-content: start;
    width: 100%;
    height: 100%;
    overflow: auto;
    padding: var(--space-2);
  }

  .v2-stage__empty {
    place-self: center;
    margin: 0;
    color: var(--foreground-muted);
    font-weight: 600;
  }

  .v2-stage__audio {
    justify-self: center;
  }
</style>
