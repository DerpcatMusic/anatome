<script lang="ts">
  import type { FunctionReturnType } from "convex/server";
  import { api } from "../../../convex/_generated/api";
  import {
    experienceLabelMap as experienceLabels,
    equipmentLabelMap as equipmentLabels,
    goalLabelMap as goalLabels,
  } from "../../lib/labels";
  import AppLayout from "./AppLayout.svelte";
  import PageShell from "./PageShell.svelte";
  import { setCachedRole } from "../../lib/auth/session.svelte";

  type DashboardData = NonNullable<FunctionReturnType<typeof api.users.dashboard>>;

  let { profile, liveAlert, role, appProfile }: {
    profile: DashboardData["profile"];
    liveAlert: DashboardData["liveAlert"];
    role?: "customer" | "instructor" | "admin" | null;
    appProfile: DashboardData["appProfile"];
  } = $props();

  const isStaff = $derived(role === "instructor" || role === "admin");

  $effect(() => { if (role) setCachedRole(role); });

  function fmtList(arr: string[], labels: Record<string, string>) {
    return arr.map(v => labels[v] ?? v).filter(Boolean).join(", ") || "—";
  }
</script>

<AppLayout {role}>
  <PageShell
    title={isStaff ? "סטודיו" : "האזור האישי"}
    kicker="HomeBody"
    description={isStaff
      ? "אזור הניהול שלך. כאן מופיעים הלייבים, הוידאו והסטטיסטיקות."
      : "האזור האישי שלך מוכן. כאן יופיעו השיעורים, הלייבים והקרדיטים שלך."}
  >
    {#if liveAlert}
    <a class="live-alert" href={`/live-room?classId=${liveAlert.liveClassId}`}>
      <span class="live-alert__pulse"></span>
      <span>
        <strong>לייב פתוח עכשיו</strong>
        <small>{liveAlert.title}</small>
      </span>
    </a>
  {/if}

  {#if isStaff}
    <!-- Instructor dashboard -->
    {#if appProfile}
      <div class="profile-summary">
        <div class="profile-summary__header">
          <p class="profile-summary__kicker">פרופיל מדריכה</p>
          <a href="/profile" class="profile-summary__edit">ערוך</a>
        </div>
        <div class="profile-summary__grid">
          <div class="profile-summary__cell">
            <span class="profile-summary__label">שם</span>
            <span class="profile-summary__value">{appProfile.displayName || "—"}</span>
          </div>
          {#if appProfile.credentials}
            <div class="profile-summary__cell profile-summary__cell--wide">
              <span class="profile-summary__label">הכשרות וביטוח</span>
              <span class="profile-summary__value">{appProfile.credentials}</span>
            </div>
          {/if}
        </div>

        <!-- Compliance status -->
        <div class="compliance-bar">
          <div class="compliance-item" class:compliance--ok={appProfile.certificateDocument}>
            <span class="compliance-dot">{appProfile.certificateDocument ? "●" : "○"}</span>
            <span>תעודת הכשרה</span>
          </div>
          <div class="compliance-item" class:compliance--ok={appProfile.insuranceDocument}>
            <span class="compliance-dot">{appProfile.insuranceDocument ? "●" : "○"}</span>
            <span>ביטוח אחריות</span>
          </div>
        </div>
      </div>
    {/if}

    <div class="instructor-actions">
      <a class="action-card" href="/live">
        <span class="action-card__num">01</span>
        <h3>סטודיו לייב</h3>
        <p>תזמון שיעורים, פתיחת חדר, ניהול משתתפות</p>
      </a>
      <a class="action-card" href="/videos">
        <span class="action-card__num">02</span>
        <h3>ניהול וידאו</h3>
        <p>העלאת שיעורים, פרסום, ארכיון</p>
      </a>
      <a class="action-card" href="/calendar">
        <span class="action-card__num">03</span>
        <h3>לוח לייבים</h3>
        <p>צפייה בכל השיעורים הקרובים</p>
      </a>
    </div>
  {:else if profile}
    <!-- Customer profile summary -->
    <div class="profile-summary">
      <div class="profile-summary__header">
        <p class="profile-summary__kicker">פרופיל פילאטיס</p>
        <a href="/profile" class="profile-summary__edit">ערוך</a>
      </div>

      <div class="profile-summary__grid">
        <div class="profile-summary__cell">
          <span class="profile-summary__label">ניסיון</span>
          <span class="profile-summary__value">{experienceLabels[profile.experience] ?? profile.experience}</span>
        </div>
        <div class="profile-summary__cell">
          <span class="profile-summary__label">ציוד</span>
          <span class="profile-summary__value">{fmtList(profile.equipment, equipmentLabels)}</span>
        </div>
        <div class="profile-summary__cell">
          <span class="profile-summary__label">מטרות</span>
          <span class="profile-summary__value">{fmtList(profile.goals, goalLabels)}</span>
        </div>
        {#if profile.notes && profile.notes.trim().length > 0}
          <div class="profile-summary__cell profile-summary__cell--wide">
            <span class="profile-summary__label">הערות</span>
            <span class="profile-summary__value">{profile.notes}</span>
          </div>
        {/if}
      </div>
    </div>
  {/if}

  <div class="empty-state">
    <p class="empty-state__kicker">התוכן שלך</p>
    <p class="empty-state__text">
      {#if isStaff}
        אין עדיין שיעורים פעילים. השתמשי בסטודיו כדי ליצור את הלייב הראשון.
      {:else}
        אין עדיין שיעורים פעילים. ברגע שתרשמי למנוי או תשתמשי בקרדיט, הכל יופיע כאן.
      {/if}
    </p>
  </div>
  </PageShell>
</AppLayout>

<style>
  .live-alert {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    border: var(--border);
    background: var(--ink);
    color: var(--white);
    padding: var(--space-4);
    text-decoration: none;
    width: fit-content;
  }

  .live-alert strong, .live-alert small { display: block; }
  .live-alert small {
    color: rgba(255, 255, 255, 0.72);
    margin-top: 2px;
  }

  .live-alert__pulse {
    width: 10px;
    height: 10px;
    border-radius: 999px;
    background: #d11f1f;
    box-shadow: 0 0 0 0 rgba(209, 31, 31, 0.45);
    animation: live-breathe 1.7s ease-in-out infinite;
    flex: 0 0 auto;
  }

  @keyframes live-breathe {
    0%, 100% { transform: scale(0.82); box-shadow: 0 0 0 0 rgba(209, 31, 31, 0.45); }
    50% { transform: scale(1); box-shadow: 0 0 0 9px rgba(209, 31, 31, 0); }
  }

  .profile-summary {
    border: var(--border);
    padding: var(--space-6);
    background: var(--white);
  }

  .profile-summary__header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: var(--space-4);
    margin-bottom: var(--space-5);
    padding-bottom: var(--space-4);
    border-bottom: var(--border);
  }

  .profile-summary__kicker {
    font-family: var(--font-mono);
    font-size: var(--step--1);
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--muted);
    font-weight: 700;
    margin: 0;
  }

  .profile-summary__edit {
    font-size: var(--step--1);
    font-weight: 700;
    color: var(--sky-strong);
    text-decoration: none;
    transition: color var(--duration-fast);
  }

  .profile-summary__edit:hover { color: var(--ink); }

  .profile-summary__grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--space-5);
  }

  .profile-summary__cell {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }

  .profile-summary__cell--wide { grid-column: 1 / -1; }

  .profile-summary__label {
    font-size: var(--step--1);
    color: var(--muted);
  }

  .profile-summary__value {
    font-size: var(--step-1);
    font-weight: 700;
    line-height: 1.3;
  }

  .instructor-actions {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: var(--space-4);
  }

  .action-card {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    border: var(--border);
    background: var(--white);
    padding: var(--space-6);
    text-decoration: none;
    color: var(--ink);
    transition: background var(--duration-fast);
  }

  .action-card:hover {
    background: var(--surface);
  }

  .action-card__num {
    font-family: var(--font-mono);
    font-size: var(--step--1);
    color: var(--sky-strong);
    font-weight: 700;
  }

  .action-card h3 {
    font-size: var(--step-1);
    margin: 0;
    line-height: 1.2;
  }

  .action-card p {
    color: var(--muted);
    margin: 0;
    line-height: 1.5;
  }

  .empty-state {
    padding: var(--space-6);
    border: var(--border);
    background: var(--white);
  }

  .empty-state__kicker {
    font-family: var(--font-mono);
    font-size: var(--step--1);
    color: var(--muted);
    margin: 0 0 var(--space-3);
  }

  .empty-state__text {
    color: var(--muted);
    font-size: var(--step-1);
    max-width: 50ch;
    margin: 0;
  }

  .compliance-bar {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-4);
    margin-top: var(--space-4);
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
    color: #188038;
  }

  .compliance--ok {
    color: var(--ink);
  }

  @media (max-width: 820px) {
    .profile-summary__grid { grid-template-columns: 1fr; }
  }
</style>
