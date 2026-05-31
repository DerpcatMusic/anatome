<script lang="ts">
  import WalletCreditStrip from "$lib/features/credits/WalletCreditStrip.svelte";

  let {
    vodCredits = 0,
  }: {
    vodCredits?: number;
  } = $props();

  function makeBalances(vodCredits: number) {
    return { vod: vodCredits, live: 0, oneOnOne: 0 };
  }

  const balances = $derived(makeBalances(vodCredits));
</script>

<div class="catalog-member-bar">
  <a class="catalog-member-bar__home" href="/u/dashboard">אזור אישי</a>
  <WalletCreditStrip balances={balances} pools={["vod"]} size="sm" layout="row" />
</div>

<style>
  .catalog-member-bar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-3);
    padding: var(--space-3) var(--space-4);
    border: var(--border);
    background: var(--white);
  }

  .catalog-member-bar__home {
    font-weight: 700;
    color: var(--ink);
    text-decoration: none;
  }

  .catalog-member-bar__home:hover {
    color: var(--primary);
  }

  .catalog-member-bar__home:focus-visible {
    outline: 2px solid var(--secondary);
    outline-offset: 3px;
  }
</style>
