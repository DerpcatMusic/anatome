<script lang="ts">
  import { dev } from "$app/environment";
  import type { FunctionReturnType } from "convex/server";
  import type { Id } from "$convex/_generated/dataModel";
  import { api } from "$convex/_generated/api";
  import Notice from "$components/ui/Notice.svelte";
  import PlanChangeConfirmDialog from "$lib/features/subscriptions/components/PlanChangeConfirmDialog.svelte";
  import CancelSubscriptionDialog from "$lib/features/subscriptions/components/CancelSubscriptionDialog.svelte";
  import SubscriptionPlanModal from "./SubscriptionPlanModal.svelte";
  import BillingHistory from "$lib/features/subscriptions/components/BillingHistory.svelte";

  type DashboardData = NonNullable<FunctionReturnType<typeof api.users.dashboard.get>>;
  type Plan = NonNullable<FunctionReturnType<typeof api.subscriptions.customer.listPlans>>[number];
  type DashboardPlan = DashboardData["subscriptionPlan"];
  type Subscription = NonNullable<DashboardData["subscription"]>;

  interface Props {
    subscription?: Subscription | null;
    subscriptionPlan?: DashboardPlan | null;
    pendingSubscriptionPlan?: DashboardPlan | null;
    plans: Plan[];
    renewalDate: string | null;
    pending: string | null;
    planModalOpen?: boolean;
    cancelDialogOpen?: boolean;
    planConfirmOpen?: boolean;
    planToConfirm?: Plan | null;
    subscriptionsEnabled: boolean;
    checkoutEnabled: boolean;
    billingError: boolean;
    success?: string;
    error?: string;
    onRequestPlanChange: (slug: string) => void;
    onCancelAtPeriodEnd: () => void;
    onCancelPendingPlanChange: () => void;
    onResume: () => void;
    onConfirmPlanChange: () => void;
    onCancelAtPeriodEndConfirm: () => void;
  }

  let {
    subscription,
    subscriptionPlan,
    pendingSubscriptionPlan,
    plans,
    renewalDate,
    pending,
    planModalOpen = $bindable(false),
    cancelDialogOpen = $bindable(false),
    planConfirmOpen = $bindable(false),
    planToConfirm = $bindable(null),
    subscriptionsEnabled,
    checkoutEnabled,
    billingError,
    success = "",
    error = "",
    onRequestPlanChange,
    onCancelAtPeriodEnd,
    onCancelPendingPlanChange,
    onResume,
    onConfirmPlanChange,
    onCancelAtPeriodEndConfirm,
  }: Props = $props();
</script>

{#if billingError && dev}
  <Notice tone="danger">
    לא התחברנו לשרת — ודאו ש־<code>npx convex dev</code> רץ.
  </Notice>
{/if}

{#if subscriptionsEnabled && checkoutEnabled}
  <SubscriptionPlanModal
    bind:open={planModalOpen}
    {plans}
    {subscription}
    {subscriptionPlan}
    {pendingSubscriptionPlan}
    {pending}
    onRequestPlanChange={onRequestPlanChange}
    onCancelAtPeriodEnd={onCancelAtPeriodEnd}
    onCancelPendingPlanChange={onCancelPendingPlanChange}
    onResume={onResume}
  />

  <PlanChangeConfirmDialog
    bind:open={planConfirmOpen}
    targetPlan={planToConfirm}
    currentPlan={subscriptionPlan}
    {renewalDate}
    pending={pending !== null && pending !== "cancel" && pending !== "cancel-change" && pending !== "resume"}
    onConfirm={onConfirmPlanChange}
  />

  {#if subscription && subscriptionPlan && renewalDate}
    <CancelSubscriptionDialog
      bind:open={cancelDialogOpen}
      {renewalDate}
      planName={subscriptionPlan.nameHe}
      pending={pending === "cancel"}
      onConfirm={onCancelAtPeriodEndConfirm}
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

<style>
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

  @media (prefers-reduced-motion: reduce) {
    .subscription-panel__billing-summary::before {
      transition: none;
    }
  }
</style>
