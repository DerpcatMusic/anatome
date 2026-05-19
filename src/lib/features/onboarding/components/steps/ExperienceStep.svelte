<script lang="ts">
  import { useI18n } from '$lib/i18n/runes.svelte';
  import { experienceOptions } from '$lib/labels';

  let {
    experience = $bindable(),
  }: {
    experience: "new" | "some" | "steady";
  } = $props();

  const { t } = useI18n();
</script>

<div class="options">
  {#each experienceOptions as [val, title]}
    {@const desc = val === "new" ? t.onboarding.experience.newDesc() : val === "some" ? t.onboarding.experience.someDesc() : t.onboarding.experience.steadyDesc()}
    <label class="option" class:selected={experience === val}>
      <input type="radio" bind:group={experience} value={val} />
      <span class="option__title">{title}</span>
      <span class="option__desc">{desc}</span>
    </label>
  {/each}
</div>

<style>
  .options {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .option {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    padding: var(--space-5);
    border: var(--border);
    background: var(--white);
    cursor: pointer;
    transition: background var(--duration-fast);
  }

  .option:hover {
    background: var(--surface);
  }

  .option.selected {
    background: var(--sky-soft);
    border-color: var(--line);
  }

  .option input {
    position: absolute;
    opacity: 0;
  }

  .option__title {
    font-weight: 700;
    font-size: var(--step-1);
  }

  .option__desc {
    color: var(--muted);
    font-size: var(--step-0);
  }
</style>
