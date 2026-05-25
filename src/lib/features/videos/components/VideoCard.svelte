<script lang="ts">
  import { durationLabel } from "$lib/labels";

  let {
    title,
    durationSeconds = null,
    thumbnailUrl = null,
    locked = false,
    owned = false,
    accessKind = "macroflow",
    pending = false,
    onclick,
  }: {
    title: string;
    durationSeconds?: number | null;
    thumbnailUrl?: string | null;
    locked?: boolean;
    owned?: boolean;
    accessKind?: "macroflow" | "microflow";
    pending?: boolean;
    onclick?: () => void;
  } = $props();

  const statusLabel = $derived.by(() => {
    if (accessKind === "microflow") {
      return locked ? "נעול · מנוי" : "פתוח";
    }
    return owned ? "שלך" : locked ? "נעול" : "פתוח";
  });
</script>

<button
  type="button"
  class="library-video-card"
  class:library-video-card--locked={locked}
  class:library-video-card--owned={owned}
  disabled={pending}
  onclick={onclick}
>
  <div class="library-video-card__thumb">
    {#if thumbnailUrl}
      <img src={thumbnailUrl} alt="" loading="lazy" />
    {:else}
      <span class="library-video-card__placeholder">{durationLabel(durationSeconds)}</span>
    {/if}
    {#if locked}
      <span class="library-video-card__lock" aria-hidden="true">🔒</span>
    {/if}
    <span class="library-video-card__duration">{durationLabel(durationSeconds)}</span>
  </div>

  <div class="library-video-card__body">
    <span class="library-video-card__status">{statusLabel}</span>
    <h4 class="library-video-card__title">{title}</h4>
  </div>
</button>

<style>
  .library-video-card {
    display: grid;
    gap: var(--space-3);
    width: min(280px, 78vw);
    flex: 0 0 auto;
    scroll-snap-align: start;
    padding: 0;
    border: none;
    background: transparent;
    text-align: start;
    cursor: pointer;
    color: inherit;
    font: inherit;
    transition: transform 160ms ease;
  }

  .library-video-card:hover:not(:disabled) {
    transform: translateY(-3px);
  }

  .library-video-card:focus-visible {
    outline: 2px solid var(--secondary);
    outline-offset: 4px;
  }

  .library-video-card--owned .library-video-card__thumb {
    box-shadow: inset 0 0 0 3px var(--secondary);
  }

  .library-video-card__thumb {
    position: relative;
    aspect-ratio: 16 / 9;
    overflow: hidden;
    border: var(--border);
    background: var(--video-bg);
  }

  .library-video-card__thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .library-video-card__placeholder {
    display: grid;
    place-items: center;
    width: 100%;
    height: 100%;
    color: var(--white);
    font-family: var(--font-mono);
    font-weight: 700;
  }

  .library-video-card__lock {
    position: absolute;
    inset-block-start: var(--space-2);
    inset-inline-start: var(--space-2);
    width: 2rem;
    height: 2rem;
    display: grid;
    place-items: center;
    border-radius: 50%;
    background: color-mix(in oklch, var(--ink) 72%, transparent);
    font-size: 0.9rem;
  }

  .library-video-card__duration {
    position: absolute;
    inset-block-end: var(--space-2);
    inset-inline-end: var(--space-2);
    padding: 0.15rem 0.45rem;
    font-family: var(--font-mono);
    font-size: var(--step--2);
    background: color-mix(in oklch, var(--ink) 78%, transparent);
    color: var(--white);
  }

  .library-video-card__body {
    display: grid;
    gap: 0.25rem;
    min-width: 0;
  }

  .library-video-card__status {
    font-family: var(--font-mono);
    font-size: var(--step--2);
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: var(--secondary);
  }

  .library-video-card--locked .library-video-card__status {
    color: var(--muted);
  }

  .library-video-card__title {
    margin: 0;
    font-size: var(--step-0);
    line-height: 1.25;
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
  }
</style>
