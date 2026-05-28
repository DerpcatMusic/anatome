<script lang="ts">
  import { equipmentOptions, type Equipment } from "$lib/labels";
  import { Checkbox } from "bits-ui";
  import EquipmentIcon from "$components/icons/EquipmentIcon.svelte";

  let {
    selected = $bindable([]),
    readonly = false,
    disabled = false,
    label = "ציוד נדרש",
    compact = false,
    onchange,
  }: {
    selected: string[];
    readonly?: boolean;
    disabled?: boolean;
    label?: string;
    compact?: boolean;
    onchange?: (selected: string[]) => void;
  } = $props();

  function toggle(value: Equipment) {
    if (readonly || disabled) return;
    const next = selected.includes(value)
      ? selected.filter((v) => v !== value)
      : [...selected, value];
    selected = next;
    onchange?.(next);
  }
</script>

<div class="equipment-picker" class:equipment-picker--compact={compact}>
  {#if !compact}
    <p class="equipment-picker__label">{label}</p>
  {/if}
  <div class="equipment-grid" class:equipment-grid--compact={compact}>
    {#each equipmentOptions as [value, itemLabel]}
      <Checkbox.Root
        class="hb-choice"
        checked={selected.includes(value)}
        {readonly}
        {disabled}
        onCheckedChange={() => toggle(value)}
      >
        <div class="equipment-choice-content" class:equipment-choice-content--compact={compact}>
          <div class="icon-wrapper" class:icon-wrapper--compact={compact}>
            <EquipmentIcon name={value} />
          </div>
          <span class="choice-label" class:choice-label--compact={compact}>{itemLabel}</span>
        </div>
      </Checkbox.Root>
    {/each}
  </div>
</div>

<style>
  .equipment-picker {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .equipment-picker--compact {
    gap: var(--space-2);
  }

  .equipment-picker__label {
    font-weight: 800;
    font-size: var(--step-0);
  }

  .equipment-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
    gap: var(--space-2);
  }

  .equipment-grid--compact {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: var(--space-2);
    width: 100%;
  }

  .equipment-grid--compact :global(.hb-choice) {
    min-height: 48px;
    min-width: 0;
    padding: var(--space-2) var(--space-1);
    border-radius: 8px;
  }

  .equipment-choice-content {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    width: 100%;
    direction: rtl;
  }

  .equipment-choice-content--compact {
    flex-direction: column;
    justify-content: center;
    gap: 2px;
    padding: 0;
    text-align: center;
  }

  .icon-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    color: currentColor;
    flex-shrink: 0;
    width: 28px;
    height: 28px;
  }

  .icon-wrapper--compact {
    width: 18px;
    height: 18px;
  }

  .choice-label {
    font-size: var(--step--1);
    font-weight: 800;
    white-space: nowrap;
  }

  .choice-label--compact {
    font-size: 0.65rem;
    line-height: 1.15;
    white-space: normal;
    text-align: center;
    max-width: 100%;
  }

</style>
