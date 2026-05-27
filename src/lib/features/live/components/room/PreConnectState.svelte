<script lang="ts">
  import Notice from "$components/ui/Notice.svelte";
  import { Button } from "bits-ui";

  let {
    title,
    message = "",
    tone = "neutral",
    actionLabel,
    actionHref,
    onAction,
    secondaryLabel,
    secondaryHref,
    loading = false,
  }: {
    title?: string;
    message?: string;
    tone?: "neutral" | "danger" | "caution";
    actionLabel?: string;
    actionHref?: string;
    onAction?: () => void;
    secondaryLabel?: string;
    secondaryHref?: string;
    loading?: boolean;
  } = $props();
</script>

<div class="entry-state" data-tone={tone} aria-busy={loading}>
  {#if loading}
    <div class="entry-state__spinner" role="status" aria-label={message || title || "טוען"}></div>
  {:else if tone === "danger"}
    <span class="material-symbols-rounded entry-state__icon entry-state__icon--danger" aria-hidden="true">error</span>
  {:else if tone === "caution"}
    <span class="material-symbols-rounded entry-state__icon entry-state__icon--caution" aria-hidden="true">info</span>
  {/if}
  {#if title}<h2>{title}</h2>{/if}
  {#if message}
    {#if tone === "neutral"}
      <p>{message}</p>
    {:else}
      <Notice tone={tone}>{message}</Notice>
    {/if}
  {/if}
  {#if actionLabel || secondaryLabel}
    <div class="entry-state__actions">
      {#if actionLabel}
        <Button.Root class="hb-button hb-button--primary" href={actionHref} onclick={onAction}>{actionLabel}</Button.Root>
      {/if}
      {#if secondaryLabel && secondaryHref}
        <Button.Root class="hb-button hb-button--secondary" href={secondaryHref}>{secondaryLabel}</Button.Root>
      {/if}
    </div>
  {/if}
</div>

<style>
  .entry-state {
    align-self: center;
    justify-self: center;
    width: min(100%, 620px);
    display: grid;
    justify-items: center;
    gap: var(--space-4);
    padding: clamp(28px, 6vw, 72px);
    border: var(--border);
    border-radius: var(--radius-xl);
    background: var(--card);
    box-shadow: var(--shadow-md);
    text-align: center;
    direction: rtl;
  }

  .entry-state h2 {
    font-family: var(--font-display);
    font-size: var(--step-1);
    line-height: 1.15;
    font-weight: 400;
    max-width: 100%;
    overflow-wrap: anywhere;
    word-break: break-word;
    margin: 0;
  }

  .entry-state p {
    color: var(--foreground-muted);
    font-size: var(--step--1);
    font-weight: 600;
    line-height: 1.5;
    max-width: 100%;
    overflow-wrap: anywhere;
    word-break: break-word;
    margin: 0;
  }

  .entry-state__icon {
    font-size: var(--step-2);
  }

  .entry-state__icon--danger {
    color: var(--destructive);
  }

  .entry-state__icon--caution {
    color: var(--warning);
  }

  .entry-state__spinner {
    width: 44px;
    height: 44px;
    border: 3px solid var(--accent-subtle);
    border-top-color: var(--accent);
    border-radius: 50%;
    animation: spin 0.9s linear infinite;
  }

  .entry-state__actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: var(--space-3);
    padding-top: var(--space-2);
  }

  .material-symbols-rounded {
    --icon-size: 1.5rem;
    --icon-opsz: 24;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .entry-state__spinner {
      animation: none;
      border-top-color: var(--accent-subtle);
    }
  }
</style>
