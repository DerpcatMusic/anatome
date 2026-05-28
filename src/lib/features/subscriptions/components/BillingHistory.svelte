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
      month: "long",
      year: "numeric",
    });
  }

  function formatAmount(row: BillingRow) {
    return `${row.amountIls.toLocaleString("he-IL")} ₪`;
  }
</script>

<section class="billing-history" aria-labelledby="billing-history-title">
  <div class="billing-history__head">
    <h3 id="billing-history-title">היסטוריית חיובים</h3>
    <p class="billing-history__lead">חשבוניות ותשלומים אחרונים על המנוי.</p>
  </div>

  {#if historyQuery.isLoading}
    <p class="billing-history__empty">טוענים היסטוריה…</p>
  {:else if historyQuery.error}
    <p class="billing-history__empty">לא הצלחנו לטעון היסטוריה. נסו שוב בעוד רגע.</p>
  {:else if (historyQuery.data ?? []).length === 0}
    <p class="billing-history__empty">עדיין אין חיובים להצגה.</p>
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
    <p class="billing-history__note">
      צריכים קבלה במייל?
      <a href="mailto:hello@anatome.co.il?subject=בקשת%20קבלה">hello@anatome.co.il</a>
    </p>
  {/if}
</section>

<style>
  .billing-history {
    display: grid;
    gap: var(--space-3);
    padding-top: var(--space-4);
    border-top: var(--border);
  }

  .billing-history__head h3 {
    margin: 0;
    font-size: var(--step-0);
    font-weight: 800;
  }

  .billing-history__lead {
    margin: var(--space-1) 0 0;
    font-size: var(--step--1);
    color: var(--foreground-muted);
    line-height: 1.45;
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
    gap: var(--space-2);
  }

  .billing-history__row {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--space-3);
    padding: var(--space-3);
    border: var(--border);
    background: var(--surface);
    min-width: 0;
  }

  .billing-history__row-main {
    display: grid;
    gap: var(--space-1);
    min-width: 0;
  }

  .billing-history__desc {
    font-weight: 700;
    overflow-wrap: anywhere;
  }

  .billing-history__date {
    font-size: var(--step--1);
    color: var(--foreground-muted);
  }

  .billing-history__row-side {
    display: grid;
    justify-items: end;
    gap: var(--space-1);
    text-align: end;
  }

  .billing-history__amount {
    font-family: var(--font-mono);
    font-weight: 800;
  }

  .billing-history__status {
    font-size: var(--step--1);
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

  .billing-history__note {
    margin: 0;
    font-size: var(--step--1);
    color: var(--foreground-muted);
    line-height: 1.5;
  }

  .billing-history__note a {
    color: var(--primary);
    text-decoration: underline;
    text-underline-offset: 2px;
  }
</style>
