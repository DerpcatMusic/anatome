<script lang="ts">
  import { browser } from "$app/environment";
  import { page } from "$app/state";
  import { goto } from "$app/navigation";
  import type { Id } from "$convex/_generated/dataModel";
  import { api } from "$convex/_generated/api";
  import { useQuery } from "convex-svelte";
  import { Button } from "bits-ui";
  import Notice from "$components/ui/Notice.svelte";
  import { notifyCardcomCheckoutParent } from "$lib/features/subscriptions/cardcomEmbed";

  const orderKind = $derived(
    page.url.searchParams.get("orderKind") === "credit" ? "credit" : "subscription",
  );

  const subscriptionOrderId = $derived.by(() => {
    if (orderKind !== "subscription") return null;
    const raw = page.url.searchParams.get("orderId");
    return raw ? (raw as Id<"subscriptionOrders">) : null;
  });

  const creditOrderId = $derived.by(() => {
    if (orderKind !== "credit") return null;
    const raw = page.url.searchParams.get("orderId");
    return raw ? (raw as Id<"creditOrders">) : null;
  });

  const embed = $derived(page.url.searchParams.get("embed") === "1");

  const subscriptionStatus = useQuery(api.subscriptions.checkout.getOrderStatus, () =>
    subscriptionOrderId ? { orderId: subscriptionOrderId } : "skip",
  );

  const creditStatus = useQuery(api.credits.checkout.getOrderStatus, () =>
    creditOrderId ? { orderId: creditOrderId } : "skip",
  );

  const orderStatus = $derived(
    orderKind === "credit" ? creditStatus.data : subscriptionStatus.data,
  );
  const statusLoading = $derived(
    orderKind === "credit" ? creditStatus.isLoading : subscriptionStatus.isLoading,
  );

  const isFulfilled = $derived(orderStatus?.status === "fulfilled");
  const isPending = $derived(
    orderStatus?.status === "pending" ||
      orderStatus?.status === "redirected" ||
      orderStatus?.status === "paid",
  );

  const returnHref = $derived(orderKind === "credit" ? "/u/credits" : "/u/dashboard");

  $effect(() => {
    if (!browser) return;
    const orderId = orderKind === "credit" ? creditOrderId : subscriptionOrderId;
    if (!orderId) return;
    if (embed && isFulfilled) {
      notifyCardcomCheckoutParent("success", orderId);
      return;
    }
    if (isFulfilled && !embed) {
      const timer = setTimeout(() => {
        void goto(returnHref, { replaceState: true });
      }, 3000);
      return () => clearTimeout(timer);
    }
  });
</script>

{#if embed}
  <p class="billing-result__embed" aria-live="polite">מאשרים תשלום…</p>
{:else}

<section class="billing-result l-shell">
  <h1>תשלום התקבל</h1>
  <p class="billing-result__lead">
    {#if orderKind === "credit"}
      תודה — מאשרים את העסקה ומוסיפים קרדיטים לארנק.
    {:else}
      תודה — אנחנו מאשרים את העסקה ומעדכנים את המנוי והנקודות.
    {/if}
  </p>

  {#if !subscriptionOrderId && !creditOrderId}
    <Notice tone="danger">חסר מזהה הזמנה. אם חויבתם, פנו לתמיכה עם פרטי התשלום.</Notice>
  {:else if statusLoading || isPending}
    <Notice>מאשרים תשלום… בדרך כלל לוקח פחות מדקה.</Notice>
  {:else if isFulfilled}
    <Notice tone="success">
      {#if orderKind === "credit"}
        הקרדיטים עודכנו בארנק. מעבירים לדף הרכישה…
      {:else}
        המנוי והנקודות עודכנו. מעבירים לאזור האישי…
      {/if}
    </Notice>
  {:else}
    <Notice tone="caution">
      התשלום עדיין בעיבוד. אם הארנק לא מתעדכן תוך כמה דקות, צרו קשר עם מספר ההזמנה.
    </Notice>
  {/if}

  <div class="billing-result__actions">
    <Button.Root
      class="hb-button hb-button--ink"
      type="button"
      onclick={() => goto(returnHref)}
    >
      {orderKind === "credit" ? "חזרה לרכישת קרדיטים" : "לאזור האישי"}
    </Button.Root>
    <a class="billing-result__link" href="mailto:hello@anatome.co.il">תמיכה בחיוב</a>
  </div>
</section>
{/if}

<style>
  .billing-result__embed {
    margin: 0;
    padding: var(--space-4);
    text-align: center;
    font-size: var(--step--1);
    color: var(--foreground-muted);
  }

  .billing-result {
    padding: var(--space-8) var(--space-4);
    display: grid;
    gap: var(--space-4);
    max-width: 36rem;
  }

  .billing-result h1 {
    margin: 0;
    font-size: var(--step-2);
  }

  .billing-result__lead {
    margin: 0;
    color: var(--foreground-muted);
    line-height: 1.5;
  }

  .billing-result__actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-4);
    padding-top: var(--space-2);
  }

  .billing-result__link {
    font-size: var(--step--1);
    color: var(--primary);
    text-decoration: underline;
    text-underline-offset: 2px;
  }
</style>
