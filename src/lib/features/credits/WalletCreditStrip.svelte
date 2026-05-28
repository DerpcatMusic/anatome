<script lang="ts">
  import { Tooltip } from "bits-ui";
  import { useI18n } from "$lib/i18n/runes.svelte";
  import CreditCoin from "./CreditCoin.svelte";
  import { EMPTY_CREDIT_BALANCES } from "./balances";
  import type { CreditBalances, CreditPool } from "./types";
  import "./credits.css";

  let {
    balances = EMPTY_CREDIT_BALANCES,
    pools,
    size = "sm",
    layout = "stack",
    amountFirst = false,
    class: className = "",
  }: {
    balances?: CreditBalances;
    pools: CreditPool[];
    size?: "sm" | "md";
    layout?: "row" | "stack";
    /** Number before disc on each row (sidebar) */
    amountFirst?: boolean;
    class?: string;
  } = $props();

  const { t } = useI18n();

  const visiblePools = $derived(pools.filter(Boolean));
</script>

{#if visiblePools.length > 0}
  <Tooltip.Provider delayDuration={160}>
    <div
      class="wallet-credit-strip wallet-credit-strip--{layout} wallet-credit-strip--{size} {className}"
      role="group"
      aria-label={t.app.wallet.creditsAria()}
      dir="ltr"
    >
      {#each visiblePools as pool (pool)}
        <CreditCoin {pool} balance={balances[pool]} {size} {amountFirst} />
      {/each}
    </div>
  </Tooltip.Provider>
{/if}
