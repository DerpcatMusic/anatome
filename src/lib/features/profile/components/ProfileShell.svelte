<script lang="ts">
  import Button from "$components/ui/Button.svelte";
  import { resource, TextareaAutosize } from "runed";
  import { api } from "$convex/_generated/api";
  import { authQuery, initAuth } from "$lib/auth/session.svelte";
  import { useConvexClient } from "convex-svelte";
  import AppSkeleton from "$features/app/components/AppSkeleton.svelte";
  import AppLocked from "$features/app/components/AppLocked.svelte";
  import OnboardingForm from "$features/onboarding/components/OnboardingForm.svelte";
  import PageShell from "$features/app/components/PageShell.svelte";
  import Notice from "$components/ui/Notice.svelte";

  const auth = initAuth();

  const dashboardResource = resource(
    () => auth.isAuthenticated,
    async (isAuthenticated) => {
      if (!isAuthenticated) return null;
      return await authQuery(api.users.dashboard.get, {});
    }
  );

  const appProfileResource = resource(
    () => auth.isAuthenticated,
    async (isAuthenticated) => {
      if (!isAuthenticated) return null;
      return await authQuery(api.profiles.viewer.get, {});
    }
  );

  const role = $derived(dashboardResource.current?.role ?? null);
  const isStaff = $derived(role === "instructor" || role === "admin");
  const displayName = $derived(appProfileResource.current?.displayName ?? "");
  const nameParts = $derived(displayName.split(" "));

  let instructorName = $state("");
  let instructorSurname = $state("");
  let instructorCredentials = $state("");
  let credentialsEl = $state<HTMLTextAreaElement | null>(null);
  const credentialsAutosize = new TextareaAutosize({ element: () => credentialsEl ?? undefined, input: () => instructorCredentials });
  let certificateFile = $state<File | null>(null);
  let certificateDataUrl = $state("");
  let insuranceFile = $state<File | null>(null);
  let insuranceDataUrl = $state("");
  let saving = $state(false);
  let saveError = $state("");
  let saveSuccess = $state(false);

  const client = useConvexClient();

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
      setTimeout(() => { saveSuccess = false; }, 3000);
    } catch (reason) {
      saveError = reason instanceof Error ? reason.message : "לא הצלחנו לשמור.";
    } finally {
      saving = false;
    }
  }

  async function retryDashboard() {
    await dashboardResource.refetch();
  }
</script>

{#if auth.isLoading || dashboardResource.loading || (isStaff && appProfileResource.loading)}
  <AppSkeleton />
{:else if !auth.isAuthenticated}
  <AppLocked title="צריך להתחבר קודם" subtitle="כדי לערוך את הפרופיל, נכנסים עם כתובת אימייל.">
    {#snippet actions()}
      <a href="/" class="locked__action">לעמוד הראשי</a>
    {/snippet}
  </AppLocked>
{:else if dashboardResource.error}
  <AppLocked title="לא הצלחנו לטעון" subtitle="נסי לרענן את הדף.">
    {#snippet actions()}
      <Button tone="ghost" type="button" onclick={retryDashboard}>לנסות שוב</Button>
    {/snippet}
  </AppLocked>
{:else if isStaff}
  <PageShell
    kicker="HomeBody Studio"
    title="פרופיל מדריכה"
    description="פרטים אישיים, הכשרות, ומסמכים משפטיים נדרשים."
  >
    {#if saveError}<Notice tone="danger">{saveError}</Notice>{/if}
    {#if saveSuccess}<Notice tone="success">הפרטים נשמרו בהצלחה.</Notice>{/if}

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
          <textarea bind:value={instructorCredentials} bind:this={credentialsEl} placeholder="היכן למדת, תעודות הכשרה, שנות ניסיון..."></textarea>
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
              <Button tone="ghost" type="button" onclick={() => { certificateFile = null; certificateDataUrl = ""; }}>מחק</Button>
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
              <Button tone="ghost" type="button" onclick={() => { insuranceFile = null; insuranceDataUrl = ""; }}>מחק</Button>
            </div>
          {:else}
            <label class="file-drop">
              <input type="file" accept="image/*,.pdf" onchange={onInsuranceSelect} />
              <span class="drop-text">גררי תמונה או PDF<br /><small>עד 2MB</small></span>
            </label>
          {/if}
        </div>
      </section>

      <Button tone="ink" onclick={saveInstructorProfile} disabled={saving}>
        {saving ? "שומר..." : "שמור פרופיל"}
      </Button>
    </div>
  </PageShell>
{:else if profile}
  <OnboardingForm mode="edit" initialProfile={profile} />
{:else}
  <AppSkeleton />
{/if}

<style>
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
    background: linear-gradient(135deg, color-mix(in srgb, var(--white) 97%, var(--beige) 3%), var(--white));
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
    background: var(--white);
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

</style>
