<script lang="ts">
  import type { StageTrackTile } from "$lib/features/live/livekit-room-tracks.svelte";
  import { useI18n } from "$lib/i18n/runes.svelte";
  import ParticipantVideoTile from "./ParticipantVideoTile.svelte";

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
            <ParticipantVideoTile
              {tile}
              speaking={tile.identity === activeSpeakerIdentity}
              badge={t.live.room.screenShare()}
            />
          {/each}
        </div>
        <div class="spotlight-strip">
          {#each videoTiles.filter((tile) => tile.source !== "screen_share").sort(tileSort) as tile (tile.id)}
            <ParticipantVideoTile
              {tile}
              speaking={tile.identity === activeSpeakerIdentity}
            />
          {/each}
        </div>
      </div>
    {:else}
      <div
        class="lr-grid"
        style="--grid-cols: {(() => {
          const count = videoTiles.length;
          if (count <= 1) return 1;
          if (count <= 4) return 2;
          if (count <= 9) return 3;
          return 4;
        })()}"
      >
        {#if videoTiles.length === 0}
          <div class="lr-stage__empty">{t.live.room.waitingForCameras()}</div>
        {/if}
        {#each videoTiles.sort(tileSort) as tile (tile.id)}
          <ParticipantVideoTile
            {tile}
            speaking={tile.identity === activeSpeakerIdentity}
            badge={tile.source === "screen_share" ? t.live.room.screenShare() : undefined}
          />
        {/each}
      </div>
    {/if}
  {:else}
    <div class="student-stage">
      {#if primaryInstructorVideo}
        <div class="student-main">
          <ParticipantVideoTile
            tile={primaryInstructorVideo}
            speaking={primaryInstructorVideo.identity === activeSpeakerIdentity}
            badge={primaryInstructorVideo.source === "screen_share"
              ? t.live.room.screenShare()
              : undefined}
          />
        </div>
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
        <div class="student-pip">
          <ParticipantVideoTile
            tile={selfVideo}
            speaking={selfVideo.identity === activeSpeakerIdentity}
          />
        </div>
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
    border-radius: var(--radius-sm, 6px);
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
    min-width: 0;
    min-height: 0;
    overflow: hidden;
    border-radius: var(--radius-sm, 6px);
  }

  .student-main :global(.lr-tile) {
    width: 100%;
    height: 100%;
    margin: 0;
  }

  .student-pip {
    position: absolute;
    width: min(20vw, 180px);
    aspect-ratio: 16 / 9;
    margin: 0;
    z-index: 5;
    inset-inline-end: var(--space-3);
    inset-block-end: 80px;
    overflow: hidden;
    border-radius: var(--radius-sm, 6px);
  }

  .student-pip :global(.lr-tile) {
    width: 100%;
    height: 100%;
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
