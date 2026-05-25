<script lang="ts">
  import type { FunctionReturnType } from "convex/server";
  import { Button } from "bits-ui";
  import { api } from "$convex/_generated/api";
  import { useConvexClient, useQuery } from "convex-svelte";
  import Notice from "$components/ui/Notice.svelte";
  import { SUBSCRIPTIONS_ENABLED } from "$lib/features/subscriptions/featureFlags";
  import PlanBadge from "$lib/features/subscriptions/components/PlanBadge.svelte";
  import SubscriptionPlanModal from "./SubscriptionPlanModal.svelte";

  type DashboardData = NonNullable<FunctionReturnType<typeof api.users.dashboard.get>>;
  type Plan = NonNullable<DashboardData["subscriptionPlan"]>;
  type Subscription = NonNullable<DashboardData["subscription"]>;
  type Wallet = NonNullable<DashboardData["wallet"]>;

  let {
    subscription,
    subscriptionPlan,
    pendingSubscriptionPlan,
    wallet,
  }: {
    subscription?: Subscription | null;
    subscriptionPlan?: Plan | null;
    pendingSubscriptionPlan?: Plan | null;
    wallet?: Wallet | null;
  } = $props();

  const client = useConvexClient();
  const plansQuery = useQuery(api.subscriptions.customer.listPlans, () =>
    SUBSCRIPTIONS_ENABLED ? {} : "skip",
  );
  let pending = $state<string | null>(null);
  let error = $state("");
  let planModalOpen = $state(false);

  const renewalDate = $derived(
    subscription ? new Date(subscription.currentPeriodEnd).toLocaleDateString("he-IL") : null,
  );
  const vodAvailable = $derived(wallet ? Math.max(0, wallet.vodBalance) : 0);
  const liveAvailable = $derived(wallet ? Math.max(0, wallet.liveBalance) : 0);
  const oneOnOneAvailable = $derived(wallet ? Math.max(0, wallet.oneOnOneBalance) : 0);

  function statusLabel(row?: Subscription | null) {
    if (!row) return "לא פעיל";
    if (row.cancelAtPeriodEnd) return "מבוטל בסוף התקופה";
    if (pendingSubscriptionPlan) return "שינוי מתוזמן";
    if (row.status === "trialing") return "ניסיון";
    if (row.status === "active") return "פעיל";
    if (row.status === "past_due") return "דורש טיפול";
    if (row.status === "cancelled") return "מבוטל";
    return "פג תוקף";
  }

  async function choosePlan(slug: string) {
    if (!SUBSCRIPTIONS_ENABLED) return;
    error = "";
    pending = slug;
    try {
      if (subscription) {
        await client.mutation(api.subscriptions.customer.changePlan, { planSlug: slug });
      } else {
        await client.mutation(api.subscriptions.customer.activatePlan, { planSlug: slug });
      }
      planModalOpen = false;
    } catch (reason) {
      error = reason instanceof Error ? reason.message : "לא הצלחנו לעדכן מנוי כרגע.";
    } finally {
      pending = null;
    }
  }

  async function cancelAtPeriodEnd() {
    if (!SUBSCRIPTIONS_ENABLED) return;
    error = "";
    pending = "cancel";
    try {
      await client.mutation(api.subscriptions.customer.cancelAtPeriodEnd, {});
      planModalOpen = false;
    } catch (reason) {
      error = reason instanceof Error ? reason.message : "לא הצלחנו לבטל מנוי כרגע.";
    } finally {
      pending = null;
    }
  }

  async function cancelPendingPlanChange() {
    if (!SUBSCRIPTIONS_ENABLED) return;
    error = "";
    pending = "cancel-change";
    try {
      await client.mutation(api.subscriptions.customer.cancelPendingPlanChange, {});
    } catch (reason) {
      error = reason instanceof Error ? reason.message : "לא הצלחנו לבטל שינוי מסלול כרגע.";
    } finally {
      pending = null;
    }
  }

  async function resume() {
    if (!SUBSCRIPTIONS_ENABLED) return;
    error = "";
    pending = "resume";
    try {
      await client.mutation(api.subscriptions.customer.resume, {});
      planModalOpen = false;
    } catch (reason) {
      error = reason instanceof Error ? reason.message : "לא הצלחנו לחדש מנוי כרגע.";
    } finally {
      pending = null;
    }
  }
</script>

<section class="subscription-panel" aria-labelledby="subscription-title">
  <div class="subscription-panel__header">
    <div>
      <p class="subscription-panel__kicker">מנוי וקרדיטים</p>
      <div class="subscription-panel__title-row">
        <h2 id="subscription-title">{subscriptionPlan?.nameHe ?? "אין מנוי פעיל"}</h2>
        {#if subscriptionPlan}
          <PlanBadge planName={subscriptionPlan.nameHe} planSlug={subscriptionPlan.slug} />
        {/if}
      </div>
    </div>
    <span
      class="subscription-badge"
      data-tone={subscription?.cancelAtPeriodEnd || pendingSubscriptionPlan
        ? "warning"
        : subscription
          ? "success"
          : "muted"}
    >
      {statusLabel(subscription)}
    </span>
  </div>

  {#if subscription && renewalDate}
    <p class="subscription-panel__meta">
      {#if pendingSubscriptionPlan}
        המסלול הנוכחי נשאר פעיל עד {renewalDate}, ואז יתחדש במסלול {pendingSubscriptionPlan.nameHe}.
      {:else}
        {subscription.cancelAtPeriodEnd ? "הגישה תישאר פעילה עד" : "התקופה הנוכחית מסתיימת ב"}
        {renewalDate}
      {/if}
    </p>
  {:else if SUBSCRIPTIONS_ENABLED}
    <p class="subscription-panel__meta">אפשר להפעיל מסלול עכשיו. חיוב יחובר בהמשך דרך ספק ישראלי.</p>
  {:else}
    <p class="subscription-panel__meta">
      שינוי מסלול אינו זמין כרגע באתר. לעדכון מנוי, פנו לצוות AnatoMe.
    </p>
  {/if}

  <div class="credit-strip" aria-label="קרדיטים זמינים">
    <div class="credit-tile">
      <span class="credit-tile__value">{vodAvailable}</span>
      <span class="credit-tile__label">Macroflow</span>
    </div>
    <div class="credit-tile">
      <span class="credit-tile__value">{liveAvailable}</span>
      <span class="credit-tile__label">לייב קבוצתי</span>
    </div>
    <div class="credit-tile">
      <span class="credit-tile__value">{oneOnOneAvailable}</span>
      <span class="credit-tile__label">1:1 אישי</span>
    </div>
  </div>

  {#if SUBSCRIPTIONS_ENABLED}
    {#if plansQuery.error}
      <Notice tone="danger">לא הצלחנו לטעון מסלולים. נסו שוב בעוד רגע.</Notice>
    {:else if plansQuery.isLoading}
      <Notice>טוענים מסלולים...</Notice>
    {:else}
      <div class="subscription-panel__cta">
        <Button.Root
          class="hb-button hb-button--ink hb-button--sm"
          type="button"
          onclick={() => { planModalOpen = true; }}
        >
          {subscription ? "שינוי מסלול" : "בחירת מסלול"}
        </Button.Root>
      </div>

      <SubscriptionPlanModal
        bind:open={planModalOpen}
        plans={plansQuery.data ?? []}
        {subscription}
        {subscriptionPlan}
        {pendingSubscriptionPlan}
        {pending}
        onChoosePlan={choosePlan}
        onCancelAtPeriodEnd={cancelAtPeriodEnd}
        onCancelPendingPlanChange={cancelPendingPlanChange}
        onResume={resume}
      />
    {/if}
  {/if}

  {#if error}
    <Notice tone="danger">{error}</Notice>
  {/if}
</section>

<style>
  .subscription-panel {
    display: grid;
    gap: var(--space-5);
    padding: var(--space-6);
    border: var(--border);
    background: linear-gradient(135deg, var(--white), var(--white));
    min-width: 0;
  }

  .subscription-panel__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--space-4);
    min-width: 0;
  }

  .subscription-panel__kicker {
    margin: 0 0 var(--space-2);
    font-family: var(--font-mono);
    font-size: var(--step--1);
    color: var(--muted);
    font-weight: 700;
  }

  .subscription-panel__title-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-3);
  }

  .subscription-panel h2 {
    margin: 0;
    font-size: var(--step-2);
    line-height: 1.15;
    overflow-wrap: anywhere;
  }

  .subscription-panel__meta {
    margin: 0;
    color: var(--muted);
    line-height: 1.5;
  }

  .subscription-badge {
    flex: 0 0 auto;
    padding: var(--space-1) var(--space-3);
    border: var(--border);
    font-family: var(--font-mono);
    font-size: var(--step--1);
    font-weight: 700;
    white-space: nowrap;
  }

  .subscription-badge[data-tone="success"] {
    background: var(--surface);
    color: var(--success);
    border-color: transparent;
  }

  .subscription-badge[data-tone="warning"] {
    background: var(--surface);
    color: var(--secondary);
    border-color: transparent;
  }

  .subscription-badge[data-tone="muted"] {
    background: var(--surface);
    color: var(--muted);
  }

  .credit-strip {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: var(--space-3);
  }

  .credit-tile {
    min-width: 0;
    border: var(--border);
    background: var(--white);
    display: grid;
    gap: var(--space-1);
    padding: var(--space-4);
  }

  .credit-tile__value {
    font-size: var(--step-2);
    font-weight: 800;
    line-height: 1;
  }

  .credit-tile__label {
    color: var(--muted);
    font-size: var(--step--1);
  }

  .subscription-panel__cta {
    display: flex;
    justify-content: flex-end;
  }

  @media (max-width: 640px) {
    .subscription-panel__header {
      align-items: stretch;
      flex-direction: column;
    }

    .credit-strip {
      grid-template-columns: 1fr;
    }
  }
</style>
