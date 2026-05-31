<script lang="ts">
  import { Button } from "bits-ui";
  import { TextareaAutosize } from "runed";

  interface Props {
    instructorName?: string;
    instructorSurname?: string;
    instructorCredentials?: string;
    certificateDataUrl?: string;
    certificateFile?: File | null;
    insuranceDataUrl?: string;
    insuranceFile?: File | null;
    saving?: boolean;
    onSave: () => Promise<void> | void;
    onClearCertificate: () => void;
    onClearInsurance: () => void;
    onCertificateSelect: (event: Event) => Promise<void> | void;
    onInsuranceSelect: (event: Event) => Promise<void> | void;
  }

  let {
    instructorName = $bindable(""),
    instructorSurname = $bindable(""),
    instructorCredentials = $bindable(""),
    certificateDataUrl = "",
    certificateFile = null,
    insuranceDataUrl = "",
    insuranceFile = null,
    saving = false,
    onSave,
    onClearCertificate,
    onClearInsurance,
    onCertificateSelect,
    onInsuranceSelect,
  }: Props = $props();

  let credentialsEl: HTMLTextAreaElement | null = null;
  const credentialsAutosize = new TextareaAutosize({
    element: () => credentialsEl ?? undefined,
    input: () => instructorCredentials,
  });

  function isImageDataUrl(url: string) {
    return url.startsWith("data:image/");
  }

  function isPdfDataUrl(url: string) {
    return url.startsWith("data:application/pdf");
  }
</script>

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
    {@render certificateUpload()}
    {@render insuranceUpload()}
  </section>

  <Button.Root
    class="hb-button hb-button--ink"
    type="button"
    onclick={onSave}
    disabled={saving}
  >
    {saving ? "שומר..." : "שמירת פרופיל"}
  </Button.Root>
</div>

{#snippet certificateUpload()}
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
          onclick={onClearCertificate}>מחק</Button.Root
        >
      </div>
    {:else}
      <label class="file-drop">
        <input type="file" accept="image/*,.pdf" onchange={onCertificateSelect} />
        <span class="drop-text">גררי תמונה או PDF<br /><small>עד 2MB</small></span>
      </label>
    {/if}
  </div>
{/snippet}

{#snippet insuranceUpload()}
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
          onclick={onClearInsurance}>מחק</Button.Root
        >
      </div>
    {:else}
      <label class="file-drop">
        <input type="file" accept="image/*,.pdf" onchange={onInsuranceSelect} />
        <span class="drop-text">גררי תמונה או PDF<br /><small>עד 2MB</small></span>
      </label>
    {/if}
  </div>
{/snippet}

<style>
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
</style>
