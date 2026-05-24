<script lang="ts">
  import { mountStageTrack, type StageTrackTile } from "$lib/features/live/livekit-tracks.svelte";
  import { useI18n } from "$lib/i18n/runes.svelte";

  let {
    isInstructorRoom,
    videoTiles,
    screenShareTiles,
    hasScreenShare,
    activeSpeakerIdentity,
    tileSort,
    primaryInstructorVideo,
    selfVideo,
    classTitle = "",
    instructorName = "",
  }: {
    isInstructorRoom: boolean;
    videoTiles: StageTrackTile[];
    screenShareTiles: StageTrackTile[];
    hasScreenShare: boolean;
    activeSpeakerIdentity: string | null;
    tileSort: (a: StageTrackTile, b: StageTrackTile) => number;
    primaryInstructorVideo: StageTrackTile | null;
    selfVideo: StageTrackTile | null;
    classTitle?: string;
    instructorName?: string;
  } = $props();

  const { t } = useI18n();
</script>

<main class="lr-stage">
  {#if isInstructorRoom}
    {#if hasScreenShare}
      <div class="spotlight-layout">
        <div class="spotlight-main">
          {#each screenShareTiles as tile (tile.id)}
            <figure class="lr-tile">
              <div class="lr-tile__video" use:mountStageTrack={tile}></div>
              <span class="lr-badge lr-badge--screen">{t.live.room.screenShare()}</span>
              <figcaption class="lr-tile__name">{tile.name}</figcaption>
            </figure>
          {/each}
        </div>
        <div class="spotlight-strip">
          {#each videoTiles.filter((t) => t.source !== "screen_share").sort(tileSort) as tile (tile.id)}
            <figure
              class="lr-tile"
              class:lr-tile--self={tile.isLocal}
              class:lr-tile--speaking={tile.identity === activeSpeakerIdentity}
            >
              <div class="lr-tile__video" use:mountStageTrack={tile}></div>
              <figcaption class="lr-tile__name">{tile.name}</figcaption>
            </figure>
          {/each}
        </div>
      </div>
    {:else}
      <div class="lr-grid" style="--grid-cols: {(() => {
        const count = videoTiles.length;
        if (count <= 1) return 1;
        if (count <= 4) return 2;
        if (count <= 9) return 3;
        return 4;
      })()}">
        {#if videoTiles.length === 0}
          <div class="lr-stage__empty">{t.live.room.waitingForCameras()}</div>
        {/if}
        {#each videoTiles.sort(tileSort) as tile (tile.id)}
          <figure
            class="lr-tile"
            class:lr-tile--self={tile.isLocal}
            class:lr-tile--speaking={tile.identity === activeSpeakerIdentity}
          >
            <div class="lr-tile__video" use:mountStageTrack={tile}></div>
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
      {#if primaryInstructorVideo}
        <figure class="student-main">
          <div class="lr-tile__video" use:mountStageTrack={primaryInstructorVideo}></div>
          {#if primaryInstructorVideo.source === "screen_share"}
            <span class="lr-badge lr-badge--screen">{t.live.room.screenShare()}</span>
          {/if}
          <figcaption class="lr-tile__name">{primaryInstructorVideo.name}</figcaption>
        </figure>
      {:else}
        <div class="lr-stage__empty lr-stage__empty--waiting">
          {#if classTitle}
            <span class="lr-stage__class-kicker">{t.live.room.waitingClassKicker({ title: classTitle })}</span>
          {/if}
          <strong>
            {instructorName
              ? t.live.room.waitingForInstructorNamed({ instructor: instructorName })
              : t.live.room.waitingForInstructor()}
          </strong>
        </div>
      {/if}
      {#if selfVideo}
        <figure class="student-pip">
          <div class="lr-tile__video" use:mountStageTrack={selfVideo}></div>
          <figcaption class="lr-tile__name">{selfVideo.name}</figcaption>
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
    gap: 6px;
    padding: 6px;
    padding-block-start: 52px;
    padding-block-end: 72px;
    box-sizing: border-box;
  }

  .spotlight-main {
    min-width: 0;
    min-height: 0;
    overflow: hidden;
    border-radius: 6px;
  }

  .spotlight-strip {
    display: grid;
    grid-template-rows: repeat(auto-fit, minmax(0, 1fr));
    gap: 6px;
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
    padding: 52px 6px 72px;
    box-sizing: border-box;
  }

  .student-main {
    position: relative;
    width: 100%;
    height: 100%;
    margin: 0;
    background: var(--video-bg-warm);
    border: 1px solid var(--tile-border);
    border-radius: 6px;
    overflow: hidden;
  }

  .student-pip {
    position: absolute;
    width: min(20vw, 180px);
    aspect-ratio: 16 / 9;
    margin: 0;
    background: var(--video-bg-warm);
    border: 1px solid var(--tile-border);
    border-radius: 6px;
    overflow: hidden;
    inset-inline-end: var(--space-3);
    inset-block-end: 80px;
    z-index: 5;
  }

  @media (max-width: 48rem) {
    .spotlight-layout {
      grid-template-columns: 1fr;
      grid-template-rows: 2fr 1fr;
      padding-block-start: 48px;
      padding-block-end: 64px;
    }

    .spotlight-strip {
      grid-template-rows: 1fr;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    }

    .student-stage {
      padding-block-start: 48px;
      padding-block-end: 64px;
    }

    .student-pip {
      width: min(30vw, 140px);
      inset-block-end: 72px;
    }
  }
</style>
