<script lang="ts">
  import { useI18n } from '$lib/i18n/runes.svelte';
  import { goalOptions } from '$lib/labels';
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

<div class="chips">
  {#each goalOptions as [value, label]}
    <label class="chip" class:selected={goals.includes(value)}>
      <input type="checkbox" checked={goals.includes(value)} onchange={() => goals = toggle(goals, value)} />
      <span>{label}</span>
    </label>
  {/each}
</div>
{#if goals.length === 0}
  <Notice tone="neutral">{t.onboarding.goals.emptyWarning()}</Notice>
{/if}

<style>
  .chips {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-3);
  }

  .chip {
    cursor: pointer;
  }

  .chip input {
    position: absolute;
    opacity: 0;
  }

  .chip span {
    display: inline-flex;
    min-height: 48px;
    align-items: center;
    border: var(--border);
    background: var(--white);
    padding-inline: var(--space-5);
    font-size: var(--step-0);
    font-weight: 600;
    transition: background var(--duration-fast);
  }

  .chip:hover span {
    background: var(--surface);
  }

  .chip.selected span {
    background: var(--sky);
    border-color: var(--line);
  }
</style>
