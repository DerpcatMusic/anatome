<script lang="ts">
  import type { FunctionReturnType } from "convex/server";
  import type { Id } from "$convex/_generated/dataModel";
  import { Button } from "bits-ui";
  import { api } from "$convex/_generated/api";
  import { useConvexClient, useQuery } from "convex-svelte";
  import Notice from "$components/ui/Notice.svelte";
  import { LOCAL_TIMEZONE } from "$lib/datetime/local";
  import { walletBalances } from "$lib/features/credits/balances";
  import { useBillingFlags } from "$lib/features/subscriptions/useBillingFlags.svelte";
  import PlanBadge from "$lib/features/subscriptions/components/PlanBadge.svelte";
  import BillingHistory from "$lib/features/subscriptions/components/BillingHistory.svelte";
  import CancelSubscriptionDialog from "$lib/features/subscriptions/components/CancelSubscriptionDialog.svelte";
  import PlanChangeConfirmDialog from "$lib/features/subscriptions/components/PlanChangeConfirmDialog.svelte";
  import CardcomCheckoutModal from "$lib/features/subscriptions/components/CardcomCheckoutModal.svelte";
  import { pollCheckoutRedirectUrl, runPlanCheckout } from "$lib/features/subscriptions/checkoutFlow";
  import { useCardcomCheckoutChannel } from "$lib/features/subscriptions/useCardcomCheckoutChannel.svelte";
  import { useSubscriptionAccess } from "$lib/features/subscriptions/useSubscriptionAccess.svelte";
  import SubscriptionPlanModal from "./SubscriptionPlanModal.svelte";

  type DashboardData = NonNullable<FunctionReturnType<typeof api.users.dashboard.get>>;
  type Plan = NonNullable<FunctionReturnType<typeof api.subscriptions.customer.listPlans>>[number];
  type Subscription = NonNullable<DashboardData["subscription"]>;

  let {
    subscription,
    subscriptionPlan,
    pendingSubscriptionPlan,
    wallet,
  }: {
    subscription?: Subscription | null;
    subscriptionPlan?: Plan | null;
    pendingSubscriptionPlan?: Plan | null;
    wallet?: DashboardData["wallet"] | null;
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
        success = "התשלום התקבל — המנוי והנקודות מתעדכנים.";
      } else {
        error = "התשלום לא הושלם. אפשר לנסות שוב.";
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

  const balances = $derived(walletBalances(wallet));

  const renewalDate = $derived(
    subscription
      ? new Date(subscription.currentPeriodEnd).toLocaleDateString("he-IL", {
          timeZone: LOCAL_TIMEZONE,
        })
      : null,
  );
  const hasPaidPlan = $derived(Boolean(subscription && subscriptionPlan));

  function statusLabel(row?: Subscription | null) {
    if (!row) return "חינם";
    if (row.cancelAtPeriodEnd) return "מסתיים בקרוב";
    if (pendingSubscriptionPlan) return "שינוי מתוזמן";
    if (row.status === "trialing") return "ניסיון";
    if (row.status === "active") return "פעיל";
    if (row.status === "past_due") return "דורש טיפול";
    if (row.status === "cancelled") return "מבוטל";
    return "פג תוקף";
  }

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
        success =
          "המסלול יתעדכן בתחילת מחזור החיוב הבא — לא נדרש תשלום היום.";
      } else if (result.mode === "unchanged") {
        success = "כבר נמצאים במסלול הזה.";
      } else {
        success = "המנוי עודכן.";
      }
    } catch (reason) {
      error = reason instanceof Error ? reason.message : "לא הצלחנו לעדכן מנוי כרגע.";
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
      error = reason instanceof Error ? reason.message : "לא הצלחנו לבטל מנוי כרגע.";
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
      error = reason instanceof Error ? reason.message : "לא הצלחנו לבטל שינוי מסלול כרגע.";
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
      error = reason instanceof Error ? reason.message : "לא הצלחנו לחדש מנוי כרגע.";
    } finally {
      pending = null;
    }
  }
</script>

<section class="subscription-panel" aria-labelledby="subscription-title">
  {#if !canSubscribe}
    <Notice tone="caution">
      מנוי בתשלום מיועד למנויות בלבד. מדריכות וצוות משתמשים בלוח הבקרה המקצועי.
    </Notice>
  {:else if sandboxMode}
    <p class="subscription-panel__sandbox" role="status">
      מצב בדיקות — תשלום CardCom sandbox (CardTest1994). לא חיוב אמיתי.
    </p>
  {/if}

  <div class="subscription-panel__header">
    <div class="subscription-panel__identity">
      <p class="subscription-panel__kicker">מנוי וחיוב</p>
      <div class="subscription-panel__title-row">
        {#if subscriptionPlan}
          <h2 id="subscription-title">{subscriptionPlan.nameHe}</h2>
          <PlanBadge planName={subscriptionPlan.nameHe} planSlug={subscriptionPlan.slug} />
        {:else}
          <h2 id="subscription-title">גישה חינמית</h2>
        {/if}
      </div>
    </div>
    <span
      class="subscription-badge"
      class:subscription-badge--free={!hasPaidPlan}
      data-tone={subscription?.cancelAtPeriodEnd || pendingSubscriptionPlan
        ? "warning"
        : subscription
          ? "success"
          : "free"}
    >
      {statusLabel(subscription)}
    </span>
  </div>

  {#if subscriptionPlan}
    <dl class="subscription-panel__facts">
      <div>
        <dt>חידוש / סיום תקופה</dt>
        <dd>{renewalDate ?? "—"}</dd>
      </div>
      {#if subscriptionPlan}
        <div>
          <dt>מחיר חודשי</dt>
          <dd>{subscriptionPlan.monthlyPriceIls} ₪</dd>
        </div>
      {/if}
    </dl>
  {/if}

  {#if subscription && renewalDate}
    <p class="subscription-panel__meta">
      {#if pendingSubscriptionPlan}
        פעיל עד {renewalDate}, ואז עוברים ל־{pendingSubscriptionPlan.nameHe}.
      {:else if subscription.cancelAtPeriodEnd}
        המנוי פעיל עד {renewalDate} — לא יחודש אוטומטית.
      {:else}
        החיוב הבא ב־{renewalDate}, אלא אם תבטלו לפני כן.
      {/if}
    </p>
  {:else if canSubscribe && subscriptionsEnabled && checkoutEnabled}
    <p class="subscription-panel__meta">
      אין מנוי בתשלום — בחרו מסלול, ראו את הסכום לפני אישור, ותשלמו בדף מאובטח.
    </p>
  {:else if subscriptionsEnabled}
    <p class="subscription-panel__meta">תשלום מקוון בקרוב — לשינוי מסלול פנו לצוות AnatoMe.</p>
  {:else if billing.error}
    <Notice tone="danger">
      לא התחברנו לשרת. ודאו ש־<code>npx convex dev</code> רץ ו־PUBLIC_CONVEX_CLIENT_URL מוגדר.
    </Notice>
  {:else}
    <p class="subscription-panel__meta">לשינוי מסלול — צרו קשר עם צוות AnatoMe.</p>
  {/if}

  {#if hasPaidPlan && wallet}
    <div class="subscription-panel__usage" aria-label="יתרת נקודות">
      <span>{balances.vod} מוקלט</span>
      <span>{balances.live} לייב</span>
      <span>{balances.oneOnOne} אישי</span>
    </div>
  {/if}

  {#if canSubscribe && billing.creditsPurchaseEnabled}
    <div class="subscription-panel__cta">
      <a class="hb-button hb-button--paper hb-button--sm" href="/u/credits">רכישת קרדיטים</a>
    </div>
  {/if}

  {#if canSubscribe && subscriptionsEnabled && checkoutEnabled}
    {#if plansQuery.error}
      <Notice tone="danger">לא הצלחנו לטעון מסלולים. נסו שוב בעוד רגע.</Notice>
    {:else if plansQuery.isLoading}
      <Notice>טוענים מסלולים...</Notice>
    {:else}
      <div class="subscription-panel__cta">
        <Button.Root
          class="hb-button hb-button--ink hb-button--sm"
          type="button"
          onclick={() => {
            planModalOpen = true;
          }}
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
    {/if}

    <BillingHistory enabled={subscriptionsEnabled} />
  {/if}

  <footer class="subscription-panel__support">
    <p>שאלות על חיוב או קבלות?</p>
    <a href="mailto:hello@anatome.co.il">hello@anatome.co.il</a>
    <span aria-hidden="true">·</span>
    <a href="/legal/cancellations">מדיניות ביטולים</a>
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
    gap: var(--space-4);
    padding: var(--space-4);
    border: var(--border);
    background: var(--elevated);
    min-width: 0;
  }

  .subscription-panel__sandbox {
    margin: 0;
    padding: var(--space-2) var(--space-3);
    border: 1px dashed var(--warning);
    background: color-mix(in oklch, var(--warning) 10%, var(--elevated));
    font-size: var(--step--1);
    line-height: 1.45;
    color: var(--ink-secondary);
  }

  .subscription-panel__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--space-4);
    min-width: 0;
  }

  .subscription-panel__identity {
    min-width: 0;
  }

  .subscription-panel__kicker {
    margin: 0 0 var(--space-2);
    font-family: var(--font-mono);
    font-size: var(--step--1);
    color: var(--foreground-muted);
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

  .subscription-panel__facts {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--space-3);
    margin: 0;
  }

  .subscription-panel__facts div {
    display: grid;
    gap: var(--space-1);
  }

  .subscription-panel__facts dt {
    margin: 0;
    font-size: var(--step--2);
    font-family: var(--font-mono);
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--foreground-muted);
  }

  .subscription-panel__facts dd {
    margin: 0;
    font-weight: 800;
  }

  .subscription-panel__meta {
    margin: 0;
    color: var(--foreground-muted);
    line-height: 1.5;
  }

  .subscription-panel__usage {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2) var(--space-4);
    font-size: var(--step--1);
    font-family: var(--font-mono);
    color: var(--foreground-muted);
  }

  .subscription-badge {
    flex: 0 0 auto;
    padding: var(--space-1) var(--space-3);
    border: var(--border);
    border-radius: 999px;
    font-family: var(--font-mono);
    font-size: var(--step--1);
    font-weight: 800;
    letter-spacing: 0.04em;
    white-space: nowrap;
  }

  .subscription-badge--free,
  .subscription-badge[data-tone="free"] {
    background: var(--surface);
    color: var(--foreground-muted);
    border-color: var(--line-light);
  }

  .subscription-badge[data-tone="success"] {
    background: color-mix(in oklch, var(--success) 12%, var(--elevated));
    color: var(--success);
    border-color: transparent;
  }

  .subscription-badge[data-tone="warning"] {
    background: color-mix(in oklch, var(--warning) 14%, var(--elevated));
    color: var(--ink-secondary);
    border-color: transparent;
  }

  .subscription-panel__cta {
    display: flex;
    justify-content: flex-end;
  }

  .subscription-panel__support {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-2);
    padding-top: var(--space-3);
    border-top: var(--border);
    font-size: var(--step--1);
    color: var(--foreground-muted);
  }

  .subscription-panel__support p {
    margin: 0;
    width: 100%;
  }

  .subscription-panel__support a {
    color: var(--primary);
    text-decoration: underline;
    text-underline-offset: 2px;
  }

  @media (max-width: 640px) {
    .subscription-panel__header {
      align-items: stretch;
      flex-direction: column;
    }

    .subscription-panel__facts {
      grid-template-columns: 1fr;
    }
  }
</style>
