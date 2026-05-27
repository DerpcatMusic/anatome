<script lang="ts">
  import { Button } from "bits-ui";
  import type { Snippet } from "svelte";

  let {
    icon,
    title,
    message = "",
    hint = "",
    tone = "neutral",
    spinning = false,
    primaryLabel,
    onPrimary,
    secondaryLabel,
    onSecondary,
    children,
  }: {
    icon: string;
    title: string;
    message?: string;
    hint?: string;
    tone?: "neutral" | "warning" | "danger";
    spinning?: boolean;
    primaryLabel?: string;
    onPrimary?: () => void;
    secondaryLabel?: string;
    onSecondary?: () => void;
    children?: Snippet;
  } = $props();
</script>

<div class="lr-status-overlay" data-tone={tone} role="dialog" aria-modal="true" aria-labelledby="lr-status-title">
  <div class="lr-status-overlay__wash" aria-hidden="true"></div>
  <div class="lr-status-card">
    <span
      class="material-symbols-rounded lr-status-card__icon"
      class:lr-spin={spinning}
      aria-hidden="true"
    >{icon}</span>
    <h2 id="lr-status-title" class="lr-status-card__title">{title}</h2>
    {#if message}
      <p class="lr-status-card__message">{message}</p>
    {/if}
    {#if hint}
      <p class="lr-status-card__hint">{hint}</p>
    {/if}
    {#if children}
      {@render children()}
    {/if}
    {#if primaryLabel || secondaryLabel}
      <div class="lr-status-card__actions">
        {#if primaryLabel && onPrimary}
          <Button.Root class="hb-button hb-button--primary hb-button--md" type="button" onclick={onPrimary}>
            {primaryLabel}
          </Button.Root>
        {/if}
        {#if secondaryLabel && onSecondary}
          <Button.Root class="hb-button hb-button--ghost hb-button--sm" type="button" onclick={onSecondary}>
            {secondaryLabel}
          </Button.Root>
        {/if}
      </div>
    {/if}
  </div>
</div>

<style>
  .lr-status-overlay {
    position: fixed;
    inset: 0;
    z-index: 60;
    display: grid;
    place-items: center;
    padding: var(--space-4);
    box-sizing: border-box;
    background: color-mix(in oklch, var(--foreground) 88%, var(--video-bg));
    color: var(--background);
  }

  .lr-status-overlay__wash {
    position: absolute;
    inset: 0;
    background:
      radial-gradient(ellipse 80% 60% at 50% 0%, color-mix(in oklch, var(--accent) 18%, transparent), transparent 70%),
      radial-gradient(ellipse 60% 50% at 80% 100%, color-mix(in oklch, var(--secondary) 12%, transparent), transparent 65%);
    pointer-events: none;
  }

  .lr-status-card {
    position: relative;
    display: grid;
    gap: var(--space-3);
    justify-items: center;
    max-width: 420px;
    width: 100%;
    padding: clamp(var(--space-5), 5vw, var(--space-7));
    text-align: center;
    border-radius: var(--radius-xl);
    border: var(--glass-border);
    background: color-mix(in oklch, var(--glass-strong-bg) 12%, var(--foreground));
    backdrop-filter: var(--glass-blur);
    -webkit-backdrop-filter: var(--glass-blur);
    box-shadow: var(--shadow-ambient);
  }

  .lr-status-overlay[data-tone="warning"] .lr-status-card__icon {
    color: var(--warning);
  }

  .lr-status-overlay[data-tone="danger"] .lr-status-card__icon {
    color: color-mix(in oklch, var(--destructive) 85%, var(--background));
  }

  .lr-status-card__icon {
    font-size: var(--step-3);
    color: color-mix(in oklch, var(--accent) 75%, var(--background));
  }

  .lr-status-card__title {
    margin: 0;
    font-family: var(--font-display);
    font-size: var(--step-1);
    line-height: 1.15;
    font-weight: 400;
  }

  .lr-status-card__message {
    margin: 0;
    font-size: var(--step--1);
    line-height: 1.5;
    color: color-mix(in oklch, var(--background) 82%, transparent);
    max-width: 36ch;
  }

  .lr-status-card__hint {
    margin: 0;
    font-family: var(--font-mono);
    font-size: var(--step--2);
    letter-spacing: 0.02em;
    color: color-mix(in oklch, var(--background) 65%, transparent);
  }

  .lr-status-card__actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-3);
    justify-content: center;
    padding-top: var(--space-2);
  }

  .material-symbols-rounded {
    --icon-size: 1.5rem;
    --icon-opsz: 24;
  }

  .lr-spin {
    animation: lr-spin 1.2s linear infinite;
  }

  @keyframes lr-spin {
    to {
      transform: rotate(360deg);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .lr-spin {
      animation: none;
    }
  }
</style>
