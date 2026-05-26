<script lang="ts">
  import { creditCostPreview } from "./credit-cost";
  import type { CreditPool } from "./types";
  import "./credit-cost-hint.css";

  let {
    cost = 1,
    balance = 0,
    pool = "vod",
  }: {
    cost?: number;
    balance?: number;
    pool?: CreditPool;
  } = $props();

  const preview = $derived(creditCostPreview(balance, cost, pool));
</script>

<p
  class="credit-cost-hint"
  class:credit-cost-hint--low={!preview.affordable}
  data-pool={pool}
  aria-live="polite"
>
  <span class="credit-cost-hint__cost">−{preview.cost}</span>
  <span class="credit-cost-hint__sep" aria-hidden="true">·</span>
  <span class="credit-cost-hint__remain">נשאר {preview.remaining}</span>
</p>
