<script lang="ts">
  import { page } from "$app/state";
  import { Button, Collapsible } from "bits-ui";
  import { resource, TextareaAutosize } from "runed";
  import { api } from "$convex/_generated/api";
  import type { FunctionReturnType } from "convex/server";
  import { authQuery, initAuth } from "$lib/auth/session.svelte";
  import { useConvexClient, useQuery } from "convex-svelte";
  import OnboardingForm from "$features/onboarding/components/OnboardingForm.svelte";
  import Notice from "$components/ui/Notice.svelte";
  import SubscriptionManager from "./SubscriptionManager.svelte";
  import ProfileSummary from "./ProfileSummary.svelte";
  import NotificationSettings from "$features/settings/components/NotificationSettings.svelte";
  import InstructorProfileView from "$features/profile/components/InstructorProfileView.svelte";
  import AvatarUpload from "$features/profile/components/AvatarUpload.svelte";
  import { useI18n } from "$lib/i18n/runes.svelte";
  import { useQueryNowMs } from "$lib/convex/queryClock.svelte";
  import "../dashboard.css";

  type DashboardData = NonNullable<FunctionReturnType<typeof api.users.dashboard.get>>;
  type ViewerProfile = NonNullable<FunctionReturnType<typeof api.profiles.viewer.get>>;
  type StaffViewerProfile = ViewerProfile & {
    certificateDocument?: string;
    insuranceDocument?: string;
  };

  function staffViewerProfile(profile: ViewerProfile | null | undefined): StaffViewerProfile | null {
    if (!profile || (profile.role !== "instructor" && profile.role !== "admin")) return null;
    return profile as StaffViewerProfile;
  }

  let {
    open = $bindable(false),
    isStaff,
    dashboard,
  }: {
    open?: boolean;
    isStaff: boolean;
    dashboard: DashboardData | null;
  } = $props();

  const auth = initAuth();
  const { t } = useI18n();
  const queryNow = useQueryNowMs();
  const client = useConvexClient();

  const dashboardResource = resource(
    () => (auth.isAuthenticated ? queryNow.nowMs : null),
    async (now) => {
      if (now === null) return dashboard;
      return await authQuery(api.users.dashboard.get, { now });
    },
  );

  const appProfileResource = resource(
    () => auth.isAuthenticated && isStaff,
    async (shouldLoad) => {
      if (!shouldLoad) return null;
      return await authQuery(api.profiles.viewer.get, {});
    },
  );

  const viewerQuery = useQuery(api.profiles.viewer.get, () => (auth.isAuthenticated ? {} : "skip"));
  const viewerAvatarUrl = $derived(viewerQuery.data?.avatarUrl ?? null);
  const viewerDisplayName = $derived(viewerQuery.data?.displayName ?? "");

  const displayName = $derived(appProfileResource.current?.displayName ?? "");
  const nameParts = $derived(displayName.split(" "));

  let instructorEditing = $state(false);
  let memberEditing = $state(false);
  let instructorName = $state("");
  let instructorSurname = $state("");
  let instructorCredentials = $state("");
  let credentialsEl = $state<HTMLTextAreaElement | null>(null);
  const credentialsAutosize = new TextareaAutosize({
    element: () => credentialsEl ?? undefined,
    input: () => instructorCredentials,
  });
  let certificateFile = $state<File | null>(null);
  let certificateDataUrl = $state("");
  let insuranceFile = $state<File | null>(null);
  let insuranceDataUrl = $state("");
  let saving = $state(false);
  let saveError = $state("");
  let saveSuccess = $state(false);

  const profile = $derived(
    dashboardResource.current?.profile
      ? {
          equipment: dashboardResource.current.profile.equipment,
          experience: dashboardResource.current.profile.experience,
          goals: dashboardResource.current.profile.goals,
          pathologies: dashboardResource.current.profile.pathologies ?? [],
          notes: dashboardResource.current.profile.notes ?? "",
          healthDeclarationAnswers:
            dashboardResource.current.profile.healthDeclarationAnswers ?? undefined,
          healthDeclarationAcceptedAt:
            dashboardResource.current.profile.healthDeclarationAcceptedAt ?? undefined,
          healthInfoConsentAcceptedAt:
            dashboardResource.current.profile.healthInfoConsentAcceptedAt ?? undefined,
        }
      : null,
  );

  const MAX_FILE_SIZE = 2 * 1024 * 1024;

  $effect(() => {
    if (page.url.searchParams.get("panel") === "account") {
      open = true;
    }
    if (page.url.searchParams.get("edit") === "1" && !isStaff) {
      open = true;
      memberEditing = true;
    }
  });

  $effect(() => {
    const staff = staffViewerProfile(appProfileResource.current);
    if (staff) {
      instructorName = nameParts[0] ?? "";
      instructorSurname = nameParts.slice(1).join(" ") ?? "";
      instructorCredentials = staff.credentials ?? "";
      certificateDataUrl = staff.certificateDocument ?? "";
      insuranceDataUrl = staff.insuranceDocument ?? "";
    }
  });

  async function refreshViewerProfile() {
    if (isStaff) {
      await appProfileResource.refetch();
    }
  }

  function fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });
  }

  async function onCertificateSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.[0]) return;
    const file = input.files[0];
    if (file.size > MAX_FILE_SIZE) {
      saveError = "הקובץ גדול מ-2MB. צריך לדחוס או להשתמש בקובץ קטן יותר.";
      input.value = "";
      return;
    }
    saveError = "";
    certificateFile = file;
    certificateDataUrl = await fileToDataUrl(file);
  }

  async function onInsuranceSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.[0]) return;
    const file = input.files[0];
    if (file.size > MAX_FILE_SIZE) {
      saveError = "הקובץ גדול מ-2MB. צריך לדחוס או להשתמש בקובץ קטן יותר.";
      input.value = "";
      return;
    }
    saveError = "";
    insuranceFile = file;
    insuranceDataUrl = await fileToDataUrl(file);
  }

  function isImageDataUrl(url: string) {
    return url.startsWith("data:image/");
  }

  function isPdfDataUrl(url: string) {
    return url.startsWith("data:application/pdf");
  }

  async function saveInstructorProfile() {
    saving = true;
    saveError = "";
    saveSuccess = false;
    try {
      await client.mutation(api.profiles.update.instructorProfile, {
        displayName: `${instructorName.trim()} ${instructorSurname.trim()}`.trim(),
        credentials: instructorCredentials.trim(),
        certificateDocument: certificateDataUrl || undefined,
        insuranceDocument: insuranceDataUrl || undefined,
      });
      saveSuccess = true;
      certificateFile = null;
      insuranceFile = null;
      instructorEditing = false;
      await appProfileResource.refetch();
      setTimeout(() => {
        saveSuccess = false;
      }, 3000);
    } catch (reason) {
      saveError = reason instanceof Error ? reason.message : "לא הצלחנו לשמור.";
    } finally {
      saving = false;
    }
  }

  async function onMemberProfileSaved() {
    memberEditing = false;
    await dashboardResource.refetch();
  }
</script>

<section id="dashboard-account" class="dashboard-account">
  <Collapsible.Root bind:open class="dashboard-account__collapsible">
    <Collapsible.Trigger class="dashboard-account__trigger">
      <span class="dashboard-account__trigger-label">{t.dashboard.member.accountSectionTitle()}</span>
      <span class="material-symbols-rounded dashboard-account__chevron" aria-hidden="true">
        expand_more
      </span>
    </Collapsible.Trigger>

    <Collapsible.Content class="dashboard-account__content">
      {#if saveError}<Notice tone="danger">{saveError}</Notice>{/if}
      {#if saveSuccess}<Notice tone="success">נשמר.</Notice>{/if}

      <section class="dashboard-account__avatar" aria-label="תמונת פרופיל">
        <AvatarUpload
          avatarUrl={viewerAvatarUrl}
          displayName={viewerDisplayName}
          onUpdated={refreshViewerProfile}
        />
      </section>

      {#if isStaff}
        <div class="dashboard-account__toolbar">
          {#if !instructorEditing}
            <Button.Root
              class="hb-button hb-button--ink hb-button--sm"
              type="button"
              onclick={() => {
                instructorEditing = true;
              }}
            >
              {t.dashboard.profile.edit()}
            </Button.Root>
          {:else}
            <Button.Root
              class="hb-button hb-button--ghost hb-button--sm"
              type="button"
              onclick={() => {
                instructorEditing = false;
                saveError = "";
              }}
            >
              ביטול עריכה
            </Button.Root>
          {/if}
        </div>

        {#if instructorEditing}
          <div class="dashboard-account__form">
            <section class="dashboard-account__form-section">
              <h3>פרטים אישיים</h3>
              <label class="field">
                <span class="field__label">שם פרטי</span>
                <input bind:value={instructorName} placeholder="שם" />
              </label>
              <label class="field">
                <span class="field__label">שם משפחה</span>
                <input bind:value={instructorSurname} placeholder="שם משפחה" />
              </label>
            </section>

            <section class="dashboard-account__form-section">
              <h3>הכשרות וביטוח</h3>
              <label class="field">
                <span class="field__label">תיאור הכשרות</span>
                <textarea
                  bind:value={instructorCredentials}
                  bind:this={credentialsEl}
                  placeholder="היכן למדת, תעודות הכשרה, שנות ניסיון..."
                ></textarea>
              </label>
            </section>

            <section class="dashboard-account__form-section">
              <h3>מסמכים משפטיים</h3>
              <div class="doc-upload">
                <span class="field__label">תעודת הכשרה</span>
                {#if certificateDataUrl}
                  <div class="doc-preview">
                    {#if isImageDataUrl(certificateDataUrl)}
                      <img src={certificateDataUrl} alt="תעודת הכשרה" />
                    {:else if isPdfDataUrl(certificateDataUrl)}
                      <span class="doc-icon">PDF</span>
                    {:else}
                      <span class="doc-icon">קובץ</span>
                    {/if}
                    <span class="doc-name">{certificateFile?.name || "תעודה"}</span>
                    <Button.Root
                      class="hb-button hb-button--ghost"
                      type="button"
                      onclick={() => {
                        certificateFile = null;
                        certificateDataUrl = "";
                      }}>מחק</Button.Root
                    >
                  </div>
                {:else}
                  <label class="file-drop">
                    <input type="file" accept="image/*,.pdf" onchange={onCertificateSelect} />
                    <span class="drop-text">גררי תמונה או PDF<br /><small>עד 2MB</small></span>
                  </label>
                {/if}
              </div>

              <div class="doc-upload">
                <span class="field__label">ביטוח אחריות מקצועית</span>
                {#if insuranceDataUrl}
                  <div class="doc-preview">
                    {#if isImageDataUrl(insuranceDataUrl)}
                      <img src={insuranceDataUrl} alt="ביטוח" />
                    {:else if isPdfDataUrl(insuranceDataUrl)}
                      <span class="doc-icon">PDF</span>
                    {:else}
                      <span class="doc-icon">קובץ</span>
                    {/if}
                    <span class="doc-name">{insuranceFile?.name || "ביטוח"}</span>
                    <Button.Root
                      class="hb-button hb-button--ghost"
                      type="button"
                      onclick={() => {
                        insuranceFile = null;
                        insuranceDataUrl = "";
                      }}>מחק</Button.Root
                    >
                  </div>
                {:else}
                  <label class="file-drop">
                    <input type="file" accept="image/*,.pdf" onchange={onInsuranceSelect} />
                    <span class="drop-text">גררי תמונה או PDF<br /><small>עד 2MB</small></span>
                  </label>
                {/if}
              </div>
            </section>

            <Button.Root
              class="hb-button hb-button--ink"
              type="button"
              onclick={saveInstructorProfile}
              disabled={saving}
            >
              {saving ? "שומר..." : "שמירת פרופיל"}
            </Button.Root>
          </div>
        {:else}
          <InstructorProfileView
            displayName={staffViewerProfile(appProfileResource.current)?.displayName}
            credentials={staffViewerProfile(appProfileResource.current)?.credentials}
            certificateDocument={staffViewerProfile(appProfileResource.current)?.certificateDocument}
            insuranceDocument={staffViewerProfile(appProfileResource.current)?.insuranceDocument}
          />
        {/if}
      {:else}
        {#if profile && !memberEditing}
          <div class="dashboard-account__toolbar">
            <Button.Root
              class="hb-button hb-button--ink hb-button--sm"
              type="button"
              onclick={() => {
                memberEditing = true;
              }}
            >
              {t.dashboard.profile.edit()}
            </Button.Root>
          </div>

          <ProfileSummary isStaff={false} {profile} showEditLink={false} panelVariant="default" />
        {:else}
          <div class="dashboard-account__toolbar">
            {#if profile}
              <Button.Root
                class="hb-button hb-button--ghost hb-button--sm"
                type="button"
                onclick={() => {
                  memberEditing = false;
                }}
              >
                חזרה לתצוגה
              </Button.Root>
            {/if}
          </div>

          {#if !profile}
            <Notice tone="neutral">{t.app.needsOnboarding.subtitle()}</Notice>
          {/if}

          <OnboardingForm
            mode="edit"
            initialProfile={profile ?? undefined}
            initialDisplayName={dashboardResource.current?.appProfile?.displayName}
            onSaved={onMemberProfileSaved}
          />
        {/if}

        <div id="dashboard-subscription">
          <SubscriptionManager
            subscription={dashboardResource.current?.subscription ?? null}
            subscriptionPlan={dashboardResource.current?.subscriptionPlan ?? null}
            pendingSubscriptionPlan={dashboardResource.current?.pendingSubscriptionPlan ?? null}
            wallet={dashboardResource.current?.wallet ?? null}
          />
        </div>

        <NotificationSettings />
      {/if}
    </Collapsible.Content>
  </Collapsible.Root>
</section>

<style>
  .dashboard-account {
    min-width: 0;
    scroll-margin-top: var(--space-6);
  }

  :global(.dashboard-account__collapsible) {
    border: var(--border);
    border-radius: var(--radius-lg);
    background: var(--elevated);
    overflow: hidden;
  }

  :global(.dashboard-account__trigger) {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-3);
    width: 100%;
    padding: var(--space-4);
    border: none;
    background: transparent;
    color: inherit;
    font: inherit;
    cursor: pointer;
    text-align: start;
  }

  :global(.dashboard-account__trigger:focus-visible) {
    outline: 2px solid var(--primary);
    outline-offset: -2px;
  }

  .dashboard-account__trigger-label {
    font-size: var(--text-base);
    font-weight: 700;
  }

  .dashboard-account__chevron {
    transition: transform var(--duration-fast) var(--ease-out);
  }

  :global(.dashboard-account__collapsible[data-state="open"]) .dashboard-account__chevron {
    transform: rotate(180deg);
  }

  :global(.dashboard-account__content) {
    display: grid;
    gap: var(--space-4);
    padding: 0 var(--space-4) var(--space-4);
  }

  .dashboard-account__toolbar {
    display: flex;
    justify-content: flex-start;
  }

  .dashboard-account__avatar {
    padding-top: var(--space-1);
  }

  .dashboard-account__form {
    display: flex;
    flex-direction: column;
    gap: var(--space-5);
    max-width: 560px;
  }

  .dashboard-account__form-section {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    border: var(--border);
    background: var(--paper);
    padding: var(--space-4);
    border-radius: var(--radius-md);
  }

  .dashboard-account__form-section h3 {
    margin: 0;
    font-size: var(--step-1);
  }

  .field,
  .doc-upload {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .field__label {
    font-weight: 700;
    font-size: var(--text-sm);
  }

  input,
  textarea {
    min-height: 46px;
    border: var(--border);
    background: var(--elevated);
    color: var(--ink);
    padding: var(--space-3);
    font: inherit;
  }

  textarea {
    min-height: 80px;
    resize: vertical;
  }

  .file-drop {
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px dashed var(--line-light);
    padding: var(--space-5);
    text-align: center;
    cursor: pointer;
    min-height: 100px;
    border-radius: var(--radius-md);
  }

  .file-drop input {
    position: absolute;
    opacity: 0;
  }

  .drop-text {
    color: var(--foreground-muted);
    font-size: var(--text-sm);
  }

  .doc-preview {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    border: var(--border);
    padding: var(--space-3);
    background: var(--surface);
    border-radius: var(--radius-md);
  }

  .doc-preview img,
  .doc-icon {
    width: 48px;
    height: 48px;
    border: var(--border);
  }

  .doc-preview img {
    object-fit: cover;
  }

  .doc-icon {
    display: grid;
    place-items: center;
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    font-weight: 900;
  }

  .doc-name {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-weight: 600;
  }

  @media (prefers-reduced-motion: reduce) {
    .dashboard-account__chevron {
      transition: none;
    }
  }
</style>
