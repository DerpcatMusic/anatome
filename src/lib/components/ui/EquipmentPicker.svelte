<script lang="ts">
  import { equipmentOptions, type Equipment } from "$lib/labels";
  import Checkbox from "$components/ui/Checkbox.svelte";
  import EquipmentIcon from "$components/icons/EquipmentIcon.svelte";

  let {
    selected = $bindable([]),
    readonly = false,
    disabled = false,
    label = "ציוד לשיעור",
    onchange,
  }: {
    selected: string[];
    readonly?: boolean;
    disabled?: boolean;
    label?: string;
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

<div class="equipment-picker">
  <p class="equipment-picker__label">{label}</p>
  <div class="equipment-grid">
    {#each equipmentOptions as [value, itemLabel]}
      <Checkbox
        checked={selected.includes(value)}
        {readonly}
        {disabled}
        onchange={() => toggle(value)}
      >
        <div class="equipment-choice-content">
          <div class="icon-wrapper">
            <EquipmentIcon name={value} />
          </div>
          <span class="choice-label">{itemLabel}</span>
        </div>
      </Checkbox>
    {/each}
  </div>
</div>

<style>
  .equipment-picker {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
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

  .equipment-grid :global(.hb-choice) {
    min-height: 56px;
    padding: var(--space-2) var(--space-3);
  }

  .equipment-choice-content {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    width: 100%;
    direction: rtl;
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

  .icon-wrapper :global(svg) {
    width: 100%;
    height: 100%;
  }

  .choice-label {
    font-size: var(--step--1);
    font-weight: 800;
    white-space: nowrap;
  }
</style>
