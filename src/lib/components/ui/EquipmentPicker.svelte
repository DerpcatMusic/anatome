<script lang="ts">
  import { equipmentOptions, type Equipment } from "$lib/labels";

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
      <label
        class:selected={selected.includes(value)}
        class:readonly
      >
        <input
          type="checkbox"
          checked={selected.includes(value)}
          onchange={() => toggle(value)}
          {disabled}
        />
        <span>{itemLabel}</span>
      </label>
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
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: var(--space-2);
  }

  .equipment-grid label {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    border: var(--border);
    padding: var(--space-3);
    cursor: pointer;
    background: var(--white);
    font-weight: 600;
  }

  .equipment-grid label.selected {
    background: var(--sky);
  }

  .equipment-grid label.readonly {
    cursor: default;
  }

  .equipment-grid input {
    position: absolute;
    opacity: 0;
  }
</style>
