<script lang="ts">
  import type { Snippet } from "svelte";

  let {
    title,
    subtitle = "",
    schedule,
    statusLabel = "",
    statusTone = "default",
    children,
  }: {
    title: string;
    subtitle?: string;
    schedule?: Snippet;
    statusLabel?: string;
    statusTone?: "default" | "live" | "prep";
    children: Snippet;
  } = $props();
</script>

<section class="live-preconnect" aria-label={title}>
  <header class="live-preconnect__header">
    <div class="live-preconnect__heading">
      <span class="live-preconnect__kicker">לייב</span>
      <h1 class="live-preconnect__title">{title}</h1>
      {#if schedule}
        <div class="live-preconnect__schedule">
          <span class="material-symbols-rounded" aria-hidden="true">schedule</span>
          {@render schedule()}
        </div>
      {/if}
      {#if subtitle}
        <p class="live-preconnect__subtitle">{subtitle}</p>
      {/if}
    </div>
    {#if statusLabel}
      <span
        class="live-preconnect__status"
        class:live-preconnect__status--live={statusTone === "live"}
        class:live-preconnect__status--prep={statusTone === "prep"}
        role="status"
      >{statusLabel}</span>
    {/if}
  </header>
  <div class="live-preconnect__body">
    {@render children()}
  </div>
</section>

<style>
  .live-preconnect {
    position: relative;
    flex: 1 1 auto;
    min-height: 0;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: var(--space-5);
    padding: clamp(16px, 2.5vw, 28px);
    box-sizing: border-box;
    overflow: auto;
  }

  .live-preconnect__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--space-4);
    direction: rtl;
    flex-shrink: 0;
  }

  .live-preconnect__heading {
    display: grid;
    gap: var(--space-2);
    min-width: 0;
  }

  .live-preconnect__kicker {
    font-family: var(--font-mono);
    font-size: var(--step--2);
    font-weight: 800;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--secondary);
  }

  .live-preconnect__title {
    margin: 0;
    font-family: var(--font-display);
    font-size: clamp(1.5rem, 2.8vw, 2.25rem);
    line-height: 1.1;
    font-weight: 400;
    color: var(--foreground);
  }

  .live-preconnect__schedule {
    display: inline-flex;
    align-items: center;
    flex-wrap: wrap;
    gap: var(--space-2);
    margin: 0;
    min-width: 0;
  }

  .live-preconnect__schedule .material-symbols-rounded {
    --icon-size: 1.125rem;
    color: var(--accent);
  }

  .live-preconnect__subtitle {
    margin: 0;
    font-size: var(--step--1);
    font-weight: 600;
    color: var(--foreground-muted);
  }

  .live-preconnect__status {
    flex-shrink: 0;
    padding: var(--space-2) var(--space-3);
    border-radius: var(--radius-pill);
    border: 1px solid var(--border-color);
    background: var(--muted);
    color: var(--foreground-muted);
    font-size: var(--step--2);
    font-weight: 800;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .live-preconnect__status--prep {
    border-color: color-mix(in oklch, var(--accent) 45%, var(--border-color));
    background: color-mix(in oklch, var(--accent) 12%, var(--card));
    color: var(--accent);
  }

  .live-preconnect__status--live {
    border-color: color-mix(in oklch, var(--accent) 40%, var(--border-color));
    background: color-mix(in oklch, var(--accent) 10%, var(--muted));
    color: var(--accent);
  }

  .live-preconnect__body {
    flex: 1 1 auto;
    min-height: 0;
    display: flex;
    flex-direction: column;
  }
</style>
