<script lang="ts">
  import type { FunctionReturnType } from "convex/server";
  import { Button, Dialog } from "bits-ui";
  import { api } from "$convex/_generated/api";
  import SubscriptionPlanPicker from "$lib/features/subscriptions/components/SubscriptionPlanPicker.svelte";

  type DashboardData = NonNullable<FunctionReturnType<typeof api.users.dashboard.get>>;
  type Plan = NonNullable<FunctionReturnType<typeof api.subscriptions.customer.listPlans>>[number];
  type Subscription = NonNullable<DashboardData["subscription"]>;

  let {
    open = $bindable(false),
    plans,
    subscription,
    subscriptionPlan,
    pendingSubscriptionPlan,
    pending,
    onRequestPlanChange,
    onCancelAtPeriodEnd,
    onCancelPendingPlanChange,
    onResume,
  }: {
    open?: boolean;
    plans: Plan[];
    subscription?: Subscription | null;
    subscriptionPlan?: DashboardData["subscriptionPlan"];
    pendingSubscriptionPlan?: DashboardData["pendingSubscriptionPlan"];
    pending: string | null;
    onRequestPlanChange: (slug: string) => void;
    onCancelAtPeriodEnd: () => void;
    onCancelPendingPlanChange: () => void;
    onResume: () => void;
  } = $props();

  const activePlanSlug = $derived(subscriptionPlan?.slug ?? null);
  const pendingPlanSlug = $derived(pendingSubscriptionPlan?.slug ?? null);
</script>

<Dialog.Root bind:open>
  <Dialog.Portal>
    <Dialog.Overlay class="hb-dialog-overlay" />
    <Dialog.Content class="hb-dialog-content subscription-modal" aria-label="ניהול מנוי חודשי">
      <Dialog.Title class="subscription-modal__title">מסלולים</Dialog.Title>
      <Dialog.Description class="subscription-modal__desc">
        לפני אישור תראו סיכום מחיר והשפעה על החיוב. שדרוג — תשלום לפי ההפרש; הורדה — בתחילת מחזור החיוב הבא.
      </Dialog.Description>

      <SubscriptionPlanPicker
        {plans}
        {activePlanSlug}
        {pendingPlanSlug}
        {pending}
        onSelectPlan={onRequestPlanChange}
      />

      {#if subscription}
        <div class="subscription-modal__actions">
          {#if pendingSubscriptionPlan}
            <Button.Root
              class="hb-button hb-button--paper hb-button--sm"
              type="button"
              disabled={pending !== null}
              onclick={onCancelPendingPlanChange}
            >
              {pending === "cancel-change" ? "מבטלים..." : "ביטול שינוי מתוזמן"}
            </Button.Root>
          {/if}
          {#if subscription.cancelAtPeriodEnd}
            <Button.Root
              class="hb-button hb-button--ink hb-button--sm"
              type="button"
              disabled={pending !== null}
              onclick={onResume}
            >
              {pending === "resume" ? "מחדשים..." : "להשאיר מנוי פעיל"}
            </Button.Root>
          {:else}
            <Button.Root
              class="hb-button hb-button--ghost hb-button--sm"
              type="button"
              disabled={pending !== null}
              onclick={onCancelAtPeriodEnd}
            >
              {pending === "cancel" ? "מבטלים..." : "ביטול מנוי…"}
            </Button.Root>
          {/if}
        </div>
      {/if}

      <Dialog.Close class="hb-button hb-button--ghost hb-button--sm subscription-modal__close">
        סגירה
      </Dialog.Close>
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>

<style>
  :global(.subscription-modal) {
    display: grid;
    gap: var(--space-5);
    max-width: min(960px, calc(100vw - var(--space-8)));
    max-height: min(90vh, 860px);
    overflow: auto;
  }

  :global(.subscription-modal__title) {
    margin: 0;
    font-size: var(--step-2);
    line-height: 1.15;
  }

  :global(.subscription-modal__desc) {
    margin: 0;
    color: var(--foreground-muted);
    line-height: 1.5;
  }

  .subscription-modal__actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-3);
    justify-content: flex-end;
    padding-top: var(--space-4);
    border-top: var(--border);
  }

  :global(.subscription-modal__close) {
    justify-self: end;
    margin-top: var(--space-2);
  }
</style>
