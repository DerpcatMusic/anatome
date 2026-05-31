<script lang="ts">
  import { buildLiveClassScheduleView } from "$lib/features/live/lib/live-class-schedule";

  let {
    startsAt,
    endsAt,
    nowMs,
    variant = "pill",
    showRange = true,
  }: {
    startsAt: number;
    endsAt: number;
    nowMs: number;
    variant?: "pill" | "inline";
    /** Show compact mono range alongside the short label (default on). */
    showRange?: boolean;
  } = $props();

  const view = $derived(buildLiveClassScheduleView(startsAt, endsAt, nowMs));
  const showCountdown = $derived(Boolean(view?.countdown));
  const progressPercent = $derived(
    view?.progress === null || view?.progress === undefined
      ? 0
      : Math.round(view.progress * 100),
  );
</script>

{#if view}
  <div
    class="live-schedule"
    class:live-schedule--pill={variant === "pill"}
    class:live-schedule--inline={variant === "inline"}
    class:live-schedule--during={view.phase === "during"}
    role="status"
    aria-label={view.ariaLabel}
  >
    <div class="live-schedule__row">
      <span class="live-schedule__label">{view.label}</span>
      {#if showRange && view.phase === "before"}
        <span class="live-schedule__range" aria-hidden="true">{view.timeRange}</span>
      {/if}
      {#if showCountdown && view.countdown}
        <span class="live-schedule__countdown" aria-hidden="true">{view.countdown}</span>
      {/if}
    </div>
    {#if view.phase === "during" && view.progress !== null}
      <span
        class="live-schedule__progress"
        aria-hidden="true"
        style:--live-schedule-progress="{progressPercent}%"
      ></span>
    {/if}
  </div>
{/if}

<style>
  .live-schedule {
    position: relative;
    display: inline-flex;
    flex-direction: column;
    align-items: stretch;
    gap: var(--space-1);
    max-width: 100%;
    min-width: 0;
    direction: rtl;
  }

  .live-schedule--pill {
    padding: var(--space-1) var(--space-3);
    border-radius: var(--radius-md);
    background: var(--muted);
    border: 1px solid var(--border-color);
  }

  .live-schedule--inline {
    padding: 0;
    border: 0;
    background: transparent;
  }

  .live-schedule--during.live-schedule--pill {
    border-color: color-mix(in oklch, var(--accent) 28%, var(--border-color));
    background: color-mix(in oklch, var(--accent) 8%, var(--muted));
  }

  .live-schedule__row {
    display: inline-flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: var(--space-2);
    min-width: 0;
  }

  .live-schedule__label {
    font-size: var(--step--1);
    font-weight: 600;
    color: var(--foreground);
    white-space: nowrap;
  }

  .live-schedule--inline .live-schedule__label {
    color: var(--foreground-muted);
  }

  .live-schedule--during .live-schedule__label {
    color: var(--foreground);
  }

  .live-schedule__range,
  .live-schedule__countdown {
    font-family: var(--font-mono);
    font-size: var(--step--2);
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    letter-spacing: 0.02em;
    color: var(--foreground-muted);
    white-space: nowrap;
  }

  .live-schedule--during .live-schedule__countdown {
    color: var(--accent);
    font-size: var(--step--1);
  }

  .live-schedule__progress {
    display: block;
    height: 2px;
    border-radius: var(--radius-pill);
    background: color-mix(in oklch, var(--foreground-muted) 22%, transparent);
    overflow: hidden;
  }

  .live-schedule__progress::after {
    content: "";
    display: block;
    height: 100%;
    width: var(--live-schedule-progress, 0%);
    border-radius: inherit;
    background: color-mix(in oklch, var(--accent) 75%, var(--secondary));
    transition: width 0.35s linear;
  }

  @media (prefers-reduced-motion: reduce) {
    .live-schedule__progress::after {
      transition: none;
    }
  }
</style>
