<script lang="ts">
  import { useI18n } from "$lib/i18n/runes.svelte";
  import { Button } from "bits-ui";
  import Notice from "$components/ui/Notice.svelte";
  import { useOnboardingForm } from "./useOnboardingForm.svelte";
  import OnboardingEditForm from "./OnboardingEditForm.svelte";
  import OnboardingWizard from "./OnboardingWizard.svelte";
  import type { OnboardingProfile } from "./useOnboardingForm.svelte";
  import "./OnboardingForm.css";

  let {
    redirectTo,
    initialProfile,
    initialDisplayName,
    mode = "onboarding",
    onSaved,
  }: {
    redirectTo?: string;
    initialDisplayName?: string | null;
    mode?: "onboarding" | "edit";
    onSaved?: () => void;
    initialProfile?: OnboardingProfile;
  } = $props();

  const { t } = useI18n();

  const form = useOnboardingForm(mode, initialProfile, initialDisplayName, redirectTo, onSaved);

  function handleFormSubmit(event: SubmitEvent) {
    event.preventDefault();
    void form.submit();
  }
</script>

{#if form.submitted}
  <div class="success">
    <div class="success-mark">✦</div>
    <h2>{mode === "edit" ? t.onboarding.success.editTitle() : t.onboarding.success.title()}</h2>
    <p>{mode === "edit" ? t.onboarding.success.editSubtitle() : t.onboarding.success.subtitle()}</p>
  </div>
{:else if mode === "edit"}
  <OnboardingEditForm
    bind:firstName={form.firstName}
    bind:lastName={form.lastName}
    bind:experience={form.experience}
    bind:equipment={form.equipment}
    bind:goals={form.goals}
    bind:pathologies={form.pathologies}
    bind:notes={form.notes}
    bind:healthDeclarationAnswers={form.healthDeclarationAnswers}
    bind:healthInfoConsent={form.healthInfoConsent}
    bind:healthDeclarationAccepted={form.healthDeclarationAccepted}
    nameComplete={form.nameComplete}
    healthComplete={form.healthComplete}
    healthConsentsComplete={form.healthConsentsComplete}
    needsHealthConsent={form.needsHealthConsent}
    isMemberProfileUpdate={form.isMemberProfileUpdate}
    readyToSubmit={form.readyToSubmit}
    readyToSubmitProfileEdit={form.readyToSubmitProfileEdit}
    editValidationAttempted={form.editValidationAttempted}
    error={form.error}
    pending={form.pending}
    onSubmit={handleFormSubmit}
  />
{:else}
  <OnboardingWizard
    {mode}
    steps={form.steps}
    bind:stepIndex={form.stepIndex}
    bind:firstName={form.firstName}
    bind:lastName={form.lastName}
    bind:experience={form.experience}
    bind:equipment={form.equipment}
    bind:goals={form.goals}
    bind:pathologies={form.pathologies}
    bind:notes={form.notes}
    bind:healthDeclarationAnswers={form.healthDeclarationAnswers}
    bind:healthInfoConsent={form.healthInfoConsent}
    bind:healthDeclarationAccepted={form.healthDeclarationAccepted}
    bind:nameWarning={form.nameWarning}
    bind:stepValidationAttempted={form.stepValidationAttempted}
    bind:error={form.error}
    pending={form.pending}
    onSubmit={form.submit}
  />
{/if}
