<script lang="ts">
  import { Dialog } from "bits-ui";
  import { dev } from "$app/environment";
  import { BILLING_SANDBOX_MODE } from "$lib/features/subscriptions/featureFlags";
  import { planTierTheme } from "../planTierTheme";
  import "./CardcomCheckoutModal.css";

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
    title ?? (kind === "credits" ? "רכישת קרדיטים" : "סיום הרשמה למסלול"),
  );

  const resolvedDesc = $derived(
    description ??
      "פרטי האשראי מוזנים בטופס מאובטח (PCI). אפשר לשלם בכרטיס אשראי בלבד.",
  );

  const ilsFormatter = new Intl.NumberFormat("he-IL", {
    style: "currency",
    currency: "ILS",
    minimumFractionDigits: 2,
  });

  const amountLabel = $derived(
    amountIls !== undefined ? ilsFormatter.format(amountIls) : null,
  );

  let showDevCssHint = $state(false);
  $effect(() => {
    showDevCssHint = dev && typeof window !== "undefined" && window.location.hostname === "localhost";
  });

  function handleOpenChange(next: boolean) {
    if (!next) onClose();
  }
</script>

<Dialog.Root
  bind:open
  onOpenChange={handleOpenChange}
>
  <Dialog.Portal>
    <Dialog.Overlay class="hb-dialog-overlay cardcom-checkout-overlay" />
    <Dialog.Content
      class="hb-dialog-content cardcom-checkout-modal cardcom-checkout-modal--immersive {theme.cardClass}"
      aria-label="תשלום מאובטח"
    >
      <div class="cardcom-checkout-modal__toolbar">
        <header class="cardcom-checkout-modal__head">
          <p class="cardcom-checkout-modal__eyebrow">תשלום מאובטח</p>
          <Dialog.Title class="cardcom-checkout-modal__title">{resolvedTitle}</Dialog.Title>
          <Dialog.Description class="cardcom-checkout-modal__desc">{resolvedDesc}</Dialog.Description>
          {#if showDevCssHint}
            <p class="cardcom-checkout-modal__sandbox">
              פיתוח מקומי: עיצוב CardCom דורש `CARDCOM_CHECKOUT_CSS_URL` על HTTPS ציבורי.
            </p>
          {/if}
        </header>
        {#if amountLabel}
          <p class="cardcom-checkout-modal__amount" aria-label="סכום לתשלום">{amountLabel}</p>
        {/if}
      </div>

      {#if children}
        <div class="cardcom-checkout-modal__summary">{@render children()}</div>
      {/if}

      <div class="cardcom-checkout-modal__frame-wrap">
        {#if checkoutUrl}
          <iframe
            class="cardcom-checkout-modal__frame"
            title="טופס תשלום מאובטח"
            src={checkoutUrl}
            allow="payment"
          ></iframe>
        {:else}
          <p class="cardcom-checkout-modal__loading" aria-busy="true">
            <span class="cardcom-checkout-modal__spinner" aria-hidden="true"></span>
            טוענים טופס תשלום…
          </p>
        {/if}
      </div>

      <footer class="cardcom-checkout-modal__foot">
        <p class="cardcom-checkout-modal__secure">
          {#if BILLING_SANDBOX_MODE}
            מצב בדיקות — לא חיוב אמיתי (CardTest1994).
          {:else}
            מעובד על ידי CardCom · AnatoMe לא שומר פרטי כרטיס.
          {/if}
        </p>
        <Dialog.Close class="hb-button hb-button--ghost hb-button--sm">ביטול</Dialog.Close>
      </footer>
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>
