<script lang="ts">
  import { browser } from "$app/environment";
  import { Dialog } from "bits-ui";
  import { useEventListener } from "runed";
  import { api } from "$convex/_generated/api";
  import type { Id } from "$convex/_generated/dataModel";
  import { useConvexClient, useQuery } from "convex-svelte";
  import { initAuth, canRunAuthenticatedQuery } from "$lib/auth/session.svelte";
  import { openAuthOverlay } from "$lib/auth/open-overlay";
  import { useQueryNowMs } from "$lib/convex/queryClock.svelte";
  import Notice from "$components/ui/Notice.svelte";
  import { useActivePlans } from "$lib/features/subscriptions/activePlans.svelte";
  import { useBillingFlags } from "$lib/features/subscriptions/useBillingFlags.svelte";
  import { useSubscriptionAccess } from "$lib/features/subscriptions/useSubscriptionAccess.svelte";
  import { pollCheckoutRedirectUrl, runPlanCheckout } from "$lib/features/subscriptions/checkoutFlow";
  import { useCardcomCheckoutChannel } from "$lib/features/subscriptions/useCardcomCheckoutChannel.svelte";
  import SubscriptionPlanPicker from "$lib/features/subscriptions/components/SubscriptionPlanPicker.svelte";
  import PlanChangeConfirmDialog from "$lib/features/subscriptions/components/PlanChangeConfirmDialog.svelte";
  import CardcomCheckoutModal from "$lib/features/subscriptions/components/CardcomCheckoutModal.svelte";
  import {
    SUBSCRIPTION_PICKER_CLOSE_EVENT,
    SUBSCRIPTION_PICKER_OPEN_EVENT,
    readSubscriptionPickerDetail,
    stashPendingPlanSlug,
    takePendingPlanSlug,
  } from "$lib/features/subscriptions/open-subscription-picker";
  import { fireSubscriptionAccepted } from "$lib/features/celebration/celebration.svelte";
  import type { FunctionReturnType } from "convex/server";
  import { planTierTheme } from "$lib/features/subscriptions/planTierTheme";

  type Plan = NonNullable<FunctionReturnType<typeof api.subscriptions.customer.listPlans>>[number];

  let pickerOpen = $state(false);
  let highlightSlug = $state<string | null>(null);
  let planConfirmOpen = $state(false);
  let planToConfirm = $state<Plan | null>(null);
  let pending = $state<string | null>(null);
  let error = $state("");
  let success = $state("");

  let cardcomOpen = $state(false);
  let cardcomUrl = $state<string | null>(null);
  let cardcomOrderId = $state<Id<"subscriptionOrders"> | null>(null);
  let cardcomPlanSlug = $state("guided");
  let cardcomAmountIls = $state<number | undefined>(undefined);

  const auth = initAuth();
  const client = useConvexClient();
  const queryNow = useQueryNowMs();
  const activePlans = useActivePlans();
  const billing = useBillingFlags();
  const access = useSubscriptionAccess();
  const checkoutEnabled = $derived(billing.checkoutEnabled);

  const subscriptionQuery = useQuery(api.subscriptions.customer.getMine, () =>
    auth.isAuthenticated && canRunAuthenticatedQuery()
      ? { now: queryNow.nowMs }
      : "skip",
  );

  const plans = $derived(activePlans.plans);
  const subscription = $derived(subscriptionQuery.data?.subscription ?? null);
  const subscriptionPlan = $derived(subscriptionQuery.data?.plan ?? null);
  const pendingSubscriptionPlan = $derived(subscriptionQuery.data?.pendingPlan ?? null);
  const canSubscribe = $derived(
    !auth.isAuthenticated || access.canSubscribe,
  );

  const renewalDate = $derived(
    subscription
      ? new Date(subscription.currentPeriodEnd).toLocaleDateString("he-IL")
      : null,
  );

  if (browser) {
    useEventListener(window, SUBSCRIPTION_PICKER_OPEN_EVENT, (event) => {
      const detail = readSubscriptionPickerDetail(event);
      highlightSlug = detail?.highlightSlug ?? null;
      error = "";
      success = "";
      pickerOpen = true;
    });
    useEventListener(window, SUBSCRIPTION_PICKER_CLOSE_EVENT, () => {
      pickerOpen = false;
    });
  }

  useCardcomCheckoutChannel({
    getActiveOrderId: () => cardcomOrderId,
    onResult: ({ status }) => {
      cardcomOpen = false;
      cardcomUrl = null;
      cardcomOrderId = null;
      cardcomAmountIls = undefined;
      if (status === "success") {
        fireSubscriptionAccepted(planTierTheme(cardcomPlanSlug).tier);
        window.location.assign("/u/dashboard");
      } else {
        error = "התשלום לא הושלם. אפשר לנסות שוב.";
      }
    },
  });

  $effect(() => {
    if (!auth.isAuthenticated || auth.isLoading) return;
    if (!access.canSubscribe) return;
    const slug = takePendingPlanSlug();
    if (!slug) return;
    highlightSlug = slug;
    const plan = plans.find((row) => row.slug === slug);
    if (plan) {
      planToConfirm = plan;
      planConfirmOpen = true;
      pickerOpen = true;
    }
  });

  function requestPlan(slug: string) {
    if (auth.isAuthenticated && !access.canSubscribe) {
      error = "מנוי בתשלום מיועד למנויות בלבד, לא למדריכות.";
      return;
    }
    const plan = plans.find((row) => row.slug === slug);
    if (!plan) return;
    if (!auth.isAuthenticated) {
      stashPendingPlanSlug(slug);
      pickerOpen = false;
      openAuthOverlay();
      return;
    }
    planToConfirm = plan;
    planConfirmOpen = true;
  }

  async function confirmPlan() {
    if (!planToConfirm || !access.canSubscribe) return;
    pending = planToConfirm.slug;
    error = "";
    success = "";
    try {
      const result = await runPlanCheckout(client, planToConfirm.slug, {
        hasSubscription: Boolean(subscription),
        checkoutEnabled,
      });
      planConfirmOpen = false;
      const slug = planToConfirm.slug;
      planToConfirm = null;
      pickerOpen = false;

      if (result.mode === "checkout") {
        const plan = plans.find((row) => row.slug === slug);
        cardcomPlanSlug = slug;
        cardcomAmountIls = plan?.monthlyPriceIls;
        cardcomOrderId = result.orderId;
        cardcomUrl = await pollCheckoutRedirectUrl(client, result.orderId);
        cardcomOpen = true;
      } else if (result.mode === "scheduled") {
        fireSubscriptionAccepted(planTierTheme(slug).tier);
        success = "המסלול יתעדכן בתחילת מחזור החיוב הבא — ללא תשלום היום.";
      } else {
        fireSubscriptionAccepted(planTierTheme(slug).tier);
        success = "המנוי עודכן.";
      }
    } catch (reason) {
      error = reason instanceof Error ? reason.message : "לא הצלחנו לעדכן מנוי כרגע.";
    } finally {
      pending = null;
    }
  }

  function handleCardcomClose() {
    cardcomOpen = false;
    cardcomUrl = null;
    cardcomOrderId = null;
    cardcomAmountIls = undefined;
  }
</script>

<Dialog.Root bind:open={pickerOpen}>
  <Dialog.Portal>
    <Dialog.Overlay class="hb-dialog-overlay" />
    <Dialog.Content class="hb-dialog-content subscription-picker-dialog" aria-label="בחירת מסלול">
      <Dialog.Title class="subscription-picker-dialog__title">בחרו מסלול</Dialog.Title>
      <Dialog.Description class="subscription-picker-dialog__desc">
        כל מסלול עם אופי משלו — ככל שהמסלול עשיר יותר, החוויה מורגשת יותר. שדרוג דורש תשלום; הורדת
        מסלול מתוזמנת לחידוש הבא.
      </Dialog.Description>

      {#if auth.isAuthenticated && !canSubscribe}
        <Notice tone="caution">
          מנוי בתשלום מיועד למנויות בלבד. מדריכות משתמשות בלוח הבקרה המקצועי.
        </Notice>
      {:else if activePlans.isLoading}
        <p class="subscription-picker-dialog__loading" aria-busy="true">טוענים מסלולים…</p>
      {:else if plans.length > 0}
        <SubscriptionPlanPicker
          {plans}
          {highlightSlug}
          activePlanSlug={subscriptionPlan?.slug ?? null}
          pendingPlanSlug={pendingSubscriptionPlan?.slug ?? null}
          {pending}
          onSelectPlan={requestPlan}
        />
      {:else}
        <Notice tone="danger">אין מסלולים זמינים כרגע.</Notice>
      {/if}

      <Dialog.Close class="hb-button hb-button--ghost hb-button--sm">סגירה</Dialog.Close>
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>

<PlanChangeConfirmDialog
  bind:open={planConfirmOpen}
  targetPlan={planToConfirm}
  currentPlan={subscriptionPlan}
  {renewalDate}
  pending={pending !== null}
  onConfirm={confirmPlan}
/>

<CardcomCheckoutModal
  bind:open={cardcomOpen}
  checkoutUrl={cardcomUrl}
  planSlug={cardcomPlanSlug}
  kind="subscription"
  amountIls={cardcomAmountIls}
  onClose={handleCardcomClose}
/>

{#if error || success}
  <div class="subscription-picker-toast" role="status">
    {#if success}
      <Notice tone="success">{success}</Notice>
    {:else if error}
      <Notice tone="danger">{error}</Notice>
    {/if}
  </div>
{/if}

<style>
  :global(.subscription-picker-dialog) {
    display: grid;
    gap: var(--space-5);
    width: min(960px, calc(100vw - var(--space-6)));
    max-height: min(92vh, 900px);
    overflow: auto;
  }

  :global(.subscription-picker-dialog__title) {
    margin: 0;
    font-size: var(--step-2);
  }

  :global(.subscription-picker-dialog__desc) {
    margin: 0;
    color: var(--foreground-muted);
    line-height: 1.5;
  }

  .subscription-picker-dialog__loading {
    margin: 0;
    color: var(--foreground-muted);
  }

  .subscription-picker-toast {
    position: fixed;
    inset-inline: var(--space-4);
    bottom: var(--space-4);
    z-index: 80;
    max-width: 28rem;
    margin-inline: auto;
  }
</style>
