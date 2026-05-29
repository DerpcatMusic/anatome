<script lang="ts">
  import type { FunctionReturnType } from "convex/server";
  import { api } from "$convex/_generated/api";
  import WalletCreditStrip from "$lib/features/credits/WalletCreditStrip.svelte";
  import { walletBalances } from "$lib/features/credits/balances";
  import { poolsForSidebar } from "$lib/features/credits/pools-for-context";
  import { useI18n } from "$lib/i18n/runes.svelte";
  import "../dashboard.css";

  type DashboardData = NonNullable<FunctionReturnType<typeof api.users.dashboard.get>>;

  let {
    wallet,
    subscriptionPlan,
  }: {
    wallet?: DashboardData["wallet"];
    subscriptionPlan?: DashboardData["subscriptionPlan"];
  } = $props();

  const { t } = useI18n();
  const balances = $derived(walletBalances(wallet ?? null));
  const planLabel = $derived(subscriptionPlan?.nameHe ?? "גישה חינמית");
</script>

<section class="wallet-aside dashboard-panel dashboard-panel--member-aside" aria-labelledby="wallet-aside-title">
  <div class="wallet-aside__head">
    <h2 id="wallet-aside-title" class="wallet-aside__title">{t.dashboard.member.walletTitle()}</h2>
    <a class="dashboard-link" href="/u/credits">{t.dashboard.member.buyCredits()}</a>
  </div>

  <WalletCreditStrip balances={balances} pools={poolsForSidebar()} layout="stack" size="md" />

  <a class="wallet-aside__plan-link" href="?panel=account#dashboard-subscription">
    <span class="wallet-aside__plan-label">{t.dashboard.nav.subscription()}</span>
    <span class="wallet-aside__plan-name">{planLabel}</span>
  </a>
</section>

<style>
  .wallet-aside {
    display: grid;
    gap: var(--space-3);
    min-width: 0;
  }

  .wallet-aside__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-2);
    min-width: 0;
  }

  .wallet-aside__title {
    margin: 0;
    font-size: var(--text-base);
    font-weight: 700;
    line-height: var(--leading-snug);
  }

  .wallet-aside__plan-link {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-3);
    border: var(--border);
    border-radius: var(--radius-md);
    background: var(--surface);
    text-decoration: none;
    color: inherit;
    transition: background var(--duration-fast) var(--ease-out);
  }

  .wallet-aside__plan-link:hover {
    background: color-mix(in oklch, var(--accent) 8%, var(--surface));
  }

  .wallet-aside__plan-link:focus-visible {
    outline: 2px solid var(--primary);
    outline-offset: 2px;
  }

  .wallet-aside__plan-label {
    font-size: var(--text-xs);
    color: var(--foreground-muted);
    font-weight: 600;
  }

  .wallet-aside__plan-name {
    font-size: var(--text-sm);
    font-weight: 700;
    color: var(--primary);
  }
</style>
