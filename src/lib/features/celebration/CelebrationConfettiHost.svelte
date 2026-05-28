<script lang="ts">
  import { browser } from "$app/environment";
  import { celebration } from "./celebration.svelte";
  import CelebrationBurstView from "./CelebrationBurstView.svelte";

  const bursts = $derived(celebration.bursts);
  const hasHeavy = $derived(bursts.some((b) => b.magnitude === "triumph"));
</script>

{#if browser && bursts.length > 0}
  <div class="celebration-confetti-host" class:celebration-confetti-host--heavy={hasHeavy} aria-hidden="true">
    {#each bursts as burst (burst.key)}
      <CelebrationBurstView {burst} />
    {/each}
  </div>
{/if}

<style>
  .celebration-confetti-host {
    position: fixed;
    inset: 0;
    z-index: 250;
    pointer-events: none;
    overflow: hidden;
  }

  .celebration-confetti-host--heavy {
    z-index: 300;
  }
</style>
