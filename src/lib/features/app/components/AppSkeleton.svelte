<script lang="ts">
  let { title = true, lines = 2, width = "60%" }: { title?: boolean; lines?: number; width?: string } = $props();
</script>

<div class="loading grid gap-3">
  {#if title}
    <div class="skeleton skeleton--title"></div>
  {/if}
  {#each Array.from({ length: lines }) as _, i}
    <div class="skeleton skeleton--text" style={i === lines - 1 ? `width: ${width};` : undefined}></div>
  {/each}
</div>

<style>
  .loading {
    max-width: 480px;
    margin-inline: auto;
    margin-top: 15vh;
    padding: var(--space-5);
    border: var(--border);
    background: var(--elevated);
  }

  .skeleton {
    background: var(--line-light);
    animation: skeleton-pulse 1.6s ease-in-out infinite;
  }

  .skeleton--title { height: 36px; width: 60%; }
  .skeleton--text { height: 16px; width: 100%; }

  @keyframes skeleton-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.35; }
  }
</style>
