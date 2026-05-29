<script lang="ts">
  import type { FunctionReturnType } from "convex/server";
  import { api } from "$convex/_generated/api";
  import { useI18n } from "$lib/i18n/runes.svelte";
  import "../dashboard.css";

  type StaffProfile = NonNullable<
    FunctionReturnType<typeof api.users.dashboard.get>
  >["appProfile"];

  let { appProfile }: { appProfile: StaffProfile | null } = $props();

  const { t } = useI18n();

  const hasCertificate = $derived(Boolean(appProfile?.hasCertificate));
  const hasInsurance = $derived(Boolean(appProfile?.hasInsurance));
  const allOk = $derived(hasCertificate && hasInsurance);
</script>

{#if appProfile}
  <div
    class="compliance-bar"
    class:compliance-bar--ok={allOk}
    role="status"
    aria-label={t.dashboard.staffProfile.title()}
  >
    <p class="compliance-bar__lead">{t.dashboard.instructor.complianceLead()}</p>
    <ul class="compliance-bar__items">
      <li class:compliance-bar__item--ok={hasCertificate}>
        <span class="compliance-bar__dot" aria-hidden="true">{hasCertificate ? "●" : "○"}</span>
        {t.dashboard.staffProfile.certificate()}
      </li>
      <li class:compliance-bar__item--ok={hasInsurance}>
        <span class="compliance-bar__dot" aria-hidden="true">{hasInsurance ? "●" : "○"}</span>
        {t.dashboard.staffProfile.insurance()}
      </li>
    </ul>
    <a class="dashboard-link compliance-bar__edit" href="?panel=account">
      {t.dashboard.profile.edit()}
    </a>
  </div>
{/if}

<style>
  .compliance-bar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-2) var(--space-4);
    padding: var(--space-3) var(--space-4);
    border: var(--border);
    border-radius: var(--radius-md);
    background: color-mix(in oklch, var(--warning) 10%, var(--elevated));
    min-width: 0;
  }

  .compliance-bar--ok {
    background: color-mix(in oklch, var(--success) 8%, var(--elevated));
  }

  .compliance-bar__lead {
    margin: 0;
    font-size: var(--text-sm);
    font-weight: 700;
    color: var(--ink);
  }

  .compliance-bar__items {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2) var(--space-3);
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .compliance-bar__items li {
    display: flex;
    align-items: center;
    gap: var(--space-1);
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    font-weight: 700;
    color: var(--foreground-muted);
  }

  .compliance-bar__item--ok {
    color: var(--ink);
  }

  .compliance-bar__dot {
    color: var(--line-light);
  }

  .compliance-bar__item--ok .compliance-bar__dot {
    color: var(--success);
  }

  .compliance-bar__edit {
    margin-inline-start: auto;
  }

  @media (max-width: 520px) {
    .compliance-bar__edit {
      margin-inline-start: 0;
      width: 100%;
    }
  }
</style>
