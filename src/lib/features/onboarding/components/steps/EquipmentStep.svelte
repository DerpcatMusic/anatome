<script lang="ts">
  import { useI18n } from '$lib/i18n/runes.svelte';
  import { equipmentOptions } from '$lib/labels';
  import EquipmentIcon from '$components/icons/EquipmentIcon.svelte';
  import Notice from '$components/ui/Notice.svelte';

  let {
    equipment = $bindable(),
  }: {
    equipment: string[];
  } = $props();

  const { t } = useI18n();

  function toggle<T extends string>(list: T[], value: T) {
    return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
  }
</script>

<div class="equip-grid">
  {#each equipmentOptions as [value, label]}
    <label class="equip-card" class:selected={equipment.includes(value)}>
      <input type="checkbox" checked={equipment.includes(value)} onchange={() => equipment = toggle(equipment, value)} />
      <EquipmentIcon name={value} />
      <span>{label}</span>
    </label>
  {/each}
</div>
{#if equipment.length === 0}
  <Notice tone="neutral">{t.onboarding.equipment.emptyWarning()}</Notice>
{/if}

<style>
  .equip-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--space-3);
  }

  .equip-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-5) var(--space-4);
    border: var(--border);
    background: var(--white);
    cursor: pointer;
    text-align: center;
    transition: background var(--duration-fast);
  }

  .equip-card:hover {
    background: var(--surface);
  }

  .equip-card.selected {
    background: var(--sky-soft);
    border-color: var(--line);
  }

  .equip-card input {
    position: absolute;
    opacity: 0;
  }

  .equip-card span {
    font-size: var(--step-0);
    font-weight: 600;
  }

  @media (max-width: 860px) {
    .equip-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
</style>
