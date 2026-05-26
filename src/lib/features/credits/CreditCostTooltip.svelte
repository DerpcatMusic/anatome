<script lang="ts">
  import { Tooltip } from "bits-ui";
  import CreditCostHint from "./CreditCostHint.svelte";
  import type { CreditPool } from "./types";

  let {
    cost = 1,
    balance = 0,
    pool = "vod",
    enabled = true,
    child,
  }: {
    cost?: number;
    balance?: number;
    pool?: CreditPool;
    enabled?: boolean;
    child: import("svelte").Snippet<[{ props: Record<string, unknown> }]>;
  } = $props();

  const show = $derived(enabled && cost > 0);
</script>

{#if show}
  <Tooltip.Root>
    <Tooltip.Trigger>
      {#snippet child({ props })}
        {@render child({ props })}
      {/snippet}
    </Tooltip.Trigger>
    <Tooltip.Portal>
      <Tooltip.Content class="hb-tooltip-content credit-cost-tooltip" side="top" sideOffset={6}>
        <CreditCostHint {cost} {balance} {pool} />
      </Tooltip.Content>
    </Tooltip.Portal>
  </Tooltip.Root>
{:else}
  {@render child({ props: {} })}
{/if}

<style>
  :global(.credit-cost-tooltip) {
    padding: 6px 10px;
    border-radius: 8px;
    max-width: none;
  }
</style>
