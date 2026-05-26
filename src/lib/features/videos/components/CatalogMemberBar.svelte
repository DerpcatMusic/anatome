<script lang="ts">
  import MacroflowCreditsBadge from "./MacroflowCreditsBadge.svelte";

  let {
    vodCredits = 0,
  }: {
    vodCredits?: number;
  } = $props();
</script>

<div class="catalog-member-bar">
  <a class="catalog-member-bar__home" href="/u/dashboard">אזור אישי</a>
  <MacroflowCreditsBadge balance={vodCredits} />
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
