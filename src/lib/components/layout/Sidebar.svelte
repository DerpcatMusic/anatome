<script lang="ts">
  import type { Snippet } from "svelte";

  let { children, title }: { children: Snippet; title?: string } = $props();
</script>

<aside class="sidebar" aria-label="תפריט צד">
  {#if title}
    <p class="sidebar__title">{title}</p>
  {/if}
  <div class="sidebar__items">
    {@render children()}
  </div>
</aside>

<style>
  .sidebar {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    padding-inline-start: var(--space-5);
    border-inline-start: var(--border);
    min-width: 180px;
  }

  .sidebar__title {
    font-family: var(--font-mono);
    font-size: var(--step--2);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--foreground-muted);
    font-weight: 700;
    margin: 0 0 var(--space-2);
    padding-bottom: var(--space-2);
    border-bottom: var(--border);
  }

  .sidebar__items {
    display: flex;
    flex-direction: column;
  }

  @media (max-width: 820px) {
    .sidebar {
      border-inline-start: 0;
      border-block-start: var(--border);
      padding-inline-start: 0;
      padding-block-start: var(--space-4);
      flex-direction: row;
      flex-wrap: wrap;
    }

    .sidebar__items {
      flex-direction: row;
      flex-wrap: wrap;
      gap: var(--space-2);
    }
  }
</style>
