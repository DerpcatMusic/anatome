<script lang="ts">
  import { Button } from "bits-ui";
  import { resource, TextareaAutosize } from "runed";
  import { api } from "$convex/_generated/api";
  import { authQuery, initAuth, canRunAuthenticatedQuery } from "$lib/auth/session.svelte";
  import { useConvexClient, useQuery } from "convex-svelte";
  import AppSkeleton from "$features/app/components/AppSkeleton.svelte";
  import AppLocked from "$features/app/components/AppLocked.svelte";
  import OnboardingForm from "$features/onboarding/components/OnboardingForm.svelte";
  import PageShell from "$features/app/components/PageShell.svelte";
  import Notice from "$components/ui/Notice.svelte";
  import SubscriptionManager from "$features/dashboard/components/SubscriptionManager.svelte";
  import NotificationSettings from "$features/settings/components/NotificationSettings.svelte";
  import MemberProfileView from "./MemberProfileView.svelte";
  import InstructorProfileView from "./InstructorProfileView.svelte";
  import AvatarUpload from "./AvatarUpload.svelte";
  import { useI18n } from "$lib/i18n/runes.svelte";
  import { useQueryNowMs } from "$lib/convex/queryClock.svelte";

  const { t } = useI18n();

  let {
    audience,
  }: {
    audience: "member" | "instructor";
  } = $props();

  const auth = initAuth();
  const isInstructorAudience = $derived(audience === "instructor");
  const queryNow = useQueryNowMs();

  const dashboardResource = resource(
    () => (auth.isAuthenticated ? queryNow.nowMs : null),
    async (now) => {
      if (now === null) return null;
      return await authQuery(api.users.dashboard.get, { now });
    },
  );

  const appProfileResource = resource(
    () => auth.isAuthenticated && isInstructorAudience,
    async (isAuthenticated) => {
      if (!isAuthenticated) return null;
      return await authQuery(api.profiles.viewer.get, {});
    },
  );

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

  const client = useConvexClient();

  const viewerQuery = useQuery(api.profiles.viewer.get, () =>
    canRunAuthenticatedQuery() ? {} : "skip",
  );
  const viewerAvatarUrl = $derived(viewerQuery.data?.avatarUrl ?? null);
  const viewerDisplayName = $derived(viewerQuery.data?.displayName ?? "");

  async function refreshViewerProfile() {
    if (isInstructorAudience) {
      await appProfileResource.refetch();
    }
  }

  $effect(() => {
    if (appProfileResource.current) {
      instructorName = nameParts[0] ?? "";
      instructorSurname = nameParts.slice(1).join(" ") ?? "";
      instructorCredentials = appProfileResource.current.credentials ?? "";
      certificateDataUrl = appProfileResource.current.certificateDocument ?? "";
      insuranceDataUrl = appProfileResource.current.insuranceDocument ?? "";
    }
  });

  const profile = $derived(
    dashboardResource.current?.profile
      ? {
          equipment: dashboardResource.current.profile.equipment,
          experience: dashboardResource.current.profile.experience,
          goals: dashboardResource.current.profile.goals,
          pathologies: dashboardResource.current.profile.pathologies ?? [],
          notes: dashboardResource.current.profile.notes ?? "",
          healthDeclarationAnswers: dashboardResource.current.profile.healthDeclarationAnswers ?? undefined,
        }
      : null,
  );

  const dashboard = $derived(dashboardResource.current);

  const MAX_FILE_SIZE = 2 * 1024 * 1024;

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

  async function retryDashboard() {
    await dashboardResource.refetch();
  }
</script>

{#if auth.isLoading || dashboardResource.loading || (isInstructorAudience && appProfileResource.loading)}
  <AppSkeleton />
{:else if !auth.isAuthenticated}
  <AppLocked title={t.app.locked.title()} subtitle={t.onboarding.locked.subtitle()}>
    {#snippet actions()}
      <a href="/" class="locked__action">{t.onboarding.locked.cta()}</a>
    {/snippet}
  </AppLocked>
{:else if dashboardResource.error}
  <AppLocked title={t.profile.error()} subtitle={t.app.errorRetry()}>
    {#snippet actions()}
      <Button.Root class="hb-button hb-button--ghost" type="button" onclick={retryDashboard}>לנסות שוב</Button.Root>
    {/snippet}
  </AppLocked>
{:else if isInstructorAudience}
  <PageShell title="פרופיל מדריכה">
    <div class="profile-toolbar">
      {#if !instructorEditing}
        <Button.Root
          class="hb-button hb-button--ink hb-button--sm"
          type="button"
          onclick={() => { instructorEditing = true; }}
        >
          עריכת פרופיל
        </Button.Root>
      {:else}
        <Button.Root
          class="hb-button hb-button--ghost hb-button--sm"
          type="button"
          onclick={() => { instructorEditing = false; saveError = ""; }}
        >
          ביטול עריכה
        </Button.Root>
      {/if}
    </div>

    {#if saveError}<Notice tone="danger">{saveError}</Notice>{/if}
    {#if saveSuccess}<Notice tone="success">נשמר.</Notice>{/if}

    <section class="profile-avatar-section" aria-label="תמונת פרופיל">
      <AvatarUpload
        avatarUrl={viewerAvatarUrl}
        displayName={viewerDisplayName}
        onUpdated={refreshViewerProfile}
      />
    </section>

    {#if instructorEditing}
      <div class="instructor-form">
        <section class="form-section">
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

        <section class="form-section">
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

        <section class="form-section">
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
        displayName={appProfileResource.current?.displayName}
        credentials={appProfileResource.current?.credentials}
        certificateDocument={appProfileResource.current?.certificateDocument}
        insuranceDocument={appProfileResource.current?.insuranceDocument}
      />
    {/if}
  </PageShell>
{:else if profile}
  <PageShell title={t.profile.title()}>
    {#if !memberEditing}
      <div class="profile-toolbar">
        <Button.Root
          class="hb-button hb-button--ink hb-button--sm"
          type="button"
          onclick={() => { memberEditing = true; }}
        >
          עריכת פרופיל
        </Button.Root>
      </div>

      <section class="profile-avatar-section" aria-label="תמונת פרופיל">
        <AvatarUpload
          avatarUrl={viewerAvatarUrl}
          displayName={viewerDisplayName}
          onUpdated={refreshViewerProfile}
        />
      </section>

      <MemberProfileView {profile} />

      <SubscriptionManager
        subscription={dashboard?.subscription ?? null}
        subscriptionPlan={dashboard?.subscriptionPlan ?? null}
        pendingSubscriptionPlan={dashboard?.pendingSubscriptionPlan ?? null}
      />

      <NotificationSettings />
    {:else}
      <div class="profile-toolbar">
        <Button.Root
          class="hb-button hb-button--ghost hb-button--sm"
          type="button"
          onclick={() => { memberEditing = false; }}
        >
          חזרה לתצוגה
        </Button.Root>
      </div>
      <OnboardingForm
        mode="edit"
        initialProfile={profile}
        initialDisplayName={dashboardResource.current?.appProfile?.displayName}
        onSaved={onMemberProfileSaved}
      />
    {/if}
  </PageShell>
{:else}
  <AppLocked
    title={t.app.needsOnboarding.title()}
    subtitle={t.app.needsOnboarding.subtitle()}
  >
    {#snippet actions()}
      <a href="/onboarding" class="locked__action">{t.app.needsOnboarding.cta()}</a>
      <Button.Root class="hb-button hb-button--ghost" type="button" onclick={retryDashboard}>רענון</Button.Root>
    {/snippet}
  </AppLocked>
{/if}

<style>
  .profile-toolbar {
    display: flex;
    justify-content: flex-end;
    margin-bottom: var(--space-4);
  }

  .profile-avatar-section {
    margin-bottom: var(--space-4);
  }

  .instructor-form {
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
    max-width: 560px;
  }

  .form-section {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
    border: var(--border);
    background: var(--elevated);
    padding: var(--space-5);
  }

  .form-section h3 {
    font-size: var(--step-1);
    margin: 0;
    line-height: 1.2;
  }

  .field,
  .doc-upload {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .field__label {
    font-weight: 800;
    font-size: var(--step-0);
  }

  input,
  textarea {
    min-height: 46px;
    border: var(--border);
    background: var(--paper);
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
    padding: var(--space-6);
    text-align: center;
    cursor: pointer;
    min-height: 100px;
  }

  .file-drop:hover {
    background: var(--accent-soft);
    border-color: var(--primary);
  }

  .file-drop input {
    position: absolute;
    opacity: 0;
  }

  .drop-text {
    color: var(--foreground-muted);
    font-size: var(--step-0);
  }

  .doc-preview {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    border: var(--border);
    padding: var(--space-3);
    background: var(--surface);
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
    background: var(--elevated);
    font-family: var(--font-mono);
    font-size: var(--step--2);
    font-weight: 900;
  }

  .doc-name {
    flex: 1;
    font-size: var(--step-0);
    font-weight: 600;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
</style>
