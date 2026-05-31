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

  const orderId = $derived.by(() => {
    const raw = page.url.searchParams.get("orderId");
    return raw ? (raw as Id<"subscriptionOrders">) : null;
  });

  const embed = $derived(page.url.searchParams.get("embed") === "1");

  const orderStatus = useQuery(api.subscriptions.checkout.getOrderStatus, () =>
    orderId ? { orderId } : "skip",
  );

  $effect(() => {
    if (!browser || !orderId || !embed) return;
    notifyCardcomCheckoutParent("failure", orderId);
  });

  function goToDashboard() {
    void goto("/u/dashboard");
  }
</script>

{#if embed}
  <p class="billing-result__embed" aria-live="polite">התשלום לא הושלם.</p>
{:else}

<section class="billing-result l-shell">
  <h1>התשלום לא הושלם</h1>
  <p class="billing-result__lead">
    לא בוצע חיוב. המנוי והנקודות לא השתנו — אפשר לנסות שוב מהאזור האישי.
  </p>

  {#if orderStatus.data?.status === "failed_payment"}
    <Notice tone="danger">התשלום נדחה או בוטל בדף הסליקה.</Notice>
  {:else}
    <Notice tone="caution">אם חויבתם בכל זאת, פנו לתמיכה — נבדוק מול ספק התשלום.</Notice>
  {/if}

  <div class="billing-result__actions">
    <Button.Root
      class="hb-button hb-button--ink"
      type="button"
      onclick={goToDashboard}
    >
      חזרה לאזור האישי
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
