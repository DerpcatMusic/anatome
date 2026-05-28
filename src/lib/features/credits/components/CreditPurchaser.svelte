<script lang="ts">
  import type { Id } from "$convex/_generated/dataModel";
  import { api } from "$convex/_generated/api";
  import { useConvexClient, useQuery } from "convex-svelte";
  import { Button } from "bits-ui";
  import Notice from "$components/ui/Notice.svelte";
  import { useBillingFlags } from "$lib/features/subscriptions/useBillingFlags.svelte";
  import { useSubscriptionAccess } from "$lib/features/subscriptions/useSubscriptionAccess.svelte";
  import CardcomCheckoutModal from "$lib/features/subscriptions/components/CardcomCheckoutModal.svelte";
  import { useCardcomCheckoutChannel } from "$lib/features/subscriptions/useCardcomCheckoutChannel.svelte";
  import { pollCreditCheckoutUrl } from "$lib/features/credits/credit-checkout";
  import CreditDisc from "$lib/features/credits/CreditDisc.svelte";
  import { fireCreditNudge, firePaymentTriumph } from "$lib/features/celebration/celebration.svelte";
  import type { CreditPool } from "$lib/features/credits/types";
  import {
    CREDIT_MAX_VOLUME_DISCOUNT_PERCENT,
    CREDIT_VOLUME_DISCOUNT_MIN_QTY,
    CREDIT_UNIT_PRICE_ILS,
    formatIls,
    poolLabelHe,
    quoteCreditCart,
  } from "$lib/features/credits/pricing";
  import "./credit-purchaser.css";

  const POOLS: CreditPool[] = ["vod", "live", "oneOnOne"];

  const client = useConvexClient();
  const billing = useBillingFlags();
  const access = useSubscriptionAccess();

  const catalogQuery = useQuery(api.credits.checkout.getCatalog, () => ({}));

  let cartQty = $state<Record<CreditPool, number>>({
    vod: 0,
    live: 0,
    oneOnOne: 0,
  });

  let pending = $state(false);
  let error = $state("");
  let success = $state("");

  let checkoutOpen = $state(false);
  let checkoutUrl = $state<string | null>(null);
  let checkoutOrderId = $state<Id<"creditOrders"> | null>(null);
  let checkoutCart = $state<ReturnType<typeof quoteCreditCart> | null>(null);

  const maxQuantity = $derived(catalogQuery.data?.maxQuantity ?? 50);
  const enabled = $derived(billing.creditsPurchaseEnabled && catalogQuery.data?.enabled !== false);
  const canBuy = $derived(enabled && access.canSubscribe);

  const poolLabels = $derived(
    catalogQuery.data?.poolLabelsHe ?? {
      vod: poolLabelHe("vod"),
      live: poolLabelHe("live"),
      oneOnOne: poolLabelHe("oneOnOne"),
    },
  );

  const cartInputs = $derived(
    POOLS.filter((pool) => cartQty[pool] > 0).map((pool) => ({
      pool,
      quantity: cartQty[pool],
    })),
  );

  const cart = $derived.by(() => {
    if (cartInputs.length === 0) return null;
    try {
      return quoteCreditCart(cartInputs);
    } catch {
      return null;
    }
  });

  const cartItemCount = $derived(cartInputs.reduce((sum, row) => sum + row.quantity, 0));

  function setPoolQty(pool: CreditPool, next: number) {
    const clamped = Math.max(0, Math.min(maxQuantity, Math.floor(next)));
    cartQty = { ...cartQty, [pool]: clamped };
  }

  function adjustPool(pool: CreditPool, delta: number) {
    const next = cartQty[pool] + delta;
    setPoolQty(pool, next);
    if (delta > 0 && next > 0) {
      fireCreditNudge(pool);
    }
  }

  function onQtyInput(pool: CreditPool, raw: string) {
    const trimmed = raw.trim();
    if (trimmed === "") {
      setPoolQty(pool, 0);
      return;
    }
    const parsed = Number.parseInt(trimmed, 10);
    if (Number.isFinite(parsed)) setPoolQty(pool, parsed);
  }

  useCardcomCheckoutChannel({
    getActiveOrderId: () => checkoutOrderId,
    onResult: ({ status }) => {
      checkoutOpen = false;
      checkoutUrl = null;
      checkoutOrderId = null;
      checkoutCart = null;
      if (status === "success") {
        const pools = POOLS.filter((pool) => cartQty[pool] > 0);
        firePaymentTriumph({ kind: "credit", creditPools: pools });
        success = "התשלום התקבל — הקרדיטים נוספו לארנק.";
        cartQty = { vod: 0, live: 0, oneOnOne: 0 };
      } else {
        error = "התשלום לא הושלם. אפשר לנסות שוב.";
      }
    },
  });

  async function openCheckout() {
    if (!canBuy || !cart) return;
    error = "";
    success = "";
    pending = true;
    checkoutCart = cart;
    try {
      const result = await client.mutation(api.credits.checkout.startCheckout, {
        lines: cart.lines.map((line) => ({ pool: line.pool, quantity: line.quantity })),
      });
      checkoutOrderId = result.orderId;
      checkoutUrl = await pollCreditCheckoutUrl(client, result.orderId);
      checkoutOpen = true;
    } catch (reason) {
      checkoutCart = null;
      error = reason instanceof Error ? reason.message : "לא הצלחנו לפתוח תשלום.";
    } finally {
      pending = false;
    }
  }
</script>

<section class="credit-purchaser" aria-label="בחירת קרדיטים לרכישה">
  {#if !enabled}
    <Notice tone="caution">רכישת קרדיטים אינה פעילה כרגע.</Notice>
  {:else if !access.canSubscribe}
    <Notice tone="caution">רכישה זמינה למנויות בלבד.</Notice>
  {:else}
    <div class="credit-purchaser__layout">
      <div class="credit-purchaser__catalog" aria-label="סוגי קרדיט">
        {#each POOLS as pool (pool)}
          {@const qty = cartQty[pool]}
          {@const listPrice = CREDIT_UNIT_PRICE_ILS[pool]}
          <article
            class="credit-type-row credit-type-row--{pool}"
            class:credit-type-row--in-cart={qty > 0}
            data-pool={pool}
          >
            <CreditDisc {pool} size="sm" />
            <div class="credit-type-row__info">
              <h2 class="credit-type-row__name">{poolLabels[pool]}</h2>
              <p class="credit-type-row__price">{formatIls(listPrice)} ₪ ליחידה</p>
            </div>
            <div class="credit-type-row__qty" aria-label="כמות {poolLabels[pool]}">
              <Button.Root
                class="hb-button hb-button--ghost hb-button--sm credit-type-row__step"
                type="button"
                disabled={qty <= 0}
                onclick={() => adjustPool(pool, -1)}
                aria-label="הפחתה"
              >
                −
              </Button.Root>
              <input
                class="credit-type-row__input"
                type="number"
                inputmode="numeric"
                min="0"
                max={maxQuantity}
                step="1"
                value={qty}
                aria-label="כמות"
                oninput={(event) => onQtyInput(pool, event.currentTarget.value)}
              />
              <Button.Root
                class="hb-button hb-button--ghost hb-button--sm credit-type-row__step"
                type="button"
                disabled={qty >= maxQuantity}
                onclick={() => adjustPool(pool, 1)}
                aria-label="הוספה"
              >
                +
              </Button.Root>
            </div>
          </article>
        {/each}
      </div>

      <aside class="credit-purchaser__cart" aria-labelledby="credit-cart-title">
        <h2 id="credit-cart-title" class="credit-purchaser__cart-title">סיכום הזמנה</h2>

        {#if !cart}
          <p class="credit-purchaser__cart-empty">הזינו כמות לפחות לסוג אחד.</p>
        {:else}
          <ul class="credit-purchaser__lines">
            {#each cart.lines as line (line.pool)}
              <li class="credit-purchaser__line">
                <span class="credit-purchaser__line-name">{poolLabels[line.pool]}</span>
                <span class="credit-purchaser__line-qty">× {line.quantity}</span>
                <span class="credit-purchaser__line-total">{formatIls(line.lineTotalIls)} ₪</span>
              </li>
              {#if line.discountIls > 0}
                <li class="credit-purchaser__line credit-purchaser__line--discount">
                  <span>הנחה {line.discountPercent}%</span>
                  <span>−{formatIls(line.discountIls)} ₪</span>
                </li>
              {/if}
            {/each}
          </ul>

          <dl class="credit-purchaser__math">
            <div>
              <dt>לפני הנחה</dt>
              <dd>{formatIls(cart.listSubtotalIls)} ₪</dd>
            </div>
            {#if cart.discountIls > 0}
              <div>
                <dt>הנחות</dt>
                <dd class="credit-purchaser__discount">−{formatIls(cart.discountIls)} ₪</dd>
              </div>
            {/if}
            <div class="credit-purchaser__total">
              <dt>לתשלום</dt>
              <dd>{formatIls(cart.totalIls)} ₪</dd>
            </div>
          </dl>
        {/if}

        <p class="credit-purchaser__hint">
          {CREDIT_VOLUME_DISCOUNT_MIN_QTY}+ מאותו סוג — {CREDIT_MAX_VOLUME_DISCOUNT_PERCENT}% הנחה.
        </p>

        <Button.Root
          class="hb-button hb-button--ink hb-button--pill credit-purchaser__buy"
          type="button"
          disabled={pending || !cart}
          onclick={openCheckout}
        >
          {#if pending}
            פותחים תשלום…
          {:else if cart}
            לתשלום ({cartItemCount})
          {:else}
            לתשלום
          {/if}
        </Button.Root>

        <p class="credit-purchaser__legal">
          הקרדיטים נכנסים לארנק אחרי אישור. ללא החזר על יתרה שלא נוצלה.
        </p>
      </aside>
    </div>
  {/if}

  {#if success}
    <Notice tone="success">{success}</Notice>
  {/if}
  {#if error}
    <Notice tone="danger">{error}</Notice>
  {/if}
</section>

<CardcomCheckoutModal
  bind:open={checkoutOpen}
  checkoutUrl={checkoutUrl}
  planSlug={checkoutCart?.lines[0]?.pool ?? "vod"}
  kind="credits"
  title="תשלום מאובטח"
  amountIls={checkoutCart?.totalIls}
  onClose={() => {
    checkoutOpen = false;
    checkoutUrl = null;
    checkoutOrderId = null;
    checkoutCart = null;
  }}
>
  {#if checkoutCart}
    <ul class="credit-checkout-recap">
      {#each checkoutCart.lines as line (line.pool)}
        <li>
          <span>{poolLabels[line.pool]}</span>
          <span>{line.quantity} × {formatIls(line.unitEffectiveIls)} ₪</span>
          <strong>{formatIls(line.lineTotalIls)} ₪</strong>
        </li>
      {/each}
    </ul>
  {/if}
</CardcomCheckoutModal>
