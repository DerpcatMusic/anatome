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
  } from "$lib/features/onboarding/health-declaration";
  import { formatProfileTimestamp } from "$lib/features/dashboard/lib/format";
  import { useI18n } from "$lib/i18n/runes.svelte";

  type StaffProfile = {
    displayName?: string | null;
    credentials?: string | null;
    certificateDocument?: string | null;
    insuranceDocument?: string | null;
  };

  type CustomerProfile = {
    experience: string;
    equipment: string[];
    goals: string[];
    pathologies?: string[];
    notes?: string | null;
    healthDeclarationAnswers?: HealthDeclarationAnswers | Record<string, "yes" | "no">;
    healthDeclarationAcceptedAt?: number;
    healthInfoConsentAcceptedAt?: number;
  };

  let {
    isStaff,
    appProfile,
    profile,
    showEditLink = true,
  }: {
    isStaff: boolean;
    appProfile?: StaffProfile | null;
    profile?: CustomerProfile | null;
    showEditLink?: boolean;
  } = $props();

  const { t } = useI18n();

  const healthFlags = $derived(
    profile?.healthDeclarationAnswers
      ? healthDeclarationQuestionIds
          .filter((id) => profile?.healthDeclarationAnswers?.[id] === "yes")
          .map((id) => t.onboarding.healthDeclaration.questions[id]())
      : [],
  );
</script>

{#if isStaff && appProfile}
  <div class="profile-summary">
    <div class="profile-summary__header">
      <p class="profile-summary__kicker">{t.dashboard.staffProfile.title()}</p>
      {#if showEditLink}
        <a href="/i/profile" class="profile-summary__edit">{t.dashboard.profile.edit()}</a>
      {/if}
    </div>
    <div class="profile-summary__grid">
      <div class="profile-summary__cell">
        <span class="profile-summary__label">{t.dashboard.staffProfile.name()}</span>
        <span class="profile-summary__value">{appProfile.displayName || "—"}</span>
      </div>
      {#if appProfile.credentials}
        <div class="profile-summary__cell profile-summary__cell--wide">
          <span class="profile-summary__label">{t.dashboard.staffProfile.credentials()}</span>
          <span class="profile-summary__value">{appProfile.credentials}</span>
        </div>
      {/if}
    </div>

    <div class="compliance-bar">
      <div class="compliance-item" class:compliance--ok={appProfile.certificateDocument}>
        <span class="compliance-dot">{appProfile.certificateDocument ? "●" : "○"}</span>
        <span>{t.dashboard.staffProfile.certificate()}</span>
      </div>
      <div class="compliance-item" class:compliance--ok={appProfile.insuranceDocument}>
        <span class="compliance-dot">{appProfile.insuranceDocument ? "●" : "○"}</span>
        <span>{t.dashboard.staffProfile.insurance()}</span>
      </div>
    </div>
  </div>
{:else if !isStaff && profile}
  <div class="profile-summary">
    <div class="profile-summary__header">
      <p class="profile-summary__kicker">{t.dashboard.customerProfile.title()}</p>
      {#if showEditLink}
        <a href="/u/profile" class="profile-summary__edit">{t.dashboard.profile.edit()}</a>
      {/if}
    </div>

    <div class="profile-summary__grid">
      <div class="profile-summary__cell">
        <span class="profile-summary__label">{t.dashboard.profile.experience()}</span>
        <span class="profile-summary__value">{experienceLabel(profile.experience)}</span>
      </div>
      <div class="profile-summary__cell">
        <span class="profile-summary__label">{t.dashboard.profile.equipment()}</span>
        <span class="profile-summary__value">{fmtEquipmentList(profile.equipment)}</span>
      </div>
      <div class="profile-summary__cell">
        <span class="profile-summary__label">{t.dashboard.profile.goals()}</span>
        <span class="profile-summary__value">{profile.goals.map(goalLabel).join(", ")}</span>
      </div>
      {#if profile.pathologies && profile.pathologies.length > 0}
        <div class="profile-summary__cell profile-summary__cell--wide">
          <span class="profile-summary__label">{t.onboarding.summary.pathologies()}</span>
          <span class="profile-summary__value"
            >{profile.pathologies.map(pathologyLabel).join(", ")}</span
          >
        </div>
      {/if}
      {#if profile.notes && profile.notes.trim().length > 0}
        <div class="profile-summary__cell profile-summary__cell--wide">
          <span class="profile-summary__label">{t.dashboard.profile.notes()}</span>
          <span class="profile-summary__value">{profile.notes}</span>
        </div>
      {/if}
      {#if healthFlags.length > 0}
        <div class="profile-summary__cell profile-summary__cell--wide">
          <span class="profile-summary__label">{t.onboarding.summary.health()}</span>
          <ul class="profile-summary__health-flags">
            {#each healthFlags as flag (flag)}
              <li>{flag}</li>
            {/each}
          </ul>
        </div>
      {/if}
      {#if profile.healthDeclarationAcceptedAt}
        <div class="profile-summary__cell">
          <span class="profile-summary__label">{t.onboarding.summary.declaration()}</span>
          <span class="profile-summary__value"
            >{formatProfileTimestamp(profile.healthDeclarationAcceptedAt)}</span
          >
        </div>
      {/if}
      {#if profile.healthInfoConsentAcceptedAt}
        <div class="profile-summary__cell">
          <span class="profile-summary__label">{t.onboarding.summary.consent()}</span>
          <span class="profile-summary__value"
            >{formatProfileTimestamp(profile.healthInfoConsentAcceptedAt)}</span
          >
        </div>
      {/if}
    </div>
  </div>
{/if}

<style>
  .profile-summary {
    border: var(--border);
    padding: var(--space-4);
    background: var(--elevated);
  }

  .profile-summary__header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: var(--space-3);
    margin-bottom: var(--space-3);
  }

  .profile-summary__kicker {
    font-family: var(--font-mono);
    font-size: var(--step--1);
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--foreground-muted);
    font-weight: 700;
    margin: 0;
  }

  .profile-summary__edit {
    font-size: var(--step--1);
    font-weight: 700;
    color: var(--primary);
    text-decoration: none;
    transition: color var(--duration-fast);
  }

  .profile-summary__edit:hover { color: var(--ink); }

  .profile-summary__grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--space-3);
  }

  .profile-summary__cell {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }

  .profile-summary__cell--wide { grid-column: 1 / -1; }

  .profile-summary__label {
    font-size: var(--step--1);
    color: var(--foreground-muted);
  }

  .profile-summary__value {
    font-size: var(--step-1);
    font-weight: 700;
    line-height: 1.3;
  }

  .profile-summary__health-flags {
    margin: 0;
    padding-inline-start: var(--space-4);
    font-size: var(--step-0);
    line-height: 1.45;
    font-weight: 650;
  }

  .profile-summary__health-flags li + li {
    margin-top: var(--space-1);
  }

  .compliance-bar {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-3);
    margin-top: var(--space-3);
  }

  .compliance-item {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    font-family: var(--font-mono);
    font-size: var(--step--1);
    font-weight: 700;
    color: var(--foreground-muted);
  }

  .compliance-dot {
    font-size: var(--step-0);
    line-height: 1;
    color: var(--line-light);
  }

  .compliance--ok .compliance-dot {
    color: var(--success);
  }

  .compliance--ok {
    color: var(--ink);
  }

  @media (max-width: 820px) {
    .profile-summary__grid { grid-template-columns: 1fr; }
  }
</style>
