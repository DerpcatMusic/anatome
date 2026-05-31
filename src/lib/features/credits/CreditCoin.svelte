<script lang="ts">
  import { Tooltip } from "bits-ui";
  import { useI18n } from "$lib/i18n/runes.svelte";
  import CreditDisc from "./CreditDisc.svelte";
  import type { CreditPool } from "./types";
  import "./credits.css";

  let {
    pool,
    balance,
    size = "sm",
    amountFirst = false,
  }: {
    pool: CreditPool;
    balance: number;
    size?: "sm" | "md";
    /** Number before disc (sidebar) */
    amountFirst?: boolean;
  } = $props();

  const { t } = useI18n();

  function makeCopy(title: string, hint: string, available: string) {
    return { title, hint, available };
  }
  function creditAvailableArgs(count: number) {
    return { count };
  }

  const copy = $derived.by(() => {
    switch (pool) {
      case "vod":
        return makeCopy(
          t.app.wallet.vod.title(),
          t.app.wallet.vod.hint(),
          t.app.wallet.vod.available(creditAvailableArgs(balance)),
        );
      case "live":
        return makeCopy(
          t.app.wallet.live.title(),
          t.app.wallet.live.hint(),
          t.app.wallet.live.available(creditAvailableArgs(balance)),
        );
      case "oneOnOne":
        return makeCopy(
          t.app.wallet.oneOnOne.title(),
          t.app.wallet.oneOnOne.hint(),
          t.app.wallet.oneOnOne.available(creditAvailableArgs(balance)),
        );
    }
  });

  const ariaLabel = $derived(`${copy.title}: ${copy.available}`);
  const discSize = $derived(size === "md" ? "md" : "sm");
</script>

<Tooltip.Root>
  <Tooltip.Trigger>
    {#snippet child({ props })}
      <button
        {...props}
        type="button"
        class="credit-coin credit-coin--{size}"
        class:credit-coin--amount-first={amountFirst}
        aria-label={ariaLabel}
      >
        {#if amountFirst}
          <span
            class="credit-coin__amount"
            class:credit-coin__amount--zero={balance === 0}
            aria-hidden="true"
          >
            {balance}
          </span>
          <CreditDisc {pool} size={discSize} />
        {:else}
          <CreditDisc {pool} size={discSize} />
          <span
            class="credit-coin__amount"
            class:credit-coin__amount--zero={balance === 0}
            aria-hidden="true"
          >
            {balance}
          </span>
        {/if}
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
