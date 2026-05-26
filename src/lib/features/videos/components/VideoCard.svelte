<script lang="ts">
  import CreditCostTooltip from "$lib/features/credits/CreditCostTooltip.svelte";
  import { durationLabel } from "$lib/labels";

  let {
    title,
    durationSeconds = null,
    thumbnailUrl = null,
    locked = false,
    owned = false,
    accessKind = "macroflow",
    pending = false,
    statusLabel: statusLabelOverride = null,
    useLockGlyph = false,
    teaserLocked = false,
    unlockHint = "התחברי לפתיחה",
    hideStatus = false,
    vodCreditBalance = null,
    onclick,
  }: {
    title: string;
    durationSeconds?: number | null;
    thumbnailUrl?: string | null;
    locked?: boolean;
    owned?: boolean;
    accessKind?: "macroflow" | "microflow";
    pending?: boolean;
    statusLabel?: string | null;
    useLockGlyph?: boolean;
    teaserLocked?: boolean;
    unlockHint?: string;
    hideStatus?: boolean;
    /** When set, hover shows −1 · נשאר N for redeemable macroflow videos */
    vodCreditBalance?: number | null;
    onclick?: () => void;
  } = $props();

  const statusLabel = $derived.by(() => {
    if (statusLabelOverride) return statusLabelOverride;
    if (accessKind === "microflow") {
      return locked ? "נעול · מנוי" : "פתוח";
    }
    return owned ? "שלך" : locked ? "נעול" : "פתוח";
  });

  const showCreditTooltip = $derived(
    vodCreditBalance !== null &&
      accessKind === "macroflow" &&
      locked &&
      !owned &&
      !teaserLocked,
  );
</script>

{#snippet cardButton(props: Record<string, unknown>)}
  <button
    {...props}
    type="button"
    class="library-video-card"
    class:library-video-card--locked={locked}
    class:library-video-card--owned={owned}
    class:library-video-card--teaser={teaserLocked}
    disabled={pending}
    {onclick}
  >
    <div class="library-video-card__thumb">
      {#if thumbnailUrl}
        <img src={thumbnailUrl} alt="" loading="lazy" />
      {:else}
        <span class="library-video-card__placeholder">{durationLabel(durationSeconds)}</span>
      {/if}
      {#if teaserLocked}
        <span class="library-video-card__veil" aria-hidden="true"></span>
        <span class="library-video-card__hint">{unlockHint}</span>
      {/if}
      {#if locked}
        <span
          class="library-video-card__lock"
          class:library-video-card__lock--glyph={useLockGlyph || teaserLocked}
          aria-hidden="true"
        >{#if useLockGlyph || teaserLocked}<span class="library-video-card__lock-icon"></span>{:else}🔒{/if}</span>
      {/if}
      <span class="library-video-card__duration">{durationLabel(durationSeconds)}</span>
    </div>

    <div class="library-video-card__body">
      {#if !hideStatus}
        <span class="library-video-card__status">{statusLabel}</span>
      {/if}
      <h4 class="library-video-card__title">{title}</h4>
    </div>
  </button>
{/snippet}

<CreditCostTooltip
  cost={1}
  balance={vodCreditBalance ?? 0}
  pool="vod"
  enabled={showCreditTooltip}
>
  {#snippet child({ props })}
    {@render cardButton(props)}
  {/snippet}
</CreditCostTooltip>

<style>
  .library-video-card {
    display: grid;
    gap: var(--space-2);
    width: min(300px, 82vw);
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
    outline: 2px solid var(--accent);
    outline-offset: 4px;
  }

  .library-video-card--owned .library-video-card__thumb {
    box-shadow: inset 0 0 0 3px var(--accent);
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

  .library-video-card__lock--glyph {
    font-size: 0;
  }

  .library-video-card__lock-icon {
    width: 0.85rem;
    height: 1rem;
    border: 2px solid var(--white);
    border-radius: 2px 2px 3px 3px;
    box-shadow: inset 0 -5px 0 var(--white);
    display: block;
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
    color: var(--accent);
  }

  .library-video-card--locked .library-video-card__status {
    color: var(--foreground-muted);
  }

  .library-video-card__veil {
    position: absolute;
    inset: 0;
    background: color-mix(in oklch, var(--ink) 42%, transparent);
    transition: background 180ms ease;
    pointer-events: none;
  }

  .library-video-card__hint {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    padding: var(--space-3);
    text-align: center;
    font-size: var(--step--1);
    font-weight: 800;
    color: var(--white);
    opacity: 0;
    transform: translateY(6px);
    transition:
      opacity 180ms ease,
      transform 180ms ease;
    pointer-events: none;
  }

  .library-video-card--teaser:hover .library-video-card__veil,
  .library-video-card--teaser:focus-visible .library-video-card__veil {
    background: color-mix(in oklch, var(--ink) 28%, transparent);
  }

  .library-video-card--teaser:hover .library-video-card__hint,
  .library-video-card--teaser:focus-visible .library-video-card__hint {
    opacity: 1;
    transform: translateY(0);
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
