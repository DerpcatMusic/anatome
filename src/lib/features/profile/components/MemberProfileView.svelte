<script lang="ts">
  import {
    experienceLabel,
    fmtEquipmentList,
    goalLabel,
    pathologyLabel,
  } from "$lib/labels";
  import {
    healthDeclarationQuestionIds,
    type HealthDeclarationAnswers,
  } from "$features/onboarding/health-declaration";
  import { formatProfileTimestamp } from "$lib/features/dashboard/lib/format";
  import { useI18n } from "$lib/i18n/runes.svelte";

  const { t } = useI18n();

  let {
    profile,
  }: {
    profile: {
      experience: string;
      equipment: string[];
      goals: string[];
      pathologies?: string[];
      notes?: string | null;
      healthDeclarationAnswers?: HealthDeclarationAnswers | Record<string, "yes" | "no">;
      healthDeclarationAcceptedAt?: number;
      healthInfoConsentAcceptedAt?: number;
    };
  } = $props();

  const healthFlags = $derived(
    profile.healthDeclarationAnswers
      ? healthDeclarationQuestionIds
          .filter((id) => profile.healthDeclarationAnswers?.[id] === "yes")
          .map((id) => t.onboarding.healthDeclaration.questions[id]())
      : [],
  );
</script>

<section class="profile-view" aria-label="פרטי פרופיל פילאטיס">
  <div class="profile-view__grid">
    <div class="profile-view__cell">
      <span class="profile-view__label">ניסיון בתרגול</span>
      <span class="profile-view__value">{experienceLabel(profile.experience)}</span>
    </div>
    <div class="profile-view__cell">
      <span class="profile-view__label">ציוד בבית</span>
      <span class="profile-view__value">{fmtEquipmentList(profile.equipment)}</span>
    </div>
    <div class="profile-view__cell">
      <span class="profile-view__label">מטרות</span>
      <span class="profile-view__value">{profile.goals.map(goalLabel).join(", ")}</span>
    </div>
    {#if profile.pathologies && profile.pathologies.length > 0}
      <div class="profile-view__cell profile-view__cell--wide">
        <span class="profile-view__label">פתולוגיות</span>
        <span class="profile-view__value">{profile.pathologies.map(pathologyLabel).join(", ")}</span>
      </div>
    {/if}
    {#if profile.notes && profile.notes.trim().length > 0}
      <div class="profile-view__cell profile-view__cell--wide">
        <span class="profile-view__label">הערות לתרגול</span>
        <p class="profile-view__notes">{profile.notes}</p>
      </div>
    {/if}
    {#if healthFlags.length > 0}
      <div class="profile-view__cell profile-view__cell--wide">
        <span class="profile-view__label">הצהרת בריאות — תשובות «כן»</span>
        <ul class="profile-view__health-flags">
          {#each healthFlags as flag (flag)}
            <li>{flag}</li>
          {/each}
        </ul>
      </div>
    {/if}
    {#if profile.healthDeclarationAcceptedAt}
      <div class="profile-view__cell">
        <span class="profile-view__label">{t.onboarding.summary.declaration()}</span>
        <span class="profile-view__value"
          >{formatProfileTimestamp(profile.healthDeclarationAcceptedAt)}</span
        >
      </div>
    {/if}
    {#if profile.healthInfoConsentAcceptedAt}
      <div class="profile-view__cell">
        <span class="profile-view__label">{t.onboarding.summary.consent()}</span>
        <span class="profile-view__value"
          >{formatProfileTimestamp(profile.healthInfoConsentAcceptedAt)}</span
        >
      </div>
    {/if}
  </div>
</section>

<style>
  .profile-view {
    border: var(--border);
    padding: var(--space-6);
    background: var(--elevated);
  }

  .profile-view__grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: var(--space-5);
  }

  .profile-view__cell {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    min-width: 0;
  }

  .profile-view__cell--wide {
    grid-column: 1 / -1;
  }

  .profile-view__label {
    font-family: var(--font-mono);
    font-size: var(--step--1);
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--foreground-muted);
  }

  .profile-view__value {
    font-size: var(--step-1);
    font-weight: 700;
    line-height: 1.35;
  }

  .profile-view__notes {
    margin: 0;
    font-size: var(--step-0);
    line-height: 1.55;
    color: var(--ink);
    white-space: pre-wrap;
  }

  .profile-view__health-flags {
    margin: 0;
    padding-inline-start: var(--space-5);
    font-size: var(--step-0);
    line-height: 1.5;
    color: var(--ink);
  }

  .profile-view__health-flags li + li {
    margin-top: var(--space-2);
  }

  @media (max-width: 820px) {
    .profile-view__grid {
      grid-template-columns: 1fr;
    }
  }
</style>
