<script lang="ts">
  import type { FunctionReturnType } from "convex/server";
  import { api } from "$convex/_generated/api";
  import { useQuery } from "convex-svelte";
  import { LOCAL_TIMEZONE } from "$lib/datetime/local";
  import { orderStatusLabelHe } from "$lib/features/subscriptions/planChangeImpact";

  type BillingRow = FunctionReturnType<typeof api.subscriptions.checkout.listMyBillingHistory>[number];

  let { enabled = true }: { enabled?: boolean } = $props();

  const historyQuery = useQuery(api.subscriptions.checkout.listMyBillingHistory, () =>
    enabled ? { limit: 12 } : "skip",
  );

  function formatDate(ts: number) {
    return new Date(ts).toLocaleDateString("he-IL", {
      timeZone: LOCAL_TIMEZONE,
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  function formatAmount(row: BillingRow) {
    return `${row.amountIls.toLocaleString("he-IL")} ₪`;
  }
</script>

<section class="billing-history" aria-labelledby="billing-history-title">
  <h3 id="billing-history-title">חיובים אחרונים</h3>

  {#if historyQuery.isLoading}
    <p class="billing-history__empty">טוען…</p>
  {:else if historyQuery.error}
    <p class="billing-history__empty">לא נטען — נסו שוב.</p>
  {:else if (historyQuery.data ?? []).length === 0}
    <p class="billing-history__empty">אין חיובים עדיין.</p>
  {:else}
    <ul class="billing-history__list">
      {#each historyQuery.data ?? [] as row (row._id)}
        <li class="billing-history__row">
          <div class="billing-history__row-main">
            <span class="billing-history__desc">{row.productDescription}</span>
            <span class="billing-history__date">{formatDate(row.fulfilledAt ?? row.createdAt)}</span>
          </div>
          <div class="billing-history__row-side">
            <span class="billing-history__amount">{formatAmount(row)}</span>
            <span class="billing-history__status" data-status={row.status}>
              {orderStatusLabelHe(row.status)}
            </span>
            {#if row.invoiceNumber}
              <span class="billing-history__invoice" dir="ltr">#{row.invoiceNumber}</span>
            {/if}
          </div>
        </li>
      {/each}
    </ul>
  {/if}
</section>

<style>
  .billing-history {
    display: grid;
    gap: var(--space-2);
    padding-top: var(--space-3);
    border-top: 1px solid color-mix(in oklch, var(--foreground) 8%, transparent);
  }

  .billing-history h3 {
    margin: 0;
    font-size: var(--step--1);
    font-weight: 700;
    color: var(--foreground-muted);
  }

  .billing-history__empty {
    margin: 0;
    font-size: var(--step--1);
    color: var(--foreground-muted);
  }

  .billing-history__list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: var(--space-1);
  }

  .billing-history__row {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    justify-content: space-between;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-3);
    border-radius: var(--radius-md);
    background: color-mix(in oklch, var(--foreground) 4%, var(--elevated));
    min-width: 0;
  }

  .billing-history__row-main {
    display: grid;
    gap: 0.1rem;
    min-width: 0;
  }

  .billing-history__desc {
    font-size: var(--step--1);
    font-weight: 600;
    overflow-wrap: anywhere;
  }

  .billing-history__date {
    font-size: var(--step--2);
    color: var(--foreground-muted);
  }

  .billing-history__row-side {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: var(--space-2);
    text-align: end;
  }

  .billing-history__amount {
    font-family: var(--font-mono);
    font-size: var(--step--1);
    font-weight: 700;
  }

  .billing-history__status {
    font-size: var(--step--2);
    font-family: var(--font-mono);
    color: var(--foreground-muted);
  }

  .billing-history__status[data-status="fulfilled"],
  .billing-history__status[data-status="paid"] {
    color: var(--success);
  }

  .billing-history__status[data-status="failed_payment"] {
    color: var(--destructive);
  }

  .billing-history__invoice {
    font-size: var(--step--2);
    color: var(--foreground-muted);
  }
</style>
