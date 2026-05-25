<script lang="ts">
  import Notice from "$components/ui/Notice.svelte";
  import VideoCard from "./VideoCard.svelte";

  export type RowVideo = {
    _id: string;
    title: string;
    durationSeconds?: number | null;
    thumbnailUrl?: string | null;
    locked: boolean;
    owned: boolean;
    accessible: boolean;
    accessKind: "macroflow" | "microflow";
  };

  let {
    title,
    subtitle,
    videos = [],
    emptyMessage = "אין שיעורים להצגה כרגע.",
    pendingId = null,
    onSelect,
  }: {
    title: string;
    subtitle?: string;
    videos?: RowVideo[];
    emptyMessage?: string;
    pendingId?: string | null;
    onSelect: (video: RowVideo) => void;
  } = $props();

  const rowVideos = $derived(Array.isArray(videos) ? videos : []);
</script>

<section class="video-row">
  <header class="video-row__head">
    <div>
      <h3 class="video-row__title">{title}</h3>
      {#if subtitle}
        <p class="video-row__subtitle">{subtitle}</p>
      {/if}
    </div>
    <span class="video-row__count">{rowVideos.length}</span>
  </header>

  {#if rowVideos.length === 0}
    <Notice tone="neutral">{emptyMessage}</Notice>
  {:else}
    <div class="video-row__track" role="list">
      {#each rowVideos as video (video._id)}
        <div role="listitem">
          <VideoCard
            title={video.title}
            durationSeconds={video.durationSeconds}
            thumbnailUrl={video.thumbnailUrl}
            locked={video.locked}
            owned={video.owned}
            accessKind={video.accessKind}
            pending={pendingId === video._id}
            onclick={() => onSelect(video)}
          />
        </div>
      {/each}
    </div>
  {/if}
</section>

<style>
  .video-row {
    display: grid;
    gap: var(--space-4);
    min-width: 0;
  }

  .video-row__head {
    display: flex;
    align-items: end;
    justify-content: space-between;
    gap: var(--space-3);
    padding-inline: var(--space-1);
  }

  .video-row__title {
    margin: 0;
    font-size: var(--step-1);
    line-height: 1.1;
  }

  .video-row__subtitle {
    margin: var(--space-2) 0 0;
    color: var(--muted);
    line-height: 1.5;
    max-width: 60ch;
  }

  .video-row__count {
    font-family: var(--font-mono);
    font-size: var(--step--1);
    padding: 0.35rem 0.65rem;
    border: var(--border);
    background: var(--surface);
    flex-shrink: 0;
  }

  .video-row__track {
    display: flex;
    gap: var(--space-4);
    overflow-x: auto;
    overscroll-behavior-x: contain;
    scroll-snap-type: x mandatory;
    padding-block: var(--space-2) var(--space-3);
    padding-inline: var(--space-1);
    scrollbar-width: none;
  }

  .video-row__track::-webkit-scrollbar {
    display: none;
  }
</style>
