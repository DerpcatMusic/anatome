<script lang="ts">
  import type { CreditPool } from "../types";
  import { creditPoolPrestige } from "../creditPoolTheme";
  import CreditIconVod from "./CreditIconVod.svelte";
  import CreditIconLive from "./CreditIconLive.svelte";
  import CreditIconOneOnOne from "./CreditIconOneOnOne.svelte";

  let {
    pool,
    class: className = "",
  }: {
    pool: CreditPool;
    class?: string;
  } = $props();

  const prestige = $derived(creditPoolPrestige(pool));
</script>

<span
  class="credit-icon credit-icon--{pool} credit-icon--p{prestige} {className}"
  data-pool={pool}
  data-prestige={prestige}
  aria-hidden="true"
>
  {#if pool === "vod"}
    <CreditIconVod />
  {:else if pool === "live"}
    <CreditIconLive />
  {:else}
    <CreditIconOneOnOne />
  {/if}
</span>

<style>
  .credit-icon {
    display: inline-grid;
    place-items: center;
    line-height: 0;
    color: var(--credit-disc-icon, currentColor);
  }

  .credit-icon :global(svg) {
    width: 1em;
    height: 1em;
    display: block;
  }

  .credit-icon--p2 {
    filter: drop-shadow(0 1px 2px color-mix(in oklch, var(--credit-private) 35%, transparent));
  }
</style>
