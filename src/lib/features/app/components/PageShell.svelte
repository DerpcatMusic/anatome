<script lang="ts">
  import Notice from "$components/ui/Notice.svelte";

  let {
    kicker,
    title,
    description,
    badge,
    headerExtra,
    loading,
    error,
    children,
  }: {
    kicker?: string;
    title: string;
    description?: string;
    badge?: string;
    headerExtra?: import("svelte").Snippet;
    loading?: boolean;
    error?: string | null;
    children: import("svelte").Snippet;
  } = $props();
</script>

<div class="page-shell">
  <div class="page-shell__header">
    <div class="page-shell__title-group">
      {#if kicker}
        <p class="kicker">{kicker}</p>
      {/if}
      <div class="title-row">
        <h1 class="page-title">{title}</h1>
        {#if badge}
          <span class="badge">{badge}</span>
        {/if}
      </div>
    </div>
    {#if headerExtra}
      {@render headerExtra()}
    {/if}
  </div>

  {#if description}
    <p class="description">{description}</p>
  {/if}

  {#if error}
    <Notice tone="danger">{error}</Notice>
  {/if}

  {#if loading}
    <div class="skeleton-state">
      <div class="skeleton skeleton--lg"></div>
      <div class="skeleton"></div>
      <div class="skeleton"></div>
    </div>
  {:else}
    {@render children()}
  {/if}
</div>

<style>
  .page-shell {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
    min-width: 0;
    flex: 1;
  }

  .page-shell__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-4);
    flex-wrap: wrap;
  }

  .page-shell__title-group {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    min-width: 0;
  }

  .title-row {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    flex-wrap: wrap;
  }

  .kicker {
    font-family: var(--font-mono);
    font-size: var(--step--1);
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--muted);
    margin: 0;
  }

  .page-title {
    font-size: clamp(2.25rem, 4vw, 4.5rem);
    line-height: 1.1;
    margin: 0;
  }

  .badge {
    font-family: var(--font-mono);
    font-size: var(--step--2);
    font-weight: 700;
    text-transform: uppercase;
    padding: 2px 8px;
    border: var(--border);
    background: var(--surface);
    color: var(--ink);
    flex: 0 0 auto;
  }

  .description {
    color: var(--muted);
    line-height: 1.7;
    max-width: 72ch;
    margin: 0;
  }

  .skeleton-state {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    border: var(--border);
    background: var(--white);
    padding: var(--space-5);
  }

  .skeleton {
    background: var(--line-light);
    animation: pulse 1.6s ease-in-out infinite;
  }

  .skeleton--lg {
    height: 180px;
  }

  .skeleton:not(.skeleton--lg) {
    height: 48px;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.35; }
  }
</style>
