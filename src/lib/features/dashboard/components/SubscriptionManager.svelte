<script lang="ts">
  import { dev } from "$app/environment";
  import type { FunctionReturnType } from "convex/server";
  import type { Id } from "$convex/_generated/dataModel";
  import { api } from "$convex/_generated/api";
  import { useConvexClient, useQuery } from "convex-svelte";
  import Notice from "$components/ui/Notice.svelte";
  import { LOCAL_TIMEZONE } from "$lib/datetime/local";
  import { useBillingFlags } from "$lib/features/subscriptions/useBillingFlags.svelte";
  import CardcomCheckoutModal from "$lib/features/subscriptions/components/CardcomCheckoutModal.svelte";
  import { pollCheckoutRedirectUrl, runPlanCheckout } from "$lib/features/subscriptions/checkoutFlow";
  import { useCardcomCheckoutChannel } from "$lib/features/subscriptions/useCardcomCheckoutChannel.svelte";
  import { useSubscriptionAccess } from "$lib/features/subscriptions/useSubscriptionAccess.svelte";
  import { fireSubscriptionAccepted } from "$lib/features/celebration/celebration.svelte";
  import { planTierTheme } from "$lib/features/subscriptions/planTierTheme";
  import SubscriptionManagerTop from "./SubscriptionManagerTop.svelte";
  import SubscriptionManagerDialogs from "./SubscriptionManagerDialogs.svelte";
  import "../dashboard.css";

  const RENEWAL_DATE_OPTIONS: Intl.DateTimeFormatOptions = { timeZone: LOCAL_TIMEZONE };

  type DashboardData = NonNullable<FunctionReturnType<typeof api.users.dashboard.get>>;
  type Plan = NonNullable<FunctionReturnType<typeof api.subscriptions.customer.listPlans>>[number];
  type DashboardPlan = DashboardData["subscriptionPlan"];
  type Subscription = NonNullable<DashboardData["subscription"]>;

  let {
    subscription,
    subscriptionPlan,
    pendingSubscriptionPlan,
  }: {
    subscription?: Subscription | null;
    subscriptionPlan?: DashboardPlan | null;
    pendingSubscriptionPlan?: DashboardPlan | null;
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
      ? new Date(subscription.currentPeriodEnd).toLocaleDateString("he-IL", RENEWAL_DATE_OPTIONS)
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

  function openPlanModal() {
    planModalOpen = true;
  }

  function handleCardcomClose() {
    cardcomOpen = false;
    cardcomUrl = null;
    cardcomOrderId = null;
    cardcomAmountIls = undefined;
  }
</script>

<section class="subscription-panel dashboard-panel dashboard-panel--member-aside" aria-labelledby="subscription-title">
  {#if !canSubscribe}
    <Notice tone="caution">מנוי בתשלום למנויות בלבד.</Notice>
  {:else if sandboxMode}
    <p class="subscription-panel__sandbox" role="status">בדיקות CardCom — לא חיוב אמיתי.</p>
  {/if}

  <SubscriptionManagerTop
    {subscription}
    {subscriptionPlan}
    {pendingSubscriptionPlan}
    {statusLabel}
    {hasPaidPlan}
    {priceLine}
    {renewalLine}
    {subline}
    {canSubscribe}
    creditsPurchaseEnabled={billing.creditsPurchaseEnabled}
    {subscriptionsEnabled}
    {checkoutEnabled}
    plansQueryError={plansQuery.error}
    plansQueryLoading={plansQuery.isLoading}
    {pending}
    onOpenPlanModal={openPlanModal}
    onCancelPendingPlanChange={cancelPendingPlanChange}
  />

  <SubscriptionManagerDialogs
    {subscription}
    {subscriptionPlan}
    {pendingSubscriptionPlan}
    plans={plansQuery.data ?? []}
    {renewalDate}
    {pending}
    bind:planModalOpen
    bind:cancelDialogOpen
    bind:planConfirmOpen
    bind:planToConfirm
    {subscriptionsEnabled}
    {checkoutEnabled}
    billingError={Boolean(billing.error)}
    {success}
    {error}
    onRequestPlanChange={requestPlanChange}
    onCancelAtPeriodEnd={openCancelDialog}
    onCancelPendingPlanChange={cancelPendingPlanChange}
    onResume={resume}
    onConfirmPlanChange={confirmPlanChange}
    onCancelAtPeriodEndConfirm={cancelAtPeriodEnd}
  />
</section>

<CardcomCheckoutModal
  bind:open={cardcomOpen}
  checkoutUrl={cardcomUrl}
  planSlug={cardcomPlanSlug}
  kind="subscription"
  amountIls={cardcomAmountIls}
  onClose={handleCardcomClose}
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


</style>
