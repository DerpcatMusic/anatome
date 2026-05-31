<script lang="ts">
  import { Button } from "bits-ui";
  import Notice from "$components/ui/Notice.svelte";
  import ExperienceStep from "./steps/ExperienceStep.svelte";
  import EquipmentStep from "./steps/EquipmentStep.svelte";
  import GoalsStep from "./steps/GoalsStep.svelte";
  import NotesStep from "./steps/NotesStep.svelte";
  import HealthDeclarationStep from "./steps/HealthDeclarationStep.svelte";
  import NameStep from "./steps/NameStep.svelte";
  import { useI18n } from "$lib/i18n/runes.svelte";
  import type { Equipment, Goal, Pathology } from "$lib/labels";
  import type { HealthDeclarationAnswers } from "$lib/features/onboarding/health-declaration";

  let {
    firstName = $bindable(),
    lastName = $bindable(),
    experience = $bindable(),
    equipment = $bindable(),
    goals = $bindable(),
    pathologies = $bindable(),
    notes = $bindable(),
    healthDeclarationAnswers = $bindable(),
    healthInfoConsent = $bindable(),
    healthDeclarationAccepted = $bindable(),
    nameComplete,
    healthComplete,
    healthConsentsComplete,
    needsHealthConsent,
    isMemberProfileUpdate,
    readyToSubmit,
    readyToSubmitProfileEdit,
    editValidationAttempted,
    error,
    pending,
    onSubmit,
  }: {
    firstName: string;
    lastName: string;
    experience: "new" | "some" | "steady";
    equipment: Equipment[];
    goals: Goal[];
    pathologies: Pathology[];
    notes: string;
    healthDeclarationAnswers: HealthDeclarationAnswers;
    healthInfoConsent: boolean;
    healthDeclarationAccepted: boolean;
    nameComplete: boolean;
    healthComplete: boolean;
    healthConsentsComplete: boolean;
    needsHealthConsent: boolean;
    isMemberProfileUpdate: boolean;
    readyToSubmit: boolean;
    readyToSubmitProfileEdit: boolean;
    editValidationAttempted: boolean;
    error: string;
    pending: boolean;
    onSubmit: (e: SubmitEvent) => void;
  } = $props();

  const { t } = useI18n();
</script>

<form class="profile-edit" onsubmit={onSubmit}>
  {#if error}
    <Notice tone="danger">{error}</Notice>
  {/if}

  {#if editValidationAttempted && !(isMemberProfileUpdate ? readyToSubmitProfileEdit : readyToSubmit)}
    <Notice tone="neutral">
      <p>לפני שמירה, יש להשלים:</p>
      <ul class="onboarding-missing-list">
        {#if !nameComplete}<li>שם מלא</li>{/if}
        {#if equipment.length === 0}<li>בחירת ציוד</li>{/if}
        {#if goals.length === 0}<li>בחירת מטרות</li>{/if}
        {#if !isMemberProfileUpdate && (!healthComplete || !healthConsentsComplete)}<li>הצהרת בריאות והסכמות</li>{/if}
      </ul>
    </Notice>
  {/if}

  <section class="profile-edit__section" aria-labelledby="profile-edit-name">
    <h2 id="profile-edit-name" class="profile-edit__title">{t.onboarding.name.title()}</h2>
    {#if t.onboarding.name.subtitle()}<p class="profile-edit__subtitle">{t.onboarding.name.subtitle()}</p>{/if}
    <NameStep bind:firstName bind:lastName showWarning={editValidationAttempted && !nameComplete} />
  </section>

  <section class="profile-edit__section" aria-labelledby="profile-edit-experience">
    <h2 id="profile-edit-experience" class="profile-edit__title">{t.onboarding.experience.title()}</h2>
    {#if t.onboarding.experience.subtitle()}<p class="profile-edit__subtitle">{t.onboarding.experience.subtitle()}</p>{/if}
    <ExperienceStep bind:experience />
  </section>

  <section class="profile-edit__section" aria-labelledby="profile-edit-equipment">
    <h2 id="profile-edit-equipment" class="profile-edit__title">{t.onboarding.equipment.title()}</h2>
    {#if t.onboarding.equipment.subtitle()}<p class="profile-edit__subtitle">{t.onboarding.equipment.subtitle()}</p>{/if}
    <EquipmentStep bind:equipment showWarning={editValidationAttempted && equipment.length === 0} />
  </section>

  <section class="profile-edit__section" aria-labelledby="profile-edit-goals">
    <h2 id="profile-edit-goals" class="profile-edit__title">{t.onboarding.goals.title()}</h2>
    {#if t.onboarding.goals.subtitle()}<p class="profile-edit__subtitle">{t.onboarding.goals.subtitle()}</p>{/if}
    <GoalsStep bind:goals showWarning={editValidationAttempted && goals.length === 0} />
  </section>

  <section class="profile-edit__section" aria-labelledby="profile-edit-notes">
    <h2 id="profile-edit-notes" class="profile-edit__title">{t.onboarding.notes.title()}</h2>
    {#if t.onboarding.notes.subtitle()}<p class="profile-edit__subtitle">{t.onboarding.notes.subtitle()}</p>{/if}
    <NotesStep bind:pathologies bind:notes />
  </section>

  {#if !isMemberProfileUpdate}
    <section class="profile-edit__section" aria-labelledby="profile-edit-health">
      <h2 id="profile-edit-health" class="profile-edit__title">{t.onboarding.healthDeclaration.title()}</h2>
      {#if t.onboarding.healthDeclaration.subtitle()}<p class="profile-edit__subtitle">{t.onboarding.healthDeclaration.subtitle()}</p>{/if}
      <HealthDeclarationStep
        bind:answers={healthDeclarationAnswers}
        bind:healthInfoConsent
        bind:healthDeclarationAccepted
        {needsHealthConsent}
        showValidation={editValidationAttempted && (!healthComplete || !healthConsentsComplete)}
      />
    </section>
  {/if}

  <div class="profile-edit__actions">
    <Button.Root class="hb-button hb-button--ink" type="submit" disabled={pending}>
      {pending ? t.onboarding.nav.submitPending() : t.onboarding.nav.submitEdit()}
    </Button.Root>
  </div>
</form>
