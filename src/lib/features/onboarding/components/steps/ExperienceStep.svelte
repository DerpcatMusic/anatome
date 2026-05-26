<script lang="ts">
  import { useI18n } from '$lib/i18n/runes.svelte';
  import { RadioGroup } from "bits-ui";

  let {
    experience = $bindable(),
  }: {
    experience: "new" | "some" | "steady";
  } = $props();

  const { t } = useI18n();
  const options = $derived([
    { value: "new" as const, label: t.onboarding.experience.newTitle(), description: t.onboarding.experience.newDesc() },
    { value: "some" as const, label: t.onboarding.experience.someTitle(), description: t.onboarding.experience.someDesc() },
    { value: "steady" as const, label: t.onboarding.experience.steadyTitle(), description: t.onboarding.experience.steadyDesc() },
  ]);
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
