<script lang="ts">
  import { mountMedia } from "$lib/features/live/types";
  import { useI18n } from "$lib/i18n/runes.svelte";
  import type { LiveRoom } from "$lib/features/live/room.svelte";

  let { room }: { room: LiveRoom } = $props();
  const { t } = useI18n();
</script>

<main class="lr-stage">
  {#if room.isInstructorRoom}
    {#if room.hasScreenShare}
      <div class="spotlight-layout">
        <div class="spotlight-main">
          {#each room.screenShareTiles as tile (tile.id)}
            <figure class="lr-tile">
              <div class="lr-tile__video" use:mountMedia={tile.element}></div>
              <span class="lr-badge lr-badge--screen">{t.live.room.screenShare()}</span>
              <figcaption class="lr-tile__name">{tile.name}</figcaption>
            </figure>
          {/each}
        </div>
        <div class="spotlight-strip">
          {#each room.videoTiles.filter((t) => t.source !== "screen_share").sort(room.tileSort) as tile (tile.id)}
            <figure
              class="lr-tile"
              class:lr-tile--self={tile.isLocal}
              class:lr-tile--speaking={tile.identity === room.activeSpeakerIdentity}
            >
              <div class="lr-tile__video" use:mountMedia={tile.element}></div>
              <figcaption class="lr-tile__name">{tile.name}</figcaption>
            </figure>
          {/each}
        </div>
      </div>
    {:else}
      <div class="lr-grid" style="--grid-cols: {room.gridCols()}">
        {#if room.videoTiles.length === 0}
          <div class="lr-stage__empty">{t.live.room.waitingForCameras()}</div>
        {/if}
        {#each room.videoTiles.sort(room.tileSort) as tile (tile.id)}
          <figure
            class="lr-tile"
            class:lr-tile--self={tile.isLocal}
            class:lr-tile--speaking={tile.identity === room.activeSpeakerIdentity}
          >
            <div class="lr-tile__video" use:mountMedia={tile.element}></div>
            {#if tile.source === "screen_share"}
              <span class="lr-badge lr-badge--screen">{t.live.room.screenShare()}</span>
            {/if}
            <figcaption class="lr-tile__name">{tile.name}</figcaption>
          </figure>
        {/each}
      </div>
    {/if}
  {:else}
    <div class="student-stage">
      {#if room.primaryInstructorVideo}
        <figure class="student-main">
          <div class="lr-tile__video" use:mountMedia={room.primaryInstructorVideo.element}></div>
          {#if room.primaryInstructorVideo.source === "screen_share"}
            <span class="lr-badge lr-badge--screen">{t.live.room.screenShare()}</span>
          {/if}
          <figcaption class="lr-tile__name">{room.primaryInstructorVideo.name}</figcaption>
        </figure>
      {:else}
        <div class="lr-stage__empty">{t.live.room.waitingForInstructor()}</div>
      {/if}
      {#if room.selfVideo}
        <figure class="student-pip">
          <div class="lr-tile__video" use:mountMedia={room.selfVideo.element}></div>
          <figcaption class="lr-tile__name">{room.selfVideo.name}</figcaption>
        </figure>
      {/if}
    </div>
  {/if}
</main>

<style>
  .spotlight-layout {
    width: 100%;
    height: 100%;
    display: grid;
    grid-template-columns: 3fr 1fr;
    grid-template-rows: 1fr;
    gap: var(--space-3);
    padding: var(--space-3);
    box-sizing: border-box;
  }

  .spotlight-main { min-width: 0; min-height: 0; overflow: hidden; }

  .spotlight-strip {
    display: grid;
    grid-template-rows: repeat(auto-fit, minmax(0, 1fr));
    gap: var(--space-3);
    min-width: 0;
    min-height: 0;
    overflow: hidden;
  }

  .student-stage {
    position: relative;
    width: 100%;
    height: 100%;
    display: grid;
    place-items: center;
    padding: var(--space-3);
    box-sizing: border-box;
  }

  .student-main {
    position: relative;
    width: 100%;
    height: 100%;
    margin: 0;
    background: var(--video-bg);
    border: 1px solid var(--tile-border);
    overflow: hidden;
  }

  .student-pip {
    position: absolute;
    width: min(20vw, 180px);
    aspect-ratio: 16 / 9;
    margin: 0;
    background: var(--video-bg);
    border: 1px solid var(--tile-border);
    overflow: hidden;
    inset-inline-end: var(--space-3);
    inset-block-end: var(--space-3);
    z-index: 5;
  }

  @media (max-width: 48rem) {
    .spotlight-layout {
      grid-template-columns: 1fr;
      grid-template-rows: 2fr 1fr;
    }

    .spotlight-strip {
      grid-template-rows: 1fr;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    }

    .student-pip {
      width: min(30vw, 140px);
    }
  }
</style>
