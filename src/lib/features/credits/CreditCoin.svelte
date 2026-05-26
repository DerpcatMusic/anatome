<script lang="ts">
  import { Tooltip } from "bits-ui";
  import { useI18n } from "$lib/i18n/runes.svelte";
  import CreditIconVod from "./icons/CreditIconVod.svelte";
  import CreditIconLive from "./icons/CreditIconLive.svelte";
  import CreditIconOneOnOne from "./icons/CreditIconOneOnOne.svelte";
  import type { CreditPool } from "./types";
  import "./credits.css";

  let {
    pool,
    balance,
    size = "sm",
    embedded = false,
    minimal = false,
  }: {
    pool: CreditPool;
    balance: number;
    size?: "sm" | "md";
    /** Row inside a shared pill — no per-row outer chrome */
    embedded?: boolean;
    /** Flat row for sidebar — no track shadow, compact disc */
    minimal?: boolean;
  } = $props();

  const { t } = useI18n();

  const copy = $derived.by(() => {
    switch (pool) {
      case "vod":
        return {
          title: t.app.wallet.vod.title(),
          hint: t.app.wallet.vod.hint(),
          available: t.app.wallet.vod.available({ count: balance }),
        };
      case "live":
        return {
          title: t.app.wallet.live.title(),
          hint: t.app.wallet.live.hint(),
          available: t.app.wallet.live.available({ count: balance }),
        };
      case "oneOnOne":
        return {
          title: t.app.wallet.oneOnOne.title(),
          hint: t.app.wallet.oneOnOne.hint(),
          available: t.app.wallet.oneOnOne.available({ count: balance }),
        };
    }
  });

  const ariaLabel = $derived(`${copy.title}: ${copy.available}`);
</script>

<Tooltip.Root>
  <Tooltip.Trigger>
    {#snippet child({ props })}
      <button
        {...props}
        type="button"
        class="credit-coin credit-coin--{size}"
        class:credit-coin--embedded={embedded}
        class:credit-coin--minimal={minimal}
        data-pool={pool}
        aria-label={ariaLabel}
      >
        <span class="credit-coin__disc" aria-hidden="true">
          {#if pool === "vod"}
            <CreditIconVod />
          {:else if pool === "live"}
            <CreditIconLive />
          {:else}
            <CreditIconOneOnOne />
          {/if}
        </span>
        <span
          class="credit-coin__amount"
          class:credit-coin__amount--zero={balance === 0}
          aria-hidden="true"
        >
          {balance}
        </span>
      </button>
    {/snippet}
  </Tooltip.Trigger>
  <Tooltip.Portal>
    <Tooltip.Content class="hb-tooltip-content credit-coin__tooltip" side="top" sideOffset={6}>
      <span class="credit-coin__tooltip-title">{copy.title}</span>
      <span class="credit-coin__tooltip-hint">{copy.hint}</span>
    </Tooltip.Content>
  </Tooltip.Portal>
</Tooltip.Root>
