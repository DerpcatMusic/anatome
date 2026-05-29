<script lang="ts">
  import { dev } from "$app/environment";
  import type { FunctionReturnType } from "convex/server";
  import type { Id } from "$convex/_generated/dataModel";
  import { Button } from "bits-ui";
  import { api } from "$convex/_generated/api";
  import { useConvexClient, useQuery } from "convex-svelte";
  import Notice from "$components/ui/Notice.svelte";
  import { LOCAL_TIMEZONE } from "$lib/datetime/local";
  import { useBillingFlags } from "$lib/features/subscriptions/useBillingFlags.svelte";
  import PlanBadge from "$lib/features/subscriptions/components/PlanBadge.svelte";
  import BillingHistory from "$lib/features/subscriptions/components/BillingHistory.svelte";
  import CancelSubscriptionDialog from "$lib/features/subscriptions/components/CancelSubscriptionDialog.svelte";
  import PlanChangeConfirmDialog from "$lib/features/subscriptions/components/PlanChangeConfirmDialog.svelte";
  import CardcomCheckoutModal from "$lib/features/subscriptions/components/CardcomCheckoutModal.svelte";
  import { pollCheckoutRedirectUrl, runPlanCheckout } from "$lib/features/subscriptions/checkoutFlow";
  import { useCardcomCheckoutChannel } from "$lib/features/subscriptions/useCardcomCheckoutChannel.svelte";
  import { useSubscriptionAccess } from "$lib/features/subscriptions/useSubscriptionAccess.svelte";
  import { fireSubscriptionAccepted } from "$lib/features/celebration/celebration.svelte";
  import { planTierTheme } from "$lib/features/subscriptions/planTierTheme";
  import SubscriptionPlanModal from "./SubscriptionPlanModal.svelte";
  import "../dashboard.css";

  type DashboardData = NonNullable<FunctionReturnType<typeof api.users.dashboard.get>>;
  type Plan = NonNullable<FunctionReturnType<typeof api.subscriptions.customer.listPlans>>[number];
  type Subscription = NonNullable<DashboardData["subscription"]>;

  let {
    subscription,
    subscriptionPlan,
    pendingSubscriptionPlan,
  }: {
    subscription?: Subscription | null;
    subscriptionPlan?: Plan | null;
    pendingSubscriptionPlan?: Plan | null;
  } = $props();

  const billing = useBillingFlags();
  const access = useSubscriptionAccess();
  const subscriptionsEnabled = $derived(billing.subscriptionsEnabled);
  const checkoutEnabled = $derived(billing.checkoutEnabled);
  const sandboxMode = $derived(billing.sandbox);
  const canSubscribe = $derived(access.canSubscribe);

  let cardcomOpen = $state(false);
  let cardcomUrl = $state<string | null>(null);
  let cardcomOrderId = $state<Id<"subscriptionOrders"> | null>(null);
  let cardcomPlanSlug = $state("guided");
  let cardcomAmountIls = $state<number | undefined>(undefined);
  let success = $state("");

  useCardcomCheckoutChannel({
    getActiveOrderId: () => cardcomOrderId,
    onResult: ({ status }) => {
      cardcomOpen = false;
      cardcomUrl = null;
      cardcomOrderId = null;
      cardcomAmountIls = undefined;
      if (status === "success") {
        fireSubscriptionAccepted(planTierTheme(cardcomPlanSlug).tier);
        success = "התשלום התקבל — המנוי עודכן.";
      } else {
        error = "התשלום לא הושלם.";
      }
    },
  });

  const client = useConvexClient();
  const plansQuery = useQuery(api.subscriptions.customer.listPlans, () =>
    subscriptionsEnabled ? {} : "skip",
  );
  let pending = $state<string | null>(null);
  let error = $state("");
  let planModalOpen = $state(false);
  let cancelDialogOpen = $state(false);
  let planConfirmOpen = $state(false);
  let planToConfirm = $state<Plan | null>(null);

  const renewalDate = $derived(
    subscription
      ? new Date(subscription.currentPeriodEnd).toLocaleDateString("he-IL", {
          timeZone: LOCAL_TIMEZONE,
        })
      : null,
  );
  const hasPaidPlan = $derived(Boolean(subscription && subscriptionPlan));

  const statusLabel = $derived.by(() => {
    if (!subscription) return "חינם";
    if (subscription.cancelAtPeriodEnd) return "מסתיים";
    if (pendingSubscriptionPlan) return "שינוי מתוזמן";
    if (subscription.status === "trialing") return "ניסיון";
    if (subscription.status === "active") return "פעיל";
    if (subscription.status === "past_due") return "דורש טיפול";
    if (subscription.status === "cancelled") return "מבוטל";
    return "פג תוקף";
  });

  const subline = $derived.by(() => {
    if (!subscriptionPlan) {
      if (subscriptionsEnabled && !checkoutEnabled) {
        return "תשלום מקוון בקרוב.";
      }
      return null;
    }
    return null;
  });

  const priceLine = $derived(
    subscriptionPlan ? `${subscriptionPlan.monthlyPriceIls} ₪/חודש` : null,
  );

  const renewalLine = $derived.by(() => {
    if (!subscriptionPlan || !renewalDate) return null;
    if (pendingSubscriptionPlan) {
      return `עד ${renewalDate} → ${pendingSubscriptionPlan.nameHe}`;
    }
    if (subscription?.cancelAtPeriodEnd) {
      return `פעיל עד ${renewalDate} · ללא חידוש`;
    }
    return `חידוש ${renewalDate}`;
  });

  function requestPlanChange(slug: string) {
    const plan = (plansQuery.data ?? []).find((row) => row.slug === slug);
    if (!plan) return;
    planToConfirm = plan;
    planConfirmOpen = true;
    planModalOpen = false;
  }

  async function openCardcomCheckout(orderId: Id<"subscriptionOrders">, slug: string) {
    const plan = (plansQuery.data ?? []).find((row) => row.slug === slug);
    cardcomPlanSlug = slug;
    cardcomAmountIls = plan?.monthlyPriceIls;
    cardcomOrderId = orderId;
    cardcomUrl = await pollCheckoutRedirectUrl(client, orderId);
    cardcomOpen = true;
  }

  async function choosePlan(slug: string) {
    if (!subscriptionsEnabled || !canSubscribe) return;
    error = "";
    success = "";
    pending = slug;
    try {
      const result = await runPlanCheckout(client, slug, {
        hasSubscription: Boolean(subscription),
        checkoutEnabled,
      });
      planConfirmOpen = false;
      planToConfirm = null;
      planModalOpen = false;

      if (result.mode === "checkout") {
        await openCardcomCheckout(result.orderId, slug);
      } else if (result.mode === "scheduled") {
        fireSubscriptionAccepted(planTierTheme(slug).tier);
        success = "המסלול יתעדכן בתחילת המחזור הבא.";
      } else if (result.mode === "unchanged") {
        success = "כבר במסלול הזה.";
      } else {
        fireSubscriptionAccepted(planTierTheme(slug).tier);
        success = "המנוי עודכן.";
      }
    } catch (reason) {
      error = reason instanceof Error ? reason.message : "לא הצלחנו לעדכן מנוי.";
    } finally {
      pending = null;
    }
  }

  async function confirmPlanChange() {
    if (!planToConfirm) return;
    await choosePlan(planToConfirm.slug);
  }

  async function cancelAtPeriodEnd() {
    if (!subscriptionsEnabled) return;
    error = "";
    pending = "cancel";
    try {
      await client.mutation(api.subscriptions.customer.cancelAtPeriodEnd, {});
      cancelDialogOpen = false;
      planModalOpen = false;
    } catch (reason) {
      error = reason instanceof Error ? reason.message : "לא הצלחנו לבטל מנוי.";
    } finally {
      pending = null;
    }
  }

  function openCancelDialog() {
    cancelDialogOpen = true;
    planModalOpen = false;
  }

  async function cancelPendingPlanChange() {
    if (!subscriptionsEnabled) return;
    error = "";
    pending = "cancel-change";
    try {
      await client.mutation(api.subscriptions.customer.cancelPendingPlanChange, {});
    } catch (reason) {
      error = reason instanceof Error ? reason.message : "לא הצלחנו לבטל שינוי.";
    } finally {
      pending = null;
    }
  }

  async function resume() {
    if (!subscriptionsEnabled) return;
    error = "";
    pending = "resume";
    try {
      await client.mutation(api.subscriptions.customer.resume, {});
      planModalOpen = false;
    } catch (reason) {
      error = reason instanceof Error ? reason.message : "לא הצלחנו לחדש מנוי.";
    } finally {
      pending = null;
    }
  }
</script>

<section class="subscription-panel dashboard-panel dashboard-panel--member-aside" aria-labelledby="subscription-title">
  {#if !canSubscribe}
    <Notice tone="caution">מנוי בתשלום למנויות בלבד.</Notice>
  {:else if sandboxMode}
    <p class="subscription-panel__sandbox" role="status">בדיקות CardCom — לא חיוב אמיתי.</p>
  {/if}

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

  {#if canSubscribe && (billing.creditsPurchaseEnabled || (subscriptionsEnabled && checkoutEnabled))}
      <div class="subscription-panel__actions">
        {#if billing.creditsPurchaseEnabled}
          <a class="hb-button hb-button--ghost hb-button--sm" href="/u/credits">רכישת קרדיטים</a>
        {/if}
        {#if subscriptionsEnabled && checkoutEnabled}
          {#if plansQuery.error}
            <span class="subscription-panel__actions-hint">שגיאה בטעינת מסלולים</span>
          {:else if !plansQuery.isLoading}
            <Button.Root
              class="hb-button hb-button--ink hb-button--sm"
              type="button"
              onclick={() => {
                planModalOpen = true;
              }}
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
            onclick={cancelPendingPlanChange}
          >
            ביטול שינוי
          </Button.Root>
        {/if}
      </div>
    {/if}
  </div>

  {#if billing.error && dev}
    <Notice tone="danger">
      לא התחברנו לשרת — ודאו ש־<code>npx convex dev</code> רץ.
    </Notice>
  {/if}

  {#if canSubscribe && subscriptionsEnabled && checkoutEnabled}
    <SubscriptionPlanModal
      bind:open={planModalOpen}
      plans={plansQuery.data ?? []}
      {subscription}
      {subscriptionPlan}
      {pendingSubscriptionPlan}
      {pending}
      onRequestPlanChange={requestPlanChange}
      onCancelAtPeriodEnd={openCancelDialog}
      onCancelPendingPlanChange={cancelPendingPlanChange}
      onResume={resume}
    />

    <PlanChangeConfirmDialog
      bind:open={planConfirmOpen}
      targetPlan={planToConfirm}
      currentPlan={subscriptionPlan}
      {renewalDate}
      pending={pending !== null && pending !== "cancel" && pending !== "cancel-change" && pending !== "resume"}
      onConfirm={confirmPlanChange}
    />

    {#if subscription && subscriptionPlan && renewalDate}
      <CancelSubscriptionDialog
        bind:open={cancelDialogOpen}
        {renewalDate}
        planName={subscriptionPlan.nameHe}
        pending={pending === "cancel"}
        onConfirm={cancelAtPeriodEnd}
      />
    {/if}

    <details class="subscription-panel__billing">
      <summary class="subscription-panel__billing-summary">צפייה בחיובים</summary>
      <BillingHistory enabled={subscriptionsEnabled} hideTitle />
    </details>
  {/if}

  <footer class="subscription-panel__foot">
    <a href="mailto:hello@anatome.co.il">hello@anatome.co.il</a>
    <span aria-hidden="true">·</span>
    <a href="/legal/cancellations">ביטולים</a>
  </footer>

  {#if success}
    <Notice tone="success">{success}</Notice>
  {/if}
  {#if error}
    <Notice tone="danger">{error}</Notice>
  {/if}
</section>

<CardcomCheckoutModal
  bind:open={cardcomOpen}
  checkoutUrl={cardcomUrl}
  planSlug={cardcomPlanSlug}
  kind="subscription"
  amountIls={cardcomAmountIls}
  onClose={() => {
    cardcomOpen = false;
    cardcomUrl = null;
    cardcomOrderId = null;
    cardcomAmountIls = undefined;
  }}
/>

<style>
  .subscription-panel {
    display: grid;
    gap: var(--space-2);
    min-width: 0;
  }

  .subscription-panel__sandbox {
    margin: 0;
    padding: var(--space-1) var(--space-2);
    border-radius: var(--radius-md);
    background: color-mix(in oklch, var(--warning) 12%, var(--elevated));
    font-size: var(--text-xs);
    color: var(--foreground-muted);
  }

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

  .subscription-panel h2 {
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

  .subscription-panel__billing {
    margin-top: var(--space-1);
    border-top: 1px solid color-mix(in oklch, var(--foreground) 8%, transparent);
  }

  .subscription-panel__billing-summary {
    padding: var(--space-2) 0;
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    font-weight: 700;
    letter-spacing: 0.04em;
    color: var(--foreground-muted);
    cursor: pointer;
    list-style: none;
  }

  .subscription-panel__billing-summary::-webkit-details-marker {
    display: none;
  }

  .subscription-panel__billing-summary::before {
    content: "";
    display: inline-block;
    width: 0.35em;
    height: 0.35em;
    margin-inline-end: 0.35em;
    border-inline-end: 1.5px solid currentColor;
    border-block-end: 1.5px solid currentColor;
    transform: rotate(-45deg);
    vertical-align: 0.08em;
    transition: transform var(--duration-fast) var(--ease-out);
  }

  .subscription-panel__billing[open] .subscription-panel__billing-summary::before {
    transform: rotate(45deg);
  }

  .subscription-panel__foot {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-1) var(--space-2);
    padding-top: var(--space-2);
    margin-top: var(--space-1);
    border-top: 1px solid color-mix(in oklch, var(--foreground) 8%, transparent);
    font-size: var(--text-xs);
    color: var(--foreground-muted);
  }

  .subscription-panel__foot a {
    color: var(--primary);
    text-decoration: none;
  }

  .subscription-panel__foot a:hover {
    text-decoration: underline;
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

  @media (prefers-reduced-motion: reduce) {
    .subscription-panel__billing-summary::before {
      transition: none;
    }
  }
</style>
