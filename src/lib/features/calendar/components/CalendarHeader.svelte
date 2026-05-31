<script lang="ts">
  import { Button, ToggleGroup } from "bits-ui";
  import CreditCostTooltip from "$lib/features/credits/CreditCostTooltip.svelte";
  import type { TypeFilter } from "../lib/agenda";

  interface Props {
    typeFilter: TypeFilter;
    showOneOnOneRequest: boolean;
    hasOneOnOneCredits: boolean;
    oneOnOneCreditBalance: number;
    onTypeFilterChange: (next: TypeFilter) => void;
    onOpenOneOnOneModal: () => void;
  }

  let {
    typeFilter,
    showOneOnOneRequest,
    hasOneOnOneCredits,
    oneOnOneCreditBalance,
    onTypeFilterChange,
    onOpenOneOnOneModal,
  }: Props = $props();

  function handleTypeFilterChange(v: string) {
    if (v === "all" || v === "group_live" || v === "one_on_one") {
      onTypeFilterChange(v as TypeFilter);
    }
  }
</script>

<div class="calendar-header-actions">
  <ToggleGroup.Root
    type="single"
    value={typeFilter}
    onValueChange={handleTypeFilterChange}
    class="calendar-filter"
    aria-label="סינון לפי סוג שיעור"
  >
    <ToggleGroup.Item value="all" class="calendar-filter__item">הכל</ToggleGroup.Item>
    <ToggleGroup.Item value="group_live" class="calendar-filter__item">קבוצתי</ToggleGroup.Item>
    <ToggleGroup.Item
      value="one_on_one"
      class="calendar-filter__item"
      disabled={showOneOnOneRequest && !hasOneOnOneCredits}
    >
      1:1
    </ToggleGroup.Item>
  </ToggleGroup.Root>

  {#if showOneOnOneRequest}
    <CreditCostTooltip
      cost={1}
      balance={oneOnOneCreditBalance}
      pool="oneOnOne"
      enabled={hasOneOnOneCredits}
    >
      {#snippet child({ props })}
        <Button.Root
          {...props}
          class="hb-button hb-button--primary hb-button--sm"
          type="button"
          disabled={!hasOneOnOneCredits}
          title={hasOneOnOneCredits ? "בקשת שיעור אישי" : "אין קרדיט 1:1 זמין"}
          onclick={onOpenOneOnOneModal}
        >
          בקשת 1:1
        </Button.Root>
      {/snippet}
    </CreditCostTooltip>
  {/if}
</div>

<style>
  .calendar-header-actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-2);
  }

  :global(.calendar-filter) {
    display: inline-flex;
    gap: var(--space-1);
    flex-wrap: wrap;
  }

  :global(.calendar-filter__item) {
    min-height: 36px;
    padding: var(--space-1) var(--space-3);
    border: var(--border);
    background: var(--elevated);
    font: inherit;
    font-weight: 800;
    font-size: var(--step--1);
    cursor: pointer;
    border-radius: 4px;
    transition:
      background 0.15s ease,
      border-color 0.15s ease;
  }

  :global(.calendar-filter__item[data-disabled]) {
    opacity: 0.45;
    cursor: not-allowed;
  }

  :global(.calendar-filter__item[data-state="on"]) {
    background: var(--ink);
    color: var(--paper);
    border-color: var(--ink);
  }

  :global(.calendar-filter__item[data-state="on"][data-value="one_on_one"]) {
    background: var(--primary);
    border-color: var(--primary);
    color: var(--paper);
  }
</style>
