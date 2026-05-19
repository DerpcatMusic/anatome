<script lang="ts">
  import { mountMedia } from "$lib/features/live/types";
  import { useI18n } from "$lib/i18n/runes.svelte";
  import type { LiveRoom } from "$lib/features/live/room.svelte";

  let { room }: { room: LiveRoom } = $props();
  const { t } = useI18n();
</script>

<main class="stage">
  {#if room.isInstructorRoom}
    {#if room.hasScreenShare}
      <div class="spotlight-layout">
        <div class="spotlight-main">
          {#each room.screenShareTiles as tile (tile.id)}
            <figure class="spotlight-tile">
              <div use:mountMedia={tile.element}></div>
              <span class="badge-screen">{t.live.room.screenShare()}</span>
              <figcaption>{tile.name}</figcaption>
            </figure>
          {/each}
        </div>
        <div class="spotlight-strip">
          {#each room.videoTiles.filter((t) => t.source !== "screen_share").sort(room.tileSort) as tile (tile.id)}
            <figure class="strip-tile" class:strip-tile--self={tile.isLocal} class:strip-tile--speaking={tile.identity === room.activeSpeakerIdentity}>
              <div use:mountMedia={tile.element}></div>
              <figcaption>{tile.name}</figcaption>
            </figure>
          {/each}
        </div>
      </div>
    {:else}
      <div class="video-grid" style="--grid-cols: {room.gridCols()}">
        {#if room.videoTiles.length === 0}
          <div class="empty-stage">{t.live.room.waitingForCameras()}</div>
        {/if}
        {#each room.videoTiles.sort(room.tileSort) as tile (tile.id)}
          <figure class="grid-tile" class:grid-tile--self={tile.isLocal} class:grid-tile--speaking={tile.identity === room.activeSpeakerIdentity}>
            <div use:mountMedia={tile.element}></div>
            {#if tile.source === "screen_share"}<span class="badge-screen">{t.live.room.screenShare()}</span>{/if}
            <figcaption>{tile.name}</figcaption>
          </figure>
        {/each}
      </div>
    {/if}
  {:else}
    <div class="student-stage">
      {#if room.primaryInstructorVideo}
        <figure class="student-main">
          <div use:mountMedia={room.primaryInstructorVideo.element}></div>
          {#if room.primaryInstructorVideo.source === "screen_share"}<span class="badge-screen">{t.live.room.screenShare()}</span>{/if}
          <figcaption>{room.primaryInstructorVideo.name}</figcaption>
        </figure>
      {:else}
        <div class="empty-stage">{t.live.room.waitingForInstructor()}</div>
      {/if}
      {#if room.selfVideo}
        <figure class="student-pip">
          <div use:mountMedia={room.selfVideo.element}></div>
          <figcaption>{room.selfVideo.name}</figcaption>
        </figure>
      {/if}
    </div>
  {/if}
</main>

<style>
  .stage {
    position: relative;
    min-width: 0;
    min-height: 0;
    overflow: hidden;
    background: var(--surface);
  }

  .empty-stage {
    width: 100%;
    height: 100%;
    display: grid;
    place-items: center;
    color: var(--muted);
    font-weight: 800;
    font-size: var(--step-1);
  }

  .video-grid {
    width: 100%;
    height: 100%;
    display: grid;
    grid-template-columns: repeat(var(--grid-cols, 1), 1fr);
    grid-auto-rows: 1fr;
    gap: var(--space-2);
    padding: var(--space-2);
    box-sizing: border-box;
  }

  .grid-tile {
    position: relative;
    margin: 0;
    background: var(--white);
    border: var(--border);
    overflow: hidden;
    min-width: 0;
    min-height: 0;
  }

  .grid-tile--self { outline: 3px solid var(--sky-strong); outline-offset: -3px; }
  .grid-tile--speaking { outline: 3px solid #188038; outline-offset: -3px; }

  .grid-tile div,
  .spotlight-tile div,
  .strip-tile div,
  .student-main div,
  .student-pip div {
    width: 100%;
    height: 100%;
  }

  .grid-tile :global(video),
  .spotlight-tile :global(video),
  .strip-tile :global(video),
  .student-main :global(video),
  .student-pip :global(video) {
    width: 100%;
    height: 100%;
    display: block;
    object-fit: cover;
  }

  .grid-tile figcaption,
  .spotlight-tile figcaption,
  .strip-tile figcaption,
  .student-main figcaption,
  .student-pip figcaption {
    position: absolute;
    inset-inline-start: var(--space-2);
    inset-block-end: var(--space-2);
    background: rgba(0, 0, 0, 0.7);
    color: #fff;
    padding: 4px 10px;
    font-size: var(--step--2);
    font-weight: 800;
    font-family: var(--font-mono);
  }

  .badge-screen {
    position: absolute;
    inset-block-start: var(--space-2);
    inset-inline-start: var(--space-2);
    background: #c93322;
    color: #fff;
    padding: 4px 10px;
    font-size: var(--step--2);
    font-weight: 800;
    font-family: var(--font-mono);
    z-index: 2;
  }

  .spotlight-layout {
    width: 100%;
    height: 100%;
    display: grid;
    grid-template-columns: 3fr 1fr;
    grid-template-rows: 1fr;
    gap: var(--space-2);
    padding: var(--space-2);
    box-sizing: border-box;
  }

  .spotlight-main { min-width: 0; min-height: 0; overflow: hidden; }

  .spotlight-tile {
    position: relative;
    margin: 0;
    width: 100%;
    height: 100%;
    background: var(--white);
    border: var(--border);
    overflow: hidden;
  }

  .spotlight-strip {
    display: grid;
    grid-template-rows: repeat(auto-fit, minmax(0, 1fr));
    gap: var(--space-2);
    min-width: 0;
    min-height: 0;
    overflow: hidden;
  }

  .strip-tile {
    position: relative;
    margin: 0;
    background: var(--white);
    border: var(--border);
    overflow: hidden;
    min-width: 0;
    min-height: 0;
  }

  .strip-tile--self { outline: 2px solid var(--sky-strong); outline-offset: -2px; }
  .strip-tile--speaking { outline: 2px solid #188038; outline-offset: -2px; }

  .student-stage {
    position: relative;
    width: 100%;
    height: 100%;
    display: grid;
    place-items: center;
    padding: var(--space-2);
    box-sizing: border-box;
  }

  .student-main {
    position: relative;
    width: 100%;
    height: 100%;
    margin: 0;
    background: var(--white);
    border: var(--border);
    overflow: hidden;
  }

  .student-pip {
    position: absolute;
    width: min(20vw, 180px);
    aspect-ratio: 16 / 9;
    margin: 0;
    background: var(--white);
    border: var(--border);
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
