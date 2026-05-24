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

<div class="entry-state">
  {#if loading}
    <div class="entry-state__spinner"></div>
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
    background:
      linear-gradient(135deg, var(--surface), transparent 58%),
      var(--white);
    text-align: center;
    backdrop-filter: blur(18px);
  }

  .entry-state h2 {
    font-size: var(--step-2);
    line-height: 1.05;
  }

  .entry-state p {
    color: var(--muted);
    font-size: var(--step-0);
    font-weight: 750;
  }

  .entry-state__spinner {
    width: 42px;
    height: 42px;
    border: 3px solid var(--secondary);
    border-top-color: var(--ink);
    border-radius: 50%;
    animation: spin 0.75s linear infinite;
  }

  .entry-state__actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: var(--space-3);
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
</style>
