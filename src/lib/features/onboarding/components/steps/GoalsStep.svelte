<script lang="ts">
  import { useI18n } from '$lib/i18n/runes.svelte';
  import { goalOptions } from '$lib/labels';
  import { Checkbox } from "bits-ui";
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

<div class="goals-wrap">
  {#each goalOptions as [value, label]}
    <Checkbox.Root class="hb-choice goal-choice" checked={goals.includes(value)} onchange={() => goals = toggle(goals, value)}>
      <span>{label}</span>
    </Checkbox.Root>
  {/each}
</div>
{#if goals.length === 0}
  <Notice tone="neutral">{t.onboarding.goals.emptyWarning()}</Notice>
{/if}

<style>
  .goals-wrap {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
    min-width: 0;
  }
</style>
