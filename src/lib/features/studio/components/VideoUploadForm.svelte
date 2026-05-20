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
  import { TextareaAutosize } from "runed";
  import "./VideoUploadForm.css";

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
  let descEl = $state<HTMLTextAreaElement | null>(null);
  const descAutosize = new TextareaAutosize({ element: () => descEl ?? undefined, input: () => description });
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
          <textarea bind:value={description} bind:this={descEl} maxlength="500" placeholder="ספרי למתאמנות מה נעשה בשיעור זה..." disabled={uploadStatus === "uploading"}></textarea>
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

