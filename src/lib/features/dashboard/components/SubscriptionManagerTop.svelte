<script lang="ts">
  import { Button } from "bits-ui";
  import PlanBadge from "$lib/features/subscriptions/components/PlanBadge.svelte";
  import type { FunctionReturnType } from "convex/server";
  import { api } from "$convex/_generated/api";

  type DashboardData = NonNullable<FunctionReturnType<typeof api.users.dashboard.get>>;
  type Plan = DashboardData["subscriptionPlan"];
  type Subscription = NonNullable<DashboardData["subscription"]>;

  interface Props {
    subscription?: Subscription | null;
    subscriptionPlan?: Plan | null;
    pendingSubscriptionPlan?: Plan | null;
    statusLabel: string;
    hasPaidPlan: boolean;
    priceLine: string | null;
    renewalLine: string | null;
    subline: string | null;
    canSubscribe: boolean;
    creditsPurchaseEnabled: boolean;
    subscriptionsEnabled: boolean;
    checkoutEnabled: boolean;
    plansQueryError: unknown;
    plansQueryLoading: boolean;
    pending: string | null;
    onOpenPlanModal: () => void;
    onCancelPendingPlanChange: () => void;
  }

  let {
    subscription,
    subscriptionPlan,
    pendingSubscriptionPlan,
    statusLabel,
    hasPaidPlan,
    priceLine,
    renewalLine,
    subline,
    canSubscribe,
    creditsPurchaseEnabled,
    subscriptionsEnabled,
    checkoutEnabled,
    plansQueryError,
    plansQueryLoading,
    pending,
    onOpenPlanModal,
    onCancelPendingPlanChange,
  }: Props = $props();
</script>

<div class="subscription-panel__top">
  <div class="subscription-panel__main">
    <div class="subscription-panel__title-row">
      {#if subscriptionPlan}
        <h2 id="subscription-title">{subscriptionPlan.nameHe}</h2>
        <PlanBadge planName={subscriptionPlan.nameHe} planSlug={subscriptionPlan.slug} />
      {:else}
        <h2 id="subscription-title">גישה חינמית</h2>
      {/if}
      <span
        class="subscription-badge"
        class:subscription-badge--free={!hasPaidPlan}
        data-tone={subscription?.cancelAtPeriodEnd || pendingSubscriptionPlan
          ? "warning"
          : subscription
            ? "success"
            : "free"}
      >
        {statusLabel}
      </span>
    </div>

    {#if priceLine}
      <p class="subscription-panel__price">{priceLine}</p>
    {/if}
    {#if renewalLine}
      <p class="subscription-panel__renewal">{renewalLine}</p>
    {/if}
    {#if subline}
      <p class="subscription-panel__hint">{subline}</p>
    {/if}

  </div>

{#if canSubscribe && (creditsPurchaseEnabled || (subscriptionsEnabled && checkoutEnabled))}
    <div class="subscription-panel__actions">
      {#if creditsPurchaseEnabled}
        <a class="hb-button hb-button--ghost hb-button--sm" href="/u/credits">רכישת קרדיטים</a>
      {/if}
      {#if subscriptionsEnabled && checkoutEnabled}
        {#if plansQueryError}
          <span class="subscription-panel__actions-hint">שגיאה בטעינת מסלולים</span>
        {:else if !plansQueryLoading}
          <Button.Root
            class="hb-button hb-button--ink hb-button--sm"
            type="button"
            onclick={onOpenPlanModal}
          >
            {subscription ? "שינוי מסלול" : "בחירת מסלול"}
          </Button.Root>
        {/if}
      {/if}
      {#if pendingSubscriptionPlan}
        <Button.Root
          class="hb-button hb-button--ghost hb-button--sm"
          type="button"
          disabled={pending === "cancel-change"}
          onclick={onCancelPendingPlanChange}
        >
          ביטול שינוי
        </Button.Root>
      {/if}
    </div>
  {/if}
</div>

<style>
  .subscription-panel__top {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--space-2);
    min-width: 0;
  }

  .subscription-panel__main {
    display: grid;
    gap: 0.15rem;
    min-width: 0;
    flex: 1 1 10rem;
  }

  .subscription-panel__title-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-2);
  }

  :global(.subscription-panel h2) {
    margin: 0;
    font-size: var(--text-base);
    font-weight: 700;
    line-height: var(--leading-snug);
    letter-spacing: var(--tracking-tight);
    overflow-wrap: anywhere;
  }

  .subscription-panel__price {
    margin: 0;
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    font-weight: 700;
    color: var(--ink);
  }

  .subscription-panel__renewal,
  .subscription-panel__hint {
    margin: 0;
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--foreground-muted);
    line-height: var(--leading-snug);
  }

  .subscription-badge {
    flex: 0 0 auto;
    padding: 0.1rem var(--space-2);
    border-radius: var(--radius-pill);
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    font-weight: 700;
    white-space: nowrap;
  }

  .subscription-badge--free,
  .subscription-badge[data-tone="free"] {
    background: color-mix(in oklch, var(--foreground) 6%, var(--elevated));
    color: var(--foreground-muted);
  }

  .subscription-badge[data-tone="success"] {
    background: color-mix(in oklch, var(--success) 14%, var(--elevated));
    color: var(--success);
  }

  .subscription-badge[data-tone="warning"] {
    background: color-mix(in oklch, var(--warning) 16%, var(--elevated));
    color: var(--ink-secondary);
  }

  .subscription-panel__actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-2);
    flex-shrink: 0;
  }

  .subscription-panel__actions-hint {
    font-size: var(--text-xs);
    color: var(--destructive);
  }

  @media (max-width: 640px) {
    .subscription-panel__top {
      flex-direction: column;
    }

    .subscription-panel__actions {
      width: 100%;
      justify-content: flex-start;
    }
  }
</style>
