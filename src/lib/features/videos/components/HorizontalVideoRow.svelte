<script lang="ts">
  import { horizontalWheelScroll } from "$lib/actions/horizontal-wheel-scroll";
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
    statusLabelFor,
    useLockGlyph = false,
    teaserLocked = false,
    unlockHint,
    hideStatus = false,
    hideHeader = false,
    eyebrow,
    carousel = true,
    horizontalWheel = true,
    vodCreditBalance = null,
    onSelect,
  }: {
    title: string;
    subtitle?: string;
    videos?: RowVideo[];
    emptyMessage?: string;
    pendingId?: string | null;
    statusLabelFor?: (video: RowVideo) => string;
    useLockGlyph?: boolean;
    teaserLocked?: boolean;
    unlockHint?: string;
    hideStatus?: boolean;
    /** Hide row title bar (catalog carousels). */
    hideHeader?: boolean;
    /** Small mono label above the track when hideHeader is true. */
    eyebrow?: string;
    /** Horizontal carousel track (YouTube-style). */
    carousel?: boolean;
    /** Vertical wheel scrolls the track horizontally. */
    horizontalWheel?: boolean;
    vodCreditBalance?: number | null;
    onSelect: (video: RowVideo) => void;
  } = $props();

  const showHeader = $derived(!hideHeader && (title.length > 0 || subtitle));
  const showEyebrow = $derived(Boolean(eyebrow?.trim()) && hideHeader);

  const rowVideos = $derived(Array.isArray(videos) ? videos : []);
</script>

<section class="video-row" class:video-row--carousel={carousel}>
  {#if showEyebrow}
    <p class="video-row__eyebrow">{eyebrow}</p>
  {/if}

  {#if showHeader}
    <header class="video-row__head">
      <div>
        <h3 class="video-row__title">{title}</h3>
        {#if subtitle}
          <p class="video-row__subtitle">{subtitle}</p>
        {/if}
      </div>
      <span class="video-row__count">{rowVideos.length}</span>
    </header>
  {/if}

  {#if rowVideos.length === 0}
    <Notice tone="neutral">{emptyMessage}</Notice>
  {:else}
    <div
      class="video-row__track"
      class:video-row__track--carousel={carousel}
      role="list"
      use:horizontalWheelScroll={carousel && horizontalWheel}
    >
      {#each rowVideos as video (video._id)}
        <div class="video-row__item" role="listitem">
          <VideoCard
            title={video.title}
            durationSeconds={video.durationSeconds}
            thumbnailUrl={video.thumbnailUrl}
            locked={video.locked}
            owned={video.owned}
            accessKind={video.accessKind}
            statusLabel={statusLabelFor?.(video)}
            {useLockGlyph}
            teaserLocked={teaserLocked && video.locked}
            {unlockHint}
            {hideStatus}
            {vodCreditBalance}
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

  .video-row__eyebrow {
    margin: 0;
    padding-inline: var(--space-1);
    font-family: var(--font-mono);
    font-size: var(--step--2);
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--foreground-muted);
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
    color: var(--foreground-muted);
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
    min-width: 0;
  }

  .video-row__track--carousel {
    overflow-x: auto;
    overscroll-behavior-x: contain;
    scroll-snap-type: x proximity;
    padding-block: var(--space-2) var(--space-4);
    padding-inline: var(--space-1) var(--space-6);
    margin-inline: calc(-1 * var(--space-1));
    scrollbar-width: thin;
    scrollbar-color: color-mix(in oklch, var(--ink) 25%, transparent) transparent;
  }

  .video-row__track--carousel::-webkit-scrollbar {
    height: 6px;
  }

  .video-row__track--carousel::-webkit-scrollbar-thumb {
    background: color-mix(in oklch, var(--ink) 30%, transparent);
    border-radius: 999px;
  }

  .video-row__item {
    flex: 0 0 auto;
    scroll-snap-align: start;
  }

  .video-row--carousel .video-row__item {
    width: min(280px, 72vw);
  }

  .video-row--carousel .video-row__item :global(.library-video-card) {
    width: 100%;
  }

  .video-row--carousel .video-row__head {
    padding-inline: var(--space-1);
  }
</style>
