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
      <Checkbox.Root class="hb-choice"
        checked={selected.includes(value)}
        {readonly}
        {disabled}
        onchange={() => toggle(value)}
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
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
    gap: var(--space-1);
  }

  .equipment-choice-content {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    width: 100%;
    direction: rtl;
  }

  .equipment-choice-content--compact {
    gap: var(--space-1);
    padding: var(--space-1) 0;
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
    width: 22px;
    height: 22px;
  }

  .choice-label {
    font-size: var(--step--1);
    font-weight: 800;
    white-space: nowrap;
  }

  .choice-label--compact {
    font-size: var(--step--2);
  }
</style>
