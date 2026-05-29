<script lang="ts">
  import type { LiveSessionPreConnect } from "$lib/features/live/live-session.svelte";

  let { session }: { session: LiveSessionPreConnect } = $props();

  const profile = $derived(session.browserMediaProfile);
  const warnings = $derived(session.publishPerformanceWarnings);
</script>

{#if profile.hints.length > 0 || warnings.length > 0}
  <aside class="live-media-hints" aria-label="הנחיות ביצועים">
    {#if !profile.hardwareAccelLikely}
      <p class="live-media-hints__warn">
        <span class="material-symbols-rounded" aria-hidden="true">memory</span>
        קידוד וידאו כנראה על CPU (לא GPU). זה תלוי בדפדפן ומערכת — האפליקציה לא יכולה לכפות HW accel.
      </p>
    {/if}
    {#each warnings as line (line)}
      <p class="live-media-hints__item">{line}</p>
    {/each}
    {#each profile.hints as hint (hint)}
      <p class="live-media-hints__item live-media-hints__item--muted">{hint}</p>
    {/each}
  </aside>
{/if}

<style>
  .live-media-hints {
    display: grid;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-3);
    border-radius: 10px;
    border: 1px solid var(--border-color);
    background: var(--muted);
    font-size: var(--step--2);
    line-height: 1.45;
  }

  .live-media-hints__warn {
    display: flex;
    align-items: flex-start;
    gap: var(--space-2);
    margin: 0;
    font-weight: 700;
    color: var(--foreground);
  }

  .live-media-hints__warn .material-symbols-rounded {
    font-size: 1.1rem;
    color: var(--accent);
  }

  .live-media-hints__item {
    margin: 0;
    color: var(--foreground);
  }

  .live-media-hints__item--muted {
    color: var(--foreground-muted);
  }
</style>
