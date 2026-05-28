<script lang="ts">
  import type { FunctionReturnType } from "convex/server";
  import { Button, Dialog } from "bits-ui";
  import { api } from "$convex/_generated/api";
  import {
    planChangeChargeIls,
    resolvePlanChangeMode,
    type PlanChangeMode,
  } from "$lib/features/subscriptions/planChangeImpact";
  import { CHECKOUT_ENABLED } from "$lib/features/subscriptions/featureFlags";

  type Plan = FunctionReturnType<typeof api.subscriptions.customer.listPlans>[number];
  type SubscriptionPlan = NonNullable<
    FunctionReturnType<typeof api.users.dashboard.get>
  >["subscriptionPlan"];

  let {
    open = $bindable(false),
    targetPlan = null,
    currentPlan = null,
    renewalDate = null,
    pending = false,
    onConfirm,
  }: {
    open?: boolean;
    targetPlan?: Plan | null;
    currentPlan?: SubscriptionPlan | null;
    renewalDate?: string | null;
    pending?: boolean;
    onConfirm: () => void;
  } = $props();

  const mode = $derived<PlanChangeMode | null>(
    targetPlan ? resolvePlanChangeMode(targetPlan, currentPlan) : null,
  );
  const chargeIls = $derived(targetPlan ? planChangeChargeIls(targetPlan, currentPlan) : 0);
</script>

<Dialog.Root bind:open>
  <Dialog.Portal>
    <Dialog.Overlay class="hb-dialog-overlay" />
    <Dialog.Content class="hb-dialog-content billing-confirm" aria-labelledby="plan-change-title">
      {#if targetPlan && mode}
        <Dialog.Title id="plan-change-title" class="billing-confirm__title">
          {#if mode === "subscribe"}
            הפעלת {targetPlan.nameHe}
          {:else if mode === "upgrade_now"}
            שדרוג ל־{targetPlan.nameHe}
          {:else if mode === "downgrade_scheduled"}
            מעבר ל־{targetPlan.nameHe}
          {:else}
            אישור שינוי
          {/if}
        </Dialog.Title>
        <Dialog.Description class="billing-confirm__desc">
          <div class="billing-confirm__impact">
            {#if mode === "subscribe"}
              <p>
                תשלום חודשי של <strong>{targetPlan.monthlyPriceIls} ₪</strong>
                {#if CHECKOUT_ENABLED}
                  — מעבר לדף תשלום מאובטח.
                {/if}
              </p>
              <p class="billing-confirm__credits">
                {targetPlan.vodCreditsPerMonth} נקודות מוקלט · {targetPlan.liveCreditsPerMonth} לייב ·
                {targetPlan.oneOnOneCreditsPerMonth} אישי — בכל חודש.
              </p>
            {:else if mode === "upgrade_now"}
              <p>
                {#if CHECKOUT_ENABLED && chargeIls > 0}
                  תשלום היום: <strong>{chargeIls} ₪</strong> (הפרש מסלול) — ייפתח טופס תשלום מוטמע
                  באתר.
                {:else}
                  המסלול יתעדכן מיד עם תוספת נקודות לפי ההפרש.
                {/if}
              </p>
              <p>מחיר חודשי חדש: <strong>{targetPlan.monthlyPriceIls} ₪</strong>.</p>
            {:else if mode === "downgrade_scheduled"}
              <p>
                המסלול הנוכחי נשאר עד <strong>{renewalDate ?? "סוף התקופה"}</strong>, ואז עוברים ל־
                <strong>{targetPlan.nameHe}</strong> ({targetPlan.monthlyPriceIls} ₪ לחודש).
              </p>
              <p>לא יגבה סכום נוסף היום.</p>
            {/if}
            {#if renewalDate && mode !== "downgrade_scheduled"}
              <p class="billing-confirm__renewal">חידוש הבא: {renewalDate}.</p>
            {/if}
          </div>
        </Dialog.Description>

        <div class="billing-confirm__actions">
          <Dialog.Close class="hb-button hb-button--paper hb-button--sm" type="button" disabled={pending}>
            ביטול
          </Dialog.Close>
          <Button.Root
            class="hb-button hb-button--ink hb-button--sm"
            type="button"
            disabled={pending || mode === "same"}
            onclick={onConfirm}
          >
            {#if pending}
              ממשיכים…
            {:else if mode === "subscribe" || (mode === "upgrade_now" && CHECKOUT_ENABLED)}
              המשך לתשלום
            {:else}
              אישור שינוי
            {/if}
          </Button.Root>
        </div>
      {/if}
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>

<style>
  :global(.billing-confirm) {
    display: grid;
    gap: var(--space-4);
    max-width: min(28rem, calc(100vw - var(--space-8)));
  }

  :global(.billing-confirm__title) {
    margin: 0;
    font-size: var(--step-1);
    line-height: 1.2;
  }

  :global(.billing-confirm__desc) {
    margin: 0;
    color: var(--foreground);
    line-height: 1.55;
  }

  .billing-confirm__impact {
    display: grid;
    gap: var(--space-2);
  }

  .billing-confirm__impact p {
    margin: 0;
  }

  .billing-confirm__credits {
    font-size: var(--step--1);
    color: var(--foreground-muted);
  }

  .billing-confirm__renewal {
    font-size: var(--step--1);
    color: var(--foreground-muted);
    padding-top: var(--space-2);
    border-top: var(--border);
  }

  .billing-confirm__actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-3);
    justify-content: flex-end;
  }
</style>
