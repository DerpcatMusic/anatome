<script lang="ts">
  import { resource } from "runed";
  import { api } from "../../../convex/_generated/api";
  import { authQuery, initAuth } from "../../lib/auth/session.svelte";
  import AppSkeleton from "./AppSkeleton.svelte";
  import AppLocked from "./AppLocked.svelte";
  import OnboardingForm from "./OnboardingForm.svelte";
  import PageShell from "./PageShell.svelte";
  import Notice from "../ui/Notice.svelte";
  import { convex } from "../../lib/convex/client";

  const auth = initAuth();

  const dashboardResource = resource(
    () => auth.isAuthenticated,
    async (isAuthenticated) => {
      if (!isAuthenticated) return null;
      return await authQuery(api.users.dashboard, {});
    }
  );

  const appProfileResource = resource(
    () => auth.isAuthenticated,
    async (isAuthenticated) => {
      if (!isAuthenticated) return null;
      return await authQuery(api.appProfiles.viewer, {});
    }
  );

  const role = $derived(dashboardResource.current?.role ?? null);
  const isStaff = $derived(role === "instructor" || role === "admin");

  const displayName = $derived(appProfileResource.current?.displayName ?? "");
  const nameParts = $derived(displayName.split(" "));
  let instructorName = $state("");
  let instructorSurname = $state("");
  let instructorCredentials = $state("");

  // Document state
  let certificateFile = $state<File | null>(null);
  let certificateDataUrl = $state("");
  let insuranceFile = $state<File | null>(null);
  let insuranceDataUrl = $state("");

  let saving = $state(false);
  let saveError = $state("");
  let saveSuccess = $state(false);

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
          notes: dashboardResource.current.profile.notes ?? "",
        }
      : null
  );

  $effect(() => {
    if (
      auth.isAuthenticated &&
      !isStaff &&
      !dashboardResource.loading &&
      !dashboardResource.error &&
      dashboardResource.current !== undefined &&
      (dashboardResource.current === null || !dashboardResource.current.profile)
    ) {
      window.location.assign("/onboarding");
    }
  });

  const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

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

  function removeCertificate() {
    certificateFile = null;
    certificateDataUrl = "";
  }

  function removeInsurance() {
    insuranceFile = null;
    insuranceDataUrl = "";
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
      await convex.mutation(api.appProfiles.updateInstructorProfile, {
        displayName: `${instructorName.trim()} ${instructorSurname.trim()}`.trim(),
        credentials: instructorCredentials.trim(),
        certificateDocument: certificateDataUrl || undefined,
        insuranceDocument: insuranceDataUrl || undefined,
      });
      saveSuccess = true;
      certificateFile = null;
      insuranceFile = null;
      setTimeout(() => { saveSuccess = false; }, 3000);
    } catch (reason) {
      saveError = reason instanceof Error ? reason.message : "לא הצלחנו לשמור.";
    } finally {
      saving = false;
    }
  }
</script>

<section class="profile-page">
  {#if auth.isLoading || dashboardResource.loading || (isStaff && appProfileResource.loading)}
    <AppSkeleton />
  {:else if !auth.isAuthenticated}
    <AppLocked
      title="צריך להתחבר קודם"
      subtitle="כדי לערוך את הפרופיל, נכנסים עם כתובת אימייל."
    >
      {#snippet actions()}
        <a href="/">לעמוד הראשי</a>
      {/snippet}
    </AppLocked>
  {:else if dashboardResource.error}
    <AppLocked
      title="לא הצלחנו לטעון"
      subtitle="נסי לרענן את הדף."
    >
      {#snippet actions()}
        <button onclick={() => dashboardResource.refetch()}>לנסות שוב</button>
      {/snippet}
    </AppLocked>
  {:else if isStaff}
    <PageShell
      kicker="HomeBody Studio"
      title="פרופיל מדריכה"
      description="פרטים אישיים, הכשרות, ומסמכים משפטיים נדרשים."
    >
      {#if saveError}
        <Notice tone="danger">{saveError}</Notice>
      {/if}
      {#if saveSuccess}
        <Notice tone="success">הפרטים נשמרו בהצלחה.</Notice>
      {/if}

      <div class="instructor-form">
        <div class="form-section">
          <h3>פרטים אישיים</h3>
          <label class="field">
            <span class="field__label">שם פרטי</span>
            <input bind:value={instructorName} placeholder="שם" />
          </label>
          <label class="field">
            <span class="field__label">שם משפחה</span>
            <input bind:value={instructorSurname} placeholder="שם משפחה" />
          </label>
        </div>

        <div class="form-section">
          <h3>הכשרות וביטוח</h3>
          <label class="field">
            <span class="field__label">תיאור הכשרות</span>
            <textarea bind:value={instructorCredentials} rows="3" placeholder="היכן למדת, תעודות הכשרה, שנות ניסיון..."></textarea>
          </label>
        </div>

        <div class="form-section">
          <h3>מסמכים משפטיים</h3>

          <!-- Certificate -->
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
                <button class="doc-remove" onclick={removeCertificate} type="button">מחק</button>
              </div>
            {:else}
              <label class="file-drop">
                <input type="file" accept="image/*,.pdf" onchange={onCertificateSelect} />
                <span class="drop-text">גררי תמונה או PDF<br /><small>עד 2MB</small></span>
              </label>
            {/if}
          </div>

          <!-- Insurance -->
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
                <button class="doc-remove" onclick={removeInsurance} type="button">מחק</button>
              </div>
            {:else}
              <label class="file-drop">
                <input type="file" accept="image/*,.pdf" onchange={onInsuranceSelect} />
                <span class="drop-text">גררי תמונה או PDF<br /><small>עד 2MB</small></span>
              </label>
            {/if}
          </div>
        </div>

        <button class="btn btn--ink" onclick={saveInstructorProfile} disabled={saving}>
          {saving ? "שומר..." : "שמור פרופיל"}
        </button>
      </div>
    </PageShell>
  {:else if profile}
    <OnboardingForm mode="edit" initialProfile={profile} />
  {:else}
    <AppSkeleton />
  {/if}
</section>

<style>
  .profile-page {
    min-height: calc(100vh - 56px);
  }

  .profile-page :global(> *) {
    min-height: calc(100vh - 56px);
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
    background: var(--white);
    padding: var(--space-5);
  }

  .form-section h3 {
    font-size: var(--step-1);
    margin: 0;
    line-height: 1.2;
  }

  .field {
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
    background: var(--white);
    color: var(--ink);
    padding: var(--space-3);
    font: inherit;
  }

  textarea {
    min-height: 80px;
    resize: vertical;
  }

  /* Document upload */
  .doc-upload {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .file-drop {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--space-2);
    border: 2px dashed var(--line-light);
    padding: var(--space-6);
    text-align: center;
    cursor: pointer;
    transition: background var(--duration-fast), border-color var(--duration-fast);
    min-height: 100px;
  }

  .file-drop:hover {
    background: var(--surface);
    border-color: var(--sky-strong);
  }

  .file-drop input {
    position: absolute;
    opacity: 0;
  }

  .drop-text {
    color: var(--muted);
    font-size: var(--step-0);
  }

  .drop-text small {
    font-family: var(--font-mono);
    font-size: var(--step--1);
  }

  .doc-preview {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    border: var(--border);
    padding: var(--space-3);
    background: var(--surface);
  }

  .doc-preview img {
    width: 48px;
    height: 48px;
    object-fit: cover;
    border: var(--border);
  }

  .doc-icon {
    width: 48px;
    height: 48px;
    display: grid;
    place-items: center;
    border: var(--border);
    background: var(--white);
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

  .doc-remove {
    border: var(--border);
    background: #fef2f2;
    color: #b42318;
    border-color: #fecaca;
    padding: var(--space-2) var(--space-3);
    font: inherit;
    font-size: var(--step--1);
    font-weight: 700;
    cursor: pointer;
  }

  .doc-remove:hover {
    background: #fee2e2;
  }

  .btn {
    display: inline-flex;
    min-height: 46px;
    align-items: center;
    justify-content: center;
    border: var(--border);
    padding-inline: var(--space-5);
    font: inherit;
    font-weight: 900;
    cursor: pointer;
    text-decoration: none;
    transition: background var(--duration-fast);
    width: fit-content;
  }

  .btn--ink {
    background: var(--ink);
    color: var(--white);
  }

  .btn--ink:hover {
    background: var(--ink-secondary);
  }

  .btn:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }
</style>
