<script lang="ts">
  let {
    displayName,
    credentials,
    certificateDocument,
    insuranceDocument,
  }: {
    displayName?: string | null;
    credentials?: string | null;
    certificateDocument?: string | null;
    insuranceDocument?: string | null;
  } = $props();
</script>

<section class="profile-view" aria-label="פרטי פרופיל מדריכה">
  <div class="profile-view__grid">
    <div class="profile-view__cell">
      <span class="profile-view__label">שם מלא</span>
      <span class="profile-view__value">{displayName?.trim() || "—"}</span>
    </div>
    {#if credentials && credentials.trim().length > 0}
      <div class="profile-view__cell profile-view__cell--wide">
        <span class="profile-view__label">הכשרות וניסיון</span>
        <p class="profile-view__notes">{credentials}</p>
      </div>
    {/if}
  </div>

  <div class="compliance-bar" aria-label="מסמכים משפטיים">
    <div class="compliance-item" class:compliance--ok={certificateDocument}>
      <span class="compliance-dot" aria-hidden="true">{certificateDocument ? "●" : "○"}</span>
      <span>תעודת הכשרה {certificateDocument ? "הועלתה" : "חסרה"}</span>
    </div>
    <div class="compliance-item" class:compliance--ok={insuranceDocument}>
      <span class="compliance-dot" aria-hidden="true">{insuranceDocument ? "●" : "○"}</span>
      <span>ביטוח אחריות {insuranceDocument ? "הועלה" : "חסר"}</span>
    </div>
  </div>
</section>

<style>
  .profile-view {
    border: var(--border);
    padding: var(--space-6);
    background: linear-gradient(135deg, var(--white), var(--surface));
    display: grid;
    gap: var(--space-5);
  }

  .profile-view__grid {
    display: grid;
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

  .compliance-bar {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-4);
    padding-top: var(--space-4);
    border-top: var(--border);
  }

  .compliance-item {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    font-family: var(--font-mono);
    font-size: var(--step--1);
    font-weight: 700;
    color: var(--muted);
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
</style>
