<script lang="ts">
  import { useI18n } from "$lib/i18n/runes.svelte";
  import Notice from "$components/ui/Notice.svelte";

  let {
    firstName = $bindable(),
    lastName = $bindable(),
    showWarning = false,
  }: {
    firstName: string;
    lastName: string;
    showWarning?: boolean;
  } = $props();

  const { t } = useI18n();
</script>

<div class="name-step">
  <label class="hb-input-field">
    <span class="hb-field__label">{t.onboarding.name.firstNameLabel()}</span>
    <input
      class="hb-input"
      type="text"
      name="given-name"
      autocomplete="given-name"
      required
      bind:value={firstName}
      placeholder={t.onboarding.name.firstNamePlaceholder()}
    />
  </label>

  <label class="hb-input-field">
    <span class="hb-field__label">{t.onboarding.name.lastNameLabel()}</span>
    <input
      class="hb-input"
      type="text"
      name="family-name"
      autocomplete="family-name"
      required
      bind:value={lastName}
      placeholder={t.onboarding.name.lastNamePlaceholder()}
    />
  </label>

  {#if showWarning}
    <Notice tone="neutral">{t.onboarding.name.emptyWarning()}</Notice>
  {/if}
</div>

<style>
  .name-step {
    display: flex;
    flex-direction: column;
    gap: var(--space-5);
    max-width: 28rem;
  }
</style>
