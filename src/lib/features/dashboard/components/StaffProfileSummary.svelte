<script lang="ts">
  import { useI18n } from "$lib/i18n/runes.svelte";

  type StaffProfile = {
    displayName?: string | null;
    credentials?: string | null;
    hasCertificate?: boolean;
    hasInsurance?: boolean;
  };

  interface Props {
    panelVariant?: "default" | "aside";
    showEditLink?: boolean;
    appProfile: StaffProfile;
  }

  let {
    panelVariant = "default",
    showEditLink = true,
    appProfile,
  }: Props = $props();

  const panelClass = $derived(
    panelVariant === "aside"
      ? "profile-summary dashboard-panel dashboard-panel--member-aside"
      : "profile-summary dashboard-panel",
  );

  const { t } = useI18n();
</script>

<section class={panelClass} aria-labelledby="staff-profile-title">
  <div class="dashboard-panel__head">
    <p id="staff-profile-title" class="dashboard-panel__kicker">
      {t.dashboard.staffProfile.title()}
    </p>
    {#if showEditLink}
      <a href="/i/dashboard?panel=account" class="dashboard-link dashboard-panel__edit">{t.dashboard.profile.edit()}</a>
    {/if}
  </div>

  <dl class="profile-summary__list" class:profile-summary__list--aside={panelVariant === "aside"}>
    <div class="profile-summary__row">
      <dt>{t.dashboard.staffProfile.name()}</dt>
      <dd>{appProfile?.displayName || "—"}</dd>
    </div>
    {#if appProfile?.credentials}
      <div class="profile-summary__row profile-summary__row--wide">
        <dt>{t.dashboard.staffProfile.credentials()}</dt>
        <dd>{appProfile.credentials}</dd>
      </div>
    {/if}
  </dl>

  <ul class="profile-summary__compliance" aria-label={t.dashboard.staffProfile.title()}>
    <li class:profile-summary__compliance--ok={appProfile?.hasCertificate}>
      <span class="profile-summary__compliance-dot" aria-hidden="true"
        >{appProfile?.hasCertificate ? "●" : "○"}</span
      >
      {t.dashboard.staffProfile.certificate()}
    </li>
    <li class:profile-summary__compliance--ok={appProfile?.hasInsurance}>
      <span class="profile-summary__compliance-dot" aria-hidden="true"
        >{appProfile?.hasInsurance ? "●" : "○"}</span
      >
      {t.dashboard.staffProfile.insurance()}
    </li>
  </ul>
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

  .profile-summary__compliance {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2) var(--space-3);
    margin: var(--space-3) 0 0;
    padding: 0;
    list-style: none;
  }

  .profile-summary__compliance li {
    display: flex;
    align-items: center;
    gap: var(--space-1);
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    font-weight: 700;
    color: var(--foreground-muted);
  }

  .profile-summary__compliance-dot {
    font-size: var(--text-sm);
    line-height: 1;
    color: var(--line-light);
  }

  .profile-summary__compliance--ok {
    color: var(--ink);
  }

  .profile-summary__compliance--ok .profile-summary__compliance-dot {
    color: var(--success);
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
