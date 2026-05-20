<script lang="ts">
  import { useI18n } from '$lib/i18n/runes.svelte';
  import { experienceOptions } from '$lib/labels';
  import RadioGroup from '$components/ui/RadioGroup.svelte';

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
  <RadioGroup bind:value={experience} {options} orientation="vertical" />
</div>

<style>
  .experience-options {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .experience-options :global(.hb-choice) {
    display: flex;
    flex-direction: column;
    padding: var(--space-5);
  }

  .experience-options :global(.hb-choice__title) {
    font-size: var(--step-1);
  }
</style>
