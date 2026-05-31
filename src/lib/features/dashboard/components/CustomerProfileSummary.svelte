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

  interface Props {
    panelVariant?: "default" | "aside";
    showEditLink?: boolean;
    profile: CustomerProfile;
  }

  let {
    panelVariant = "default",
    showEditLink = true,
    profile,
  }: Props = $props();

  const panelClass = $derived(
    panelVariant === "aside"
      ? "profile-summary dashboard-panel dashboard-panel--member-aside"
      : "profile-summary dashboard-panel",
  );

  const { t } = useI18n();

  const EMPTY_ARRAY: string[] = [];

  type HealthId = (typeof healthDeclarationQuestionIds)[number];

  function isHealthYes(id: HealthId, answers?: CustomerProfile["healthDeclarationAnswers"]) {
    return answers?.[id] === "yes";
  }
  function healthQuestionLabel(id: HealthId) {
    return t.onboarding.healthDeclaration.questions[id]();
  }

  function shouldShowHealthFlag(id: HealthId, answers?: CustomerProfile["healthDeclarationAnswers"]) {
    return isHealthYes(id, answers);
  }
  function buildHealthFlags(
    answers: NonNullable<CustomerProfile["healthDeclarationAnswers"]>,
    questionIds: typeof healthDeclarationQuestionIds,
  ): string[] {
    return questionIds
      .filter((id) => shouldShowHealthFlag(id, answers))
      .map(healthQuestionLabel);
  }

  const healthFlags = $derived(
    profile?.healthDeclarationAnswers
      ? buildHealthFlags(profile.healthDeclarationAnswers, healthDeclarationQuestionIds)
      : EMPTY_ARRAY,
  );

  function buildProfileMeta(
    profile: CustomerProfile | null | undefined,
    declaration: string,
    consent: string,
  ): string | null {
    if (!profile) return null;
    const parts: string[] = [];
    if (profile.healthDeclarationAcceptedAt) {
      parts.push(
        `${declaration} ${formatProfileTimestamp(profile.healthDeclarationAcceptedAt)}`,
      );
    }
    if (profile.healthInfoConsentAcceptedAt) {
      parts.push(
        `${consent} ${formatProfileTimestamp(profile.healthInfoConsentAcceptedAt)}`,
      );
    }
    return parts.length > 0 ? parts.join(" · ") : null;
  }

  const profileMeta = $derived(
    buildProfileMeta(
      profile,
      t.onboarding.summary.declaration(),
      t.onboarding.summary.consent(),
    ),
  );
</script>

<section class={panelClass} aria-labelledby="customer-profile-title">
  <div class="dashboard-panel__head">
    <p id="customer-profile-title" class="dashboard-panel__kicker">
      {t.dashboard.customerProfile.title()}
    </p>
    {#if showEditLink}
      <a href="/u/dashboard?panel=account&edit=1" class="dashboard-link dashboard-panel__edit">{t.dashboard.profile.edit()}</a>
    {/if}
  </div>

  <dl class="profile-summary__list" class:profile-summary__list--aside={panelVariant === "aside"}>
    <div class="profile-summary__row">
      <dt>{t.dashboard.profile.experience()}</dt>
      <dd>{experienceLabel(profile!.experience)}</dd>
    </div>
    <div class="profile-summary__row">
      <dt>{t.dashboard.profile.equipment()}</dt>
      <dd>{fmtEquipmentList(profile?.equipment ?? [])}</dd>
    </div>
    <div class="profile-summary__row profile-summary__row--wide">
      <dt>{t.dashboard.profile.goals()}</dt>
      <dd>
        <ul class="profile-summary__tags" role="list">
          {#each profile?.goals ?? [] as goal (goal)}
            <li>{goalLabel(goal)}</li>
          {/each}
        </ul>
      </dd>
    </div>
    {#if profile?.pathologies && profile.pathologies.length > 0}
      <div class="profile-summary__row profile-summary__row--wide">
        <dt>{t.onboarding.summary.pathologies()}</dt>
        <dd>
          <ul class="profile-summary__tags profile-summary__tags--muted" role="list">
            {#each profile.pathologies as pathology (pathology)}
              <li>{pathologyLabel(pathology)}</li>
            {/each}
          </ul>
        </dd>
      </div>
    {/if}
    {#if profile?.notes && profile.notes.trim().length > 0}
      <div class="profile-summary__row profile-summary__row--wide">
        <dt>{t.dashboard.profile.notes()}</dt>
        <dd class="profile-summary__notes">{profile.notes}</dd>
      </div>
    {/if}
    {#if healthFlags.length > 0}
      <div class="profile-summary__row profile-summary__row--wide">
        <dt>{t.onboarding.summary.health()}</dt>
        <dd>
          <ul class="profile-summary__tags profile-summary__tags--health" role="list">
            {#each healthFlags as flag (flag)}
              <li>{flag}</li>
            {/each}
          </ul>
        </dd>
      </div>
    {/if}
  </dl>

  {#if profileMeta}
    <p class="profile-summary__meta">{profileMeta}</p>
  {/if}
</section>

<style>
  .profile-summary__list {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--space-3);
    margin: 0;
  }

  .profile-summary__row {
    display: grid;
    gap: var(--space-1);
    min-width: 0;
  }

  .profile-summary__row--wide {
    grid-column: 1 / -1;
  }

  .profile-summary__row dt {
    margin: 0;
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--foreground-muted);
  }

  .profile-summary__row dd {
    margin: 0;
    font-size: var(--text-base);
    font-weight: 600;
    line-height: var(--leading-snug);
    min-width: 0;
  }

  .profile-summary__tags {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-1);
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .profile-summary__tags li {
    padding: 0.12rem var(--space-2);
    border-radius: var(--radius-pill);
    font-size: var(--text-xs);
    font-weight: 600;
    line-height: var(--leading-snug);
    background: color-mix(in oklch, var(--secondary) 12%, var(--elevated));
    color: var(--ink);
  }

  .profile-summary__tags--muted li {
    background: color-mix(in oklch, var(--foreground) 6%, var(--elevated));
    color: var(--foreground-muted);
  }

  .profile-summary__tags--health li {
    background: color-mix(in oklch, var(--warning) 14%, var(--elevated));
    color: var(--ink-secondary);
  }

  .profile-summary__notes {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    font-size: var(--text-sm);
    font-weight: 500;
    color: var(--foreground-muted);
    line-height: var(--leading-normal);
    white-space: pre-wrap;
  }

  .profile-summary__meta {
    margin: var(--space-3) 0 0;
    padding-top: var(--space-2);
    border-top: 1px solid color-mix(in oklch, var(--foreground) 8%, transparent);
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    line-height: var(--leading-snug);
    color: var(--foreground-muted);
  }

  @media (max-width: 820px) {
    .profile-summary__list {
      grid-template-columns: 1fr;
    }
  }

  .profile-summary__list--aside {
    grid-template-columns: 1fr;
    gap: var(--space-2);
  }

  .profile-summary__list--aside .profile-summary__row dd {
    font-size: var(--text-sm);
  }
</style>
