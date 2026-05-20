<script lang="ts">
  import { slide } from "svelte/transition";
  import type { Id } from "$convex/_generated/dataModel";
  import type { Equipment } from "$lib/labels";
  import RadioGroup from "$components/ui/RadioGroup.svelte";
  import Progress from "$components/ui/Progress.svelte";
  import Button from "$components/ui/Button.svelte";
  import Notice from "$components/ui/Notice.svelte";
  import EquipmentPicker from "$components/ui/EquipmentPicker.svelte";
  import Select from "$components/ui/Select.svelte";

  type AccessKind = "macroflow" | "microflow";
  type MuxVideoQuality = "basic" | "plus" | "premium";
  type MuxMaxResolutionTier = "1080p" | "1440p" | "2160p";
  type StaticRendition = "none" | "audio-only" | "720p" | "1080p";

  interface Props {
    categories: Array<{ _id: Id<"videoCategories">; name: string; description?: string }>;
    uploadStatus: "idle" | "uploading" | "processing" | "ready" | "error";
    uploadProgress: number;
    uploadError: string;
    creatingCategory: boolean;
    categoryError: string;
    onCreateCategory: (name: string) => Promise<void>;
    onSubmit: (data: {
      title: string;
      description: string;
      requiredEquipment: Equipment[];
      accessKind: AccessKind;
      categoryIds: Id<"videoCategories">[];
      muxVideoQuality: MuxVideoQuality;
      muxMaxResolutionTier: MuxMaxResolutionTier;
      staticRendition: StaticRendition;
      file: File;
    }) => void;
  }

  let {
    categories = [],
    uploadStatus = "idle",
    uploadProgress = 0,
    uploadError = "",
    creatingCategory = false,
    categoryError = "",
    onCreateCategory,
    onSubmit,
  }: Props = $props();

  // Internal form state
  let showAdvanced = $state(false);
  let title = $state("");
  let description = $state("");
  let requiredEquipment = $state<Equipment[]>(["mat"]);
  let accessKind = $state<AccessKind>("macroflow");
  let selectedCategoryIds = $state<Id<"videoCategories">[]>([]);
  let newCategoryName = $state("");
  let videoFile = $state<File | null>(null);
  let fileError = $state("");

  const accessOptions = [
    { value: "macroflow", label: "Macroflow", description: "רכישה חד-פעמית וגישה קבועה ללקוחה." },
    { value: "microflow", label: "Microflow", description: "פתוח למנויות פעילות בלבד, בלי צריכת קרדיט." },
  ];

  const qualityOptions = [
    { value: "basic", label: "Basic", description: "ברירת מחדל חסכונית לשיעורי סטודיו רגילים." },
    { value: "plus", label: "Plus", description: "איכות גבוהה יותר לתנועה מורכבת או שיעורים ארוכים." },
    { value: "premium", label: "Premium", description: "הכי יקר והכי איכותי; לשימוש רק כשצריך." },
  ];

  const maxResolutionOptions = [
    { value: "1080p", label: "1080p" },
    { value: "1440p", label: "1440p" },
    { value: "2160p", label: "2160p / 4K" },
  ];

  const staticRenditionOptions = [
    { value: "none", label: "ללא קובץ סטטי" },
    { value: "audio-only", label: "Audio only" },
    { value: "720p", label: "MP4 720p" },
    { value: "1080p", label: "MP4 1080p" },
  ];

  // Advanced Mux state
  let muxVideoQuality = $state<MuxVideoQuality>("basic");
  let muxMaxResolutionTier = $state<MuxMaxResolutionTier>("1080p");
  let staticRendition = $state<StaticRendition>("none");

  const canSubmit = $derived(
    Boolean(videoFile) &&
      title.trim().length >= 3 &&
      selectedCategoryIds.length > 0 &&
      uploadStatus !== "uploading" &&
      uploadStatus !== "processing"
  );

  function onFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      const file = input.files[0];
      if (file.size > 2 * 1024 * 1024 * 1024) {
        fileError = "הקובץ גדול מ-2GB. צריך לדחוס או לחתוך.";
        videoFile = null;
        input.value = "";
        return;
      }
      fileError = "";
      videoFile = file;
    }
  }

  function toggleCategory(categoryId: Id<"videoCategories">) {
    selectedCategoryIds = selectedCategoryIds.includes(categoryId)
      ? selectedCategoryIds.filter((id) => id !== categoryId)
      : [...selectedCategoryIds, categoryId];
  }

  async function handleAddCategory() {
    const name = newCategoryName.trim();
    if (!name) return;
    await onCreateCategory(name);
    newCategoryName = "";
  }

  function handleSubmitForm(e: Event) {
    e.preventDefault();
    if (!canSubmit || !videoFile) return;
    onSubmit({
      title: title.trim(),
      description: description.trim(),
      requiredEquipment,
      accessKind,
      categoryIds: selectedCategoryIds,
      muxVideoQuality,
      muxMaxResolutionTier,
      staticRendition,
      file: videoFile,
    });
  }

  // Reset form when uploader indicates success
  $effect(() => {
    if (uploadStatus === "ready") {
      title = "";
      description = "";
      videoFile = null;
      selectedCategoryIds = [];
      requiredEquipment = ["mat"];
      accessKind = "macroflow";
    }
  });
</script>

<div class="video-upload-form">
  {#if uploadStatus === "ready"}
    <Notice tone="success">הווידאו הועלה בהצלחה! מעבדים אותו עכשיו — יופיע בספריה תוך כמה דקות.</Notice>
  {:else if uploadStatus === "processing"}
    <div class="upload-processing-notice">
      <span class="material-symbols-rounded spinner">sync</span>
      <p>הקובץ הועלה בהצלחה. מעבדים בשרתי Mux...</p>
    </div>
  {:else if uploadStatus === "error" || fileError || categoryError}
    <Notice tone="danger">{uploadError || fileError || categoryError}</Notice>
  {/if}

  <form onsubmit={handleSubmitForm}>
    <div class="uploader-grid">
      <!-- Left Column: Media File & Equipment Picker -->
      <div class="uploader-column">
        <label class="file-drop" class:has-file={Boolean(videoFile)}>
          <input type="file" accept="video/*" onchange={onFileSelect} disabled={uploadStatus === "uploading"} />
          {#if videoFile}
            <div class="file-selected-indicator">
              <span class="material-symbols-rounded success-icon">check_circle</span>
              <span class="file-name">{videoFile.name}</span>
              <span class="file-size">{(videoFile.size / (1024 * 1024)).toFixed(1)} MB</span>
            </div>
          {:else}
            <span class="material-symbols-rounded drop-icon">video_library</span>
            <span class="drop-text">גררי קובץ וידאו לכאן<br /><small>או לחצי לבחירה מהמחשב</small></span>
          {/if}
        </label>

        {#if uploadStatus === "uploading"}
          <div class="progress-container">
            <div class="progress-meta">
              <span>מעלה קובץ...</span>
              <span>{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} max={100} label={`העלאה ${uploadProgress}%`} />
          </div>
        {/if}

        <div class="form-field-group">
          <label class="form-field-label" for="equipment">
            <span class="material-symbols-rounded">fitness_center</span>
            ציוד נדרש לשיעור
          </label>
          <EquipmentPicker
            bind:selected={requiredEquipment}
            disabled={uploadStatus === "uploading"}
          />
        </div>
      </div>

      <!-- Right Column: Details & Access Settings -->
      <div class="uploader-column">
        <label class="field">
          <span class="field__label">כותרת השיעור</span>
          <input bind:value={title} required maxlength="120" placeholder="למשל: יסודות הרפורמר למתחילות" disabled={uploadStatus === "uploading"} />
        </label>

        <label class="field">
          <span class="field__label">תיאור קצר</span>
          <textarea bind:value={description} rows="3" maxlength="500" placeholder="ספרי למתאמנות מה נעשה בשיעור זה..." disabled={uploadStatus === "uploading"}></textarea>
        </label>

        <div class="form-field-group">
          <label class="form-field-label" for="access">
            <span class="material-symbols-rounded">key</span>
            מודל גישה לספרייה
          </label>
          <RadioGroup
            bind:value={accessKind}
            options={accessOptions}
            orientation="horizontal"
            class="studio-choice-grid"
          />
        </div>

        <!-- Category Picker -->
        <div class="form-field-group">
          <label class="form-field-label" for="categories">
            <span class="material-symbols-rounded">folder_open</span>
            שיוך לקטגוריות
            <span class="count-badge">{selectedCategoryIds.length}</span>
          </label>

          {#if categories.length === 0}
            <Notice tone="neutral">אין קטגוריות זמינות. צרי קטגוריה ראשונה למטה.</Notice>
          {:else}
            <div class="category-grid">
              {#each categories as category (category._id)}
                <button
                  class:selected={selectedCategoryIds.includes(category._id)}
                  class="category-token"
                  type="button"
                  onclick={() => toggleCategory(category._id)}
                  disabled={uploadStatus === "uploading"}
                >
                  <span>{category.name}</span>
                </button>
              {/each}
            </div>
          {/if}

          <div class="new-category-input-row">
            <input
              type="text"
              bind:value={newCategoryName}
              placeholder="שם קטגוריה חדשה..."
              disabled={creatingCategory || uploadStatus === "uploading"}
            />
            <Button
              tone="paper"
              type="button"
              onclick={handleAddCategory}
              disabled={creatingCategory || !newCategoryName.trim() || uploadStatus === "uploading"}
            >
              הוסף
            </Button>
          </div>
        </div>

        <!-- Collapsible Advanced Settings -->
        <div class="advanced-collapsible-wrapper">
          <button
            type="button"
            class="advanced-toggle"
            onclick={() => (showAdvanced = !showAdvanced)}
          >
            <span>הגדרות קידוד מתקדמות (Mux)</span>
            <span class="material-symbols-rounded arrow-icon" class:rotated={showAdvanced}>expand_more</span>
          </button>

          {#if showAdvanced}
            <div transition:slide={{ duration: 250 }} class="advanced-content">
              <div class="advanced-grid">
                <div class="field">
                  <Select label="איכות עיבוד וידאו" bind:value={muxVideoQuality} options={qualityOptions} />
                </div>

                <div class="field">
                  <Select label="רזולוציה מקסימלית" bind:value={muxMaxResolutionTier} options={maxResolutionOptions} />
                </div>

                <div class="field">
                  <Select label="הורדת MP4 סטטית" bind:value={staticRendition} options={staticRenditionOptions} />
                </div>
              </div>
            </div>
          {/if}
        </div>

        <div class="submit-action-row">
          <Button
            tone="ink"
            type="submit"
            disabled={!canSubmit || uploadStatus === "uploading"}
            class="upload-submit-button"
          >
            {#if uploadStatus === "uploading"}
              מעלה קובץ...
            {:else if uploadStatus === "processing"}
              מעבד בשרת...
            {:else}
              <span class="material-symbols-rounded">cloud_upload</span>
              התחילי העלאה לספריה
            {/if}
          </Button>
        </div>
      </div>
    </div>
  </form>
</div>

<style>
  .video-upload-form {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  .uploader-grid {
    display: grid;
    grid-template-columns: minmax(320px, 1fr) minmax(360px, 1.2fr);
    gap: var(--space-6);
  }

  .uploader-column {
    display: flex;
    flex-direction: column;
    gap: var(--space-5);
  }

  .file-drop {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border: 2px dashed var(--line);
    background: var(--surface-warm);
    padding: var(--space-8) var(--space-6);
    text-align: center;
    cursor: pointer;
    min-height: 180px;
    position: relative;
    overflow: hidden;
    transition: border-color var(--duration-fast), background var(--duration-fast);
  }

  .file-drop:hover {
    border-color: var(--sky-strong);
    background: color-mix(in oklch, var(--sky) 6%, var(--surface-warm));
  }

  .file-drop.has-file {
    border-style: solid;
    border-color: var(--ink);
    background: var(--white);
  }

  .file-drop input {
    position: absolute;
    inset: 0;
    opacity: 0;
    cursor: pointer;
  }

  .drop-icon {
    font-size: var(--step-4);
    color: var(--muted);
    margin-bottom: var(--space-2);
  }

  .drop-text {
    font-size: var(--step-0);
    line-height: 1.4;
    color: var(--ink);
  }

  .drop-text small {
    color: var(--muted);
    font-size: var(--step--1);
  }

  .file-selected-indicator {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-1);
    animation: popIn var(--duration-fast) ease-out;
  }

  .success-icon {
    color: var(--terra);
    font-size: var(--step-4);
  }

  .file-name {
    font-weight: 800;
    font-size: var(--step-0);
    word-break: break-all;
    max-width: 280px;
  }

  .file-size {
    font-family: var(--font-mono);
    font-size: var(--step--1);
    color: var(--muted);
  }

  .progress-container {
    background: var(--surface);
    border: var(--border);
    padding: var(--space-3);
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .progress-meta {
    display: flex;
    justify-content: space-between;
    font-family: var(--font-mono);
    font-size: var(--step--1);
    font-weight: 800;
  }

  .form-field-group {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .form-field-label {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    font-weight: 800;
    font-size: var(--step-0);
  }

  .form-field-label .material-symbols-rounded {
    font-size: var(--step-1);
    color: var(--muted);
  }

  .count-badge {
    background: var(--ink);
    color: var(--white);
    font-family: var(--font-mono);
    font-size: var(--step--2);
    padding: 2px 6px;
    border-radius: 12px;
    margin-right: auto;
  }

  .category-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
    gap: var(--space-2);
    max-height: 140px;
    overflow-y: auto;
    border: var(--border);
    padding: var(--space-2);
    background: var(--white);
  }

  .category-token {
    background: var(--surface);
    border: var(--border);
    padding: var(--space-1) var(--space-2);
    font-size: var(--step--1);
    font-weight: 700;
    text-align: center;
    cursor: pointer;
    transition: background var(--duration-fast), border-color var(--duration-fast);
  }

  .category-token:hover {
    background: var(--surface-warm);
  }

  .category-token.selected {
    background: var(--sky);
    border-color: var(--ink);
  }

  .new-category-input-row {
    display: flex;
    gap: var(--space-2);
  }

  .new-category-input-row input {
    flex: 1;
    border: var(--border);
    padding: 0 var(--space-3);
    font-size: var(--step--1);
  }

  .advanced-collapsible-wrapper {
    border: var(--border);
    background: var(--white);
  }

  .advanced-toggle {
    width: 100%;
    background: var(--surface);
    border: none;
    border-bottom: var(--border);
    padding: var(--space-3);
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-weight: 800;
    cursor: pointer;
    font-size: var(--step--1);
  }

  .arrow-icon {
    transition: transform var(--duration-fast);
  }

  .arrow-icon.rotated {
    transform: rotate(180deg);
  }

  .advanced-content {
    padding: var(--space-4);
  }

  .advanced-grid {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .submit-action-row {
    margin-top: var(--space-2);
  }

  :global(.upload-submit-button) {
    width: 100%;
    display: flex !important;
    align-items: center;
    justify-content: center;
    gap: var(--space-2);
    font-size: var(--step-0) !important;
    padding: var(--space-4) !important;
  }

  .upload-processing-notice {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    border: var(--border);
    background: var(--surface);
    padding: var(--space-4);
    font-weight: 700;
  }

  .spinner {
    animation: spin 2s linear infinite;
    color: var(--terra);
  }

  @keyframes spin {
    to { transform: rotate(-360deg); }
  }

  @keyframes popIn {
    from { transform: scale(0.9); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
  }

  @media (max-width: 768px) {
    .uploader-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
