<script lang="ts">
  import CreditDisc from "./CreditDisc.svelte";
  import type { CreditPool } from "./types";
  import "./credits.css";

  let {
    pool,
    count,
    label,
    size = "sm",
  }: {
    pool: CreditPool;
    count: number;
    label?: string;
    size?: "xs" | "sm";
  } = $props();

  const discSize = $derived(size === "xs" ? "xs" : "sm");
</script>

<span class="credit-pool-chip credit-pool-chip--{size}" data-pool={pool}>
  <CreditDisc {pool} size={discSize} />
  <span class="credit-pool-chip__text">
    {#if label}
      <span class="credit-pool-chip__label">{label}</span>
    {/if}
    <span class="credit-pool-chip__count">{count}</span>
  </span>
</span>
