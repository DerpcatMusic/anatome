<script lang="ts">
  import { Button } from "bits-ui";
  import { api } from "$convex/_generated/api";
  import InstructorAccountEditForm from "./InstructorAccountEditForm.svelte";
  import type { FunctionReturnType } from "convex/server";
  import { useConvexClient } from "convex-svelte";
  import Notice from "$components/ui/Notice.svelte";
  import InstructorProfileView from "$features/profile/components/InstructorProfileView.svelte";
  import { useI18n } from "$lib/i18n/runes.svelte";

  type ViewerProfile = NonNullable<FunctionReturnType<typeof api.profiles.viewer.get>>;
  type StaffViewerProfile = ViewerProfile & {
    certificateDocument?: string;
    insuranceDocument?: string;
  };

  let {
    profile,
    onProfileUpdate,
  }: {
    profile: StaffViewerProfile | null;
    onProfileUpdate: () => Promise<void> | void;
  } = $props();

  const { t } = useI18n();
  const client = useConvexClient();

  let instructorEditing = $state(false);
  let instructorName = $state("");
  let instructorSurname = $state("");
  let instructorCredentials = $state("");
  let certificateFile = $state<File | null>(null);
  let certificateDataUrl = $state("");
  let insuranceFile = $state<File | null>(null);
  let insuranceDataUrl = $state("");
  let saving = $state(false);
  let saveError = $state("");
  let saveSuccess = $state(false);

  const displayName = $derived(profile?.displayName ?? "");
  const nameParts = $derived(displayName.split(" "));

  $effect(() => {
    if (profile) {
      instructorName = nameParts[0] ?? "";
      instructorSurname = nameParts.slice(1).join(" ") ?? "";
      instructorCredentials = profile.credentials ?? "";
      certificateDataUrl = profile.certificateDocument ?? "";
      insuranceDataUrl = profile.insuranceDocument ?? "";
    }
  });

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
      await Promise.resolve(onProfileUpdate());
      setTimeout(() => {
        saveSuccess = false;
      }, 3000);
    } catch (reason) {
      saveError = reason instanceof Error ? reason.message : "לא הצלחנו לשמור.";
    } finally {
      saving = false;
    }
  }

  function startInstructorEditing() {
    instructorEditing = true;
  }

  function cancelInstructorEditing() {
    instructorEditing = false;
    saveError = "";
  }

  function clearCertificate() {
    certificateFile = null;
    certificateDataUrl = "";
  }

  function clearInsurance() {
    insuranceFile = null;
    insuranceDataUrl = "";
  }
</script>

{#if saveError}<Notice tone="danger">{saveError}</Notice>{/if}
{#if saveSuccess}<Notice tone="success">נשמר.</Notice>{/if}

<div class="dashboard-account__toolbar">
  {#if !instructorEditing}
    <Button.Root
      class="hb-button hb-button--ink hb-button--sm"
      type="button"
      onclick={startInstructorEditing}
    >
      {t.dashboard.profile.edit()}
    </Button.Root>
  {:else}
    <Button.Root
      class="hb-button hb-button--ghost hb-button--sm"
      type="button"
      onclick={cancelInstructorEditing}
    >
      ביטול עריכה
    </Button.Root>
  {/if}
</div>

{#if instructorEditing}
  <InstructorAccountEditForm
    bind:instructorName
    bind:instructorSurname
    bind:instructorCredentials
    {certificateDataUrl}
    {certificateFile}
    {insuranceDataUrl}
    {insuranceFile}
    {saving}
    onSave={saveInstructorProfile}
    onClearCertificate={clearCertificate}
    onClearInsurance={clearInsurance}
    onCertificateSelect={onCertificateSelect}
    onInsuranceSelect={onInsuranceSelect}
  />
{:else}
  <InstructorProfileView
    displayName={profile?.displayName}
    credentials={profile?.credentials}
    certificateDocument={profile?.certificateDocument}
    insuranceDocument={profile?.insuranceDocument}
  />
{/if}

<style>
  .dashboard-account__toolbar {
    display: flex;
    justify-content: flex-start;
  }
</style>
