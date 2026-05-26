<script lang="ts">
  import { useI18n } from '$lib/i18n/runes.svelte';
  import { experienceOptions } from '$lib/labels';
  import { RadioGroup } from "bits-ui";

  let {
    experience = $bindable(),
  }: {
    experience: "new" | "some" | "steady";
  } = $props();

  const { t } = useI18n();
  const options = $derived(experienceOptions.map(([val, title]) => ({
    value: val,
    label: title,
    description: val === "new" ? t.onboarding.experience.newDesc() : val === "some" ? t.onboarding.experience.someDesc() : t.onboarding.experience.steadyDesc(),
  })));
</script>

<div class="experience-options">
  <RadioGroup.Root bind:value={experience} orientation="vertical">
    {#each options as option}
      <RadioGroup.Item value={option.value} class="hb-choice experience-choice">
        {#snippet children({ checked })}
          <span class="hb-choice__title">{option.label}</span>
          {#if option.description}
            <span class="hb-choice__description">{option.description}</span>
          {/if}
        {/snippet}
      </RadioGroup.Item>
    {/each}
  </RadioGroup.Root>
</div>

<style>
  .experience-options {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }
</style>
