<script lang="ts">
  import type { FunctionReturnType } from "convex/server";
  import { Button, Dialog } from "bits-ui";
  import { api } from "$convex/_generated/api";

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
    onChoosePlan,
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
    onChoosePlan: (slug: string) => void;
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
      <Dialog.Title class="subscription-modal__title">מסלולי מנוי חודשיים</Dialog.Title>
      <Dialog.Description class="subscription-modal__desc">
        שדרוג נכנס לתוקף מיד. שנמוך יותר יתחיל בסוף התקופה הנוכחית. חיוב יחובר בהמשך.
      </Dialog.Description>

      <div class="plan-grid">
        {#each plans as plan}
          {@const isScheduled = plan.slug === pendingPlanSlug}
          {@const isActive = plan.slug === activePlanSlug}
          {@const isDowngrade = Boolean(
            subscriptionPlan && plan.monthlyPriceIls < subscriptionPlan.monthlyPriceIls,
          )}
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
              onclick={() => onChoosePlan(plan.slug)}
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
              {pending === "cancel" ? "מבטלים..." : "ביטול בסוף התקופה"}
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
    max-width: min(720px, calc(100vw - var(--space-8)));
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
    color: var(--muted);
    line-height: 1.5;
  }

  .plan-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: var(--space-3);
  }

  .plan-option {
    display: grid;
    gap: var(--space-3);
    padding: var(--space-4);
    border: var(--border);
    background: var(--white);
    min-width: 0;
  }

  .plan-option--active {
    border-color: var(--secondary);
    background: var(--surface);
  }

  .plan-option--scheduled {
    border-color: var(--warning);
    background: var(--surface);
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

  @media (max-width: 720px) {
    .plan-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
