<script lang="ts">
  import {
    experienceLabelMap as experienceLabels,
    equipmentLabelMap as equipmentLabels,
    goalLabelMap as goalLabels,
    fmtList,
  } from "$lib/labels";

  let {
    profile,
  }: {
    profile: {
      experience: string;
      equipment: string[];
      goals: string[];
      notes?: string | null;
    };
  } = $props();
</script>

<section class="profile-view" aria-label="פרטי פרופיל פילאטיס">
  <div class="profile-view__grid">
    <div class="profile-view__cell">
      <span class="profile-view__label">ניסיון בתרגול</span>
      <span class="profile-view__value">{experienceLabels[profile.experience] ?? profile.experience}</span>
    </div>
    <div class="profile-view__cell">
      <span class="profile-view__label">ציוד בבית</span>
      <span class="profile-view__value">{fmtList(profile.equipment, equipmentLabels)}</span>
    </div>
    <div class="profile-view__cell">
      <span class="profile-view__label">מטרות</span>
      <span class="profile-view__value">{fmtList(profile.goals, goalLabels)}</span>
    </div>
    {#if profile.notes && profile.notes.trim().length > 0}
      <div class="profile-view__cell profile-view__cell--wide">
        <span class="profile-view__label">הערות לתרגול</span>
        <p class="profile-view__notes">{profile.notes}</p>
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
    color: var(--muted);
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

  @media (max-width: 820px) {
    .profile-view__grid {
      grid-template-columns: 1fr;
    }
  }
</style>
