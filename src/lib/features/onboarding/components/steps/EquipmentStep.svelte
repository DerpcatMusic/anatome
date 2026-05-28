<script lang="ts">
  import { useI18n } from '$lib/i18n/runes.svelte';
  import { equipmentOptions } from '$lib/labels';
  import EquipmentIcon from '$components/icons/EquipmentIcon.svelte';
  import { Checkbox } from "bits-ui";
  import Notice from '$components/ui/Notice.svelte';

  let {
    equipment = $bindable(),
    showWarning = false,
  }: {
    equipment: string[];
    showWarning?: boolean;
  } = $props();

  const { t } = useI18n();

  function toggle<T extends string>(list: T[], value: T) {
    return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
  }
</script>

<div class="equip-grid">
  {#each equipmentOptions as [value, label] (value)}
    <Checkbox.Root
      class="hb-choice equip-choice"
      checked={equipment.includes(value)}
      onCheckedChange={() => {
        equipment = toggle(equipment, value);
      }}
    >
      <EquipmentIcon name={value} />
      <span>{label}</span>
    </Checkbox.Root>
  {/each}
</div>
{#if equipment.length === 0 && showWarning}
  <Notice tone="neutral">{t.onboarding.equipment.emptyWarning()}</Notice>
{/if}

<style>
  .equip-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--space-3);
  }

  @media (max-width: 860px) {
    .equip-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
</style>
