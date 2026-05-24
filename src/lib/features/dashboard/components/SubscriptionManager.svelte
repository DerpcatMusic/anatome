<script lang="ts">
  import type { FunctionReturnType } from "convex/server";
  import { Button } from "bits-ui";
  import { api } from "$convex/_generated/api";
  import { useConvexClient, useQuery } from "convex-svelte";
  import Notice from "$components/ui/Notice.svelte";

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
  const plansQuery = useQuery(api.subscriptions.customer.listPlans, {});
  let pending = $state<string | null>(null);
  let error = $state("");

  const activePlanSlug = $derived(subscriptionPlan?.slug ?? null);
  const pendingPlanSlug = $derived(pendingSubscriptionPlan?.slug ?? null);
  const renewalDate = $derived(subscription ? new Date(subscription.currentPeriodEnd).toLocaleDateString("he-IL") : null);
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
    error = "";
    pending = slug;
    try {
      if (subscription) {
        await client.mutation(api.subscriptions.customer.changePlan, { planSlug: slug });
      } else {
        await client.mutation(api.subscriptions.customer.activatePlan, { planSlug: slug });
      }
    } catch (reason) {
      error = reason instanceof Error ? reason.message : "לא הצלחנו לעדכן מנוי כרגע.";
    } finally {
      pending = null;
    }
  }

  async function cancelAtPeriodEnd() {
    error = "";
    pending = "cancel";
    try {
      await client.mutation(api.subscriptions.customer.cancelAtPeriodEnd, {});
    } catch (reason) {
      error = reason instanceof Error ? reason.message : "לא הצלחנו לבטל מנוי כרגע.";
    } finally {
      pending = null;
    }
  }

  async function cancelPendingPlanChange() {
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
    error = "";
    pending = "resume";
    try {
      await client.mutation(api.subscriptions.customer.resume, {});
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
      <h2 id="subscription-title">{subscriptionPlan?.nameHe ?? "אין מנוי פעיל"}</h2>
    </div>
    <span class="subscription-badge" data-tone={subscription?.cancelAtPeriodEnd || pendingSubscriptionPlan ? "warning" : subscription ? "success" : "muted"}>
      {statusLabel(subscription)}
    </span>
  </div>

  {#if subscription && renewalDate}
    <p class="subscription-panel__meta">
      {#if pendingSubscriptionPlan}
        המסלול הנוכחי נשאר פעיל עד {renewalDate}, ואז יתחדש במסלול {pendingSubscriptionPlan.nameHe}.
      {:else}
        {subscription.cancelAtPeriodEnd ? "הגישה תישאר פעילה עד" : "התקופה הנוכחית מסתיימת ב"} {renewalDate}
      {/if}
    </p>
  {:else}
    <p class="subscription-panel__meta">אפשר להפעיל מסלול עכשיו. חיוב יחובר בהמשך דרך ספק ישראלי.</p>
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

  {#if plansQuery.error}
    <Notice tone="danger">לא הצלחנו לטעון מסלולים. נסו שוב בעוד רגע.</Notice>
  {:else if plansQuery.isLoading}
    <Notice>טוענים מסלולים...</Notice>
  {:else}
    <div class="plan-grid">
      {#each plansQuery.data ?? [] as plan}
        {@const isScheduled = plan.slug === pendingPlanSlug}
        {@const isActive = plan.slug === activePlanSlug}
        {@const isDowngrade = Boolean(subscriptionPlan && plan.monthlyPriceIls < subscriptionPlan.monthlyPriceIls)}
        <article class="plan-option" class:plan-option--active={isActive} class:plan-option--scheduled={isScheduled}>
          <div class="plan-option__head">
            <span class="plan-option__name">{plan.nameHe}</span>
            <span class="plan-option__price">{plan.monthlyPriceIls} ₪</span>
          </div>
          <div class="plan-option__credits">
            <span>{plan.vodCreditsPerMonth} Macroflow</span>
            <span>{plan.liveCreditsPerMonth} לייב</span>
            <span>{plan.oneOnOneCreditsPerMonth} פרטי</span>
          </div>
          <Button.Root
            class="hb-button hb-button--paper hb-button--sm"
            type="button"
            disabled={pending !== null || isActive || isScheduled}
            onclick={() => choosePlan(plan.slug)}
          >
            {#if isActive}
              המסלול הנוכחי
            {:else if isScheduled}
              מתוזמן לחידוש
            {:else if pending === plan.slug}
              מעדכנים...
            {:else if subscription && isDowngrade}
              שינוי בסוף החודש
            {:else if subscription}
              שדרוג עכשיו
            {:else}
              הפעלת מסלול
            {/if}
          </Button.Root>
        </article>
      {/each}
    </div>
  {/if}

  {#if error}
    <Notice tone="danger">{error}</Notice>
  {/if}

  {#if subscription}
    <div class="subscription-actions">
      {#if pendingSubscriptionPlan}
        <Button.Root class="hb-button hb-button--paper hb-button--sm" type="button" disabled={pending !== null} onclick={cancelPendingPlanChange}>
          {pending === "cancel-change" ? "מבטלים..." : "ביטול שינוי מתוזמן"}
        </Button.Root>
      {/if}
      {#if subscription.cancelAtPeriodEnd}
        <Button.Root class="hb-button hb-button--ink hb-button--sm" type="button" disabled={pending !== null} onclick={resume}>
          {pending === "resume" ? "מחדשים..." : "להשאיר מנוי פעיל"}
        </Button.Root>
      {:else}
        <Button.Root class="hb-button hb-button--ghost hb-button--sm" type="button" disabled={pending !== null} onclick={cancelAtPeriodEnd}>
          {pending === "cancel" ? "מבטלים..." : "ביטול בסוף התקופה"}
        </Button.Root>
      {/if}
    </div>
  {/if}
</section>

<style>
  .subscription-panel {
    display: grid;
    gap: var(--space-5);
    padding: var(--space-6);
    border: var(--border);
    background: linear-gradient(135deg, color-mix(in srgb, var(--white) 97%, var(--sky-soft) 3%), var(--white));
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
    background: var(--success-bg);
    color: var(--success-text);
    border-color: transparent;
  }

  .subscription-badge[data-tone="warning"] {
    background: var(--sky-soft);
    color: var(--sky-strong);
    border-color: transparent;
  }

  .subscription-badge[data-tone="muted"] {
    background: var(--surface);
    color: var(--muted);
  }

  .credit-strip,
  .plan-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: var(--space-3);
  }

  .credit-tile,
  .plan-option {
    min-width: 0;
    border: var(--border);
    background: var(--white);
  }

  .credit-tile {
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

  .plan-option {
    display: grid;
    gap: var(--space-3);
    padding: var(--space-4);
  }

  .plan-option--active {
    border-color: var(--sky-strong);
    background: color-mix(in srgb, var(--sky-soft) 18%, var(--white));
  }

  .plan-option--scheduled {
    border-color: var(--warning);
    background: color-mix(in srgb, var(--warning-bg) 42%, var(--white));
  }

  .plan-option__head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: var(--space-3);
    min-width: 0;
  }

  .plan-option__name {
    font-weight: 800;
    overflow-wrap: anywhere;
  }

  .plan-option__price {
    flex: 0 0 auto;
    font-family: var(--font-mono);
    font-size: var(--step--1);
    color: var(--muted);
  }

  .plan-option__credits {
    display: grid;
    gap: var(--space-1);
    color: var(--muted);
    font-size: var(--step--1);
    line-height: 1.45;
  }

  .subscription-actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-3);
    justify-content: flex-end;
    padding-top: var(--space-4);
    border-top: var(--border);
  }

  @media (max-width: 900px) {
    .plan-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 640px) {
    .subscription-panel__header,
    .subscription-actions {
      align-items: stretch;
      flex-direction: column;
    }

    .credit-strip,
    .plan-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
