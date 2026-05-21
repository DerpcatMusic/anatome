<script lang="ts">
  import { useI18n } from '$lib/i18n/runes.svelte';
  import { goalOptions } from '$lib/labels';
  import Checkbox from '$components/ui/Checkbox.svelte';
  import Notice from '$components/ui/Notice.svelte';

  let {
    goals = $bindable(),
  }: {
    goals: string[];
  } = $props();

  const { t } = useI18n();

  function toggle<T extends string>(list: T[], value: T) {
    return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
  }
</script>

<div class="chips flex flex-wrap gap-3">
  {#each goalOptions as [value, label]}
    <div class="chip inline-flex items-center">
      <Checkbox checked={goals.includes(value)} onchange={() => goals = toggle(goals, value)}>
        <span>{label}</span>
      </Checkbox>
    </div>
  {/each}
</div>
{#if goals.length === 0}
  <Notice tone="neutral">{t.onboarding.goals.emptyWarning()}</Notice>
{/if}

<style>
  .chip {
    min-height: 48px;
    padding-inline: var(--space-5);
    font-size: var(--step-0);
  }
</style>
