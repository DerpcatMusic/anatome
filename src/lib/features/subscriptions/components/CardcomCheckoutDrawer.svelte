<script lang="ts">
  import { Dialog } from "bits-ui";
  import { dev } from "$app/environment";
  import { BILLING_SANDBOX_MODE } from "$lib/features/subscriptions/featureFlags";
  import { planTierTheme } from "../planTierTheme";
  import "./CardcomCheckoutDrawer.css";

  export type CardcomCheckoutKind = "subscription" | "credits";

  interface Props {
    open?: boolean;
    checkoutUrl: string | null;
    planSlug?: string;
    kind?: CardcomCheckoutKind;
    title?: string;
    description?: string;
    amountIls?: number;
    onClose: () => void;
    children?: import("svelte").Snippet;
  }

  let {
    open = $bindable(false),
    checkoutUrl,
    planSlug = "guided",
    kind = "subscription",
    title,
    description,
    amountIls,
    onClose,
    children,
  }: Props = $props();

  const theme = $derived(planTierTheme(planSlug));

  const resolvedTitle = $derived(
    title ?? (kind === "credits" ? "סיכום ותשלום" : "סיום הרשמה למסלול"),
  );

  const resolvedDesc = $derived(
    description ?? "פרטי האשראי בטופס מאובטח — כרטיס אשראי בלבד.",
  );

  const amountLabel = $derived(
    amountIls !== undefined
      ? new Intl.NumberFormat("he-IL", {
          style: "currency",
          currency: "ILS",
          minimumFractionDigits: 2,
        }).format(amountIls)
      : null,
  );

  const showDevCssHint = $derived(
    dev && typeof window !== "undefined" && window.location.hostname === "localhost",
  );
</script>

<Dialog.Root
  bind:open
  onOpenChange={(next) => {
    if (!next) onClose();
  }}
>
  <Dialog.Portal>
    <Dialog.Overlay class="hb-dialog-overlay cardcom-checkout-drawer__overlay" />
    <Dialog.Content
      class="cardcom-checkout-drawer {theme.cardClass}"
      aria-label="תשלום מאובטח"
    >
      <header class="cardcom-checkout-drawer__head">
        <div class="cardcom-checkout-drawer__head-text">
          <p class="cardcom-checkout-drawer__eyebrow">תשלום מאובטח</p>
          <Dialog.Title class="cardcom-checkout-drawer__title">{resolvedTitle}</Dialog.Title>
          <Dialog.Description class="cardcom-checkout-drawer__desc">{resolvedDesc}</Dialog.Description>
          {#if showDevCssHint}
            <p class="cardcom-checkout-drawer__sandbox">
              פיתוח: עיצוב CardCom דורש `CARDCOM_CHECKOUT_CSS_URL` על HTTPS ציבורי.
            </p>
          {/if}
        </div>
        <div class="cardcom-checkout-drawer__head-actions">
          {#if amountLabel}
            <p class="cardcom-checkout-drawer__amount" aria-label="סכום לתשלום">{amountLabel}</p>
          {/if}
          <Dialog.Close class="hb-button hb-button--ghost hb-button--sm" type="button">
            סגירה
          </Dialog.Close>
        </div>
      </header>

      {#if children}
        <div class="cardcom-checkout-drawer__summary">{@render children()}</div>
      {/if}

      <div class="cardcom-checkout-drawer__frame-wrap">
        {#if checkoutUrl}
          <iframe
            class="cardcom-checkout-drawer__frame"
            title="טופס תשלום מאובטח"
            src={checkoutUrl}
            allow="payment"
          ></iframe>
        {:else}
          <p class="cardcom-checkout-drawer__loading" aria-busy="true">
            <span class="cardcom-checkout-drawer__spinner" aria-hidden="true"></span>
            טוענים טופס תשלום…
          </p>
        {/if}
      </div>

      <footer class="cardcom-checkout-drawer__foot">
        <p class="cardcom-checkout-drawer__secure">
          {#if BILLING_SANDBOX_MODE}
            מצב בדיקות — לא חיוב אמיתי (CardTest1994).
          {:else}
            CardCom · AnatoMe לא שומר פרטי כרטיס.
          {/if}
        </p>
      </footer>
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>
