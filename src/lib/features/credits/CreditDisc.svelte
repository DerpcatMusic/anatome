<script lang="ts">
  import CreditIcon from "./icons/CreditIcon.svelte";
  import { creditPoolPrestige } from "./creditPoolTheme";
  import type { CreditPool } from "./types";
  import "./credits.css";

  let {
    pool,
    size = "sm",
    class: className = "",
  }: {
    pool: CreditPool;
    /** xs · sm (default buy-credits) · md · lg */
    size?: "xs" | "sm" | "md" | "lg";
    class?: string;
  } = $props();

  const prestige = $derived(creditPoolPrestige(pool));
</script>

<span
  class="credit-disc credit-disc--{size} {className}"
  data-pool={pool}
  data-prestige={prestige}
  aria-hidden="true"
>
  <CreditIcon {pool} />
</span>
