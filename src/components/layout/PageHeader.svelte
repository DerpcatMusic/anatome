<script lang="ts">
  import type { Snippet } from "svelte";

  let { kicker, title, children }: { kicker?: string; title: string; children?: Snippet } = $props();
</script>

<header class="page-header">
  <div>
    {#if kicker}
      <p class="page-header__kicker">{kicker}</p>
    {/if}
    <h2 class="page-header__title">{title}</h2>
  </div>
  {#if children}
    <div class="page-header__action">
      {@render children()}
    </div>
  {/if}
</header>

<style>
  .page-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--space-4);
    padding-bottom: var(--space-4);
    border-bottom: var(--border);
  }

  .page-header__kicker {
    font-family: var(--font-mono);
    font-size: var(--step--1);
    color: var(--muted);
    margin: 0 0 var(--space-1);
  }

  .page-header__title {
    font-size: var(--step-2);
    line-height: 1.1;
    margin: 0;
  }

  .page-header__action {
    flex-shrink: 0;
  }
</style>
