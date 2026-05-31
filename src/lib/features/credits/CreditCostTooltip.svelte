<script lang="ts">
  import { browser } from '$app/environment';

  import { Tooltip } from "bits-ui";
  import CreditCostHint from "./CreditCostHint.svelte";
  import type { CreditPool } from "./types";

  let {
    cost = 1,
    balance = 0,
    pool = "vod",
    enabled = true,
    child: triggerChild,
  }: {
    cost?: number;
    balance?: number;
    pool?: CreditPool;
    enabled?: boolean;
    child: import("svelte").Snippet<[{ props: Record<string, unknown> }]>;
  } = $props();

  const show = $derived(enabled && cost > 0);
  let coarsePointer = $state(false);

  $effect(() => {
    if (!browser) return;
    coarsePointer = window.matchMedia("(pointer: coarse)").matches;
  });
</script>

{#if show && coarsePointer}
  <div class="credit-cost-touch">
    {@render triggerChild({ props: {} })}
    <CreditCostHint {cost} {balance} {pool} />
  </div>
{:else if show}
  <Tooltip.Root>
    <Tooltip.Trigger>
      {#snippet child({ props })}
        {@render triggerChild({ props })}
      {/snippet}
    </Tooltip.Trigger>
    <Tooltip.Portal>
      <Tooltip.Content class="hb-tooltip-content credit-cost-tooltip" side="top" sideOffset={6}>
        <CreditCostHint {cost} {balance} {pool} />
      </Tooltip.Content>
    </Tooltip.Portal>
  </Tooltip.Root>
{:else}
  {@render triggerChild({ props: {} })}
{/if}

<style>
  :global(.credit-cost-tooltip) {
    padding: 6px 10px;
    border-radius: 8px;
    max-width: none;
  }

  .credit-cost-touch {
    display: grid;
    gap: var(--space-1);
  }

  .credit-cost-touch :global(.credit-cost-hint) {
    font-size: var(--step--2);
  }
</style>
