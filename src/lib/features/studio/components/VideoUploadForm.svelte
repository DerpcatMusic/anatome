<script lang="ts">
  import { slide } from "svelte/transition";
  import type { Id } from "$convex/_generated/dataModel";
  import type { Equipment } from "$lib/labels";
  import { RadioGroup } from "bits-ui";
  import { Progress } from "bits-ui";
  import { Button } from "bits-ui";
  import Notice from "$components/ui/Notice.svelte";
  import EquipmentPicker from "$components/ui/EquipmentPicker.svelte";
  import { Select } from "bits-ui";
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
    onCancel?: () => void;
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
    onCancel,
  }: Props = $props();

  // Form state
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
  let isDragOver = $state(false);
  let videoPreviewUrl = $state<string | null>(null);
  let videoDuration = $state<string | null>(null);

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

  function setVideoFile(file: File) {
    if (file.size > 2 * 1024 * 1024 * 1024) {
      fileError = "הקובץ גדול מ-2GB. צריך לדחוס או לחתוך.";
      videoFile = null;
      videoPreviewUrl = null;
      videoDuration = null;
      return;
    }
    fileError = "";
    videoFile = file;
    videoPreviewUrl = URL.createObjectURL(file);
    // Try to read duration
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      const mins = Math.floor(video.duration / 60);
      const secs = Math.floor(video.duration % 60);
      videoDuration = `${mins}:${String(secs).padStart(2, "0")}`;
      URL.revokeObjectURL(video.src);
    };
    video.src = videoPreviewUrl;
  }

  function onFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      setVideoFile(input.files[0]);
      input.value = "";
    }
  }

  function onDragOver(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    isDragOver = true;
  }

  function onDragLeave(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    isDragOver = false;
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    isDragOver = false;
    const files = e.dataTransfer?.files;
    if (files?.length) {
      const file = files[0];
      if (!file.type.startsWith("video/")) {
        fileError = "יש לגרור קובץ וידאו בלבד.";
        return;
      }
      setVideoFile(file);
    }
  }

  function clearFile() {
    videoFile = null;
    videoPreviewUrl = null;
    videoDuration = null;
    fileError = "";
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

  // Reset form on success
  $effect(() => {
    if (uploadStatus === "ready") {
      title = "";
      description = "";
      videoFile = null;
      videoPreviewUrl = null;
      videoDuration = null;
      selectedCategoryIds = [];
      requiredEquipment = ["mat"];
      accessKind = "macroflow";
    }
  });
</script>

<div class="video-upload-form">
  {#if uploadStatus === "error" || fileError || categoryError}
    <Notice tone="danger">{uploadError || fileError || categoryError}</Notice>
  {/if}

  <form onsubmit={handleSubmitForm}>
    <!-- File Drop Zone -->
    <div
      class="file-drop"
      class:has-file={Boolean(videoFile)}
      class:drag-over={isDragOver}
      ondragover={onDragOver}
      ondragleave={onDragLeave}
      ondrop={onDrop}
      role="region"
      aria-label="אזור גרירת קובץ וידאו"
    >
      {#if videoFile && videoPreviewUrl}
        <div class="preview-wrapper">
          <video src={videoPreviewUrl} controls preload="metadata" class="video-preview" aria-label="תצוגה מקדימה של הקובץ">
            <track kind="captions" src="" label="עברית" srclang="he" default />
          </video>
          <button type="button" class="clear-file" onclick={clearFile} aria-label="הסרת קובץ">
            <span class="material-symbols-rounded">close</span>
          </button>
          <div class="preview-meta">
            <span class="file-name">{videoFile.name}</span>
            <span class="file-detail">{(videoFile.size / (1024 * 1024)).toFixed(1)} MB · {videoDuration ?? "—"}</span>
          </div>
        </div>
      {:else}
        <label class="drop-label">
          <input type="file" accept="video/*" onchange={onFileSelect} disabled={uploadStatus === "uploading"} />
          <span class="material-symbols-rounded drop-icon">video_library</span>
          <span class="drop-text">
            <strong>גררי קובץ וידאו לכאן</strong>
            <span class="drop-hint">או לחצי לבחירה מהמחשב · עד 2GB</span>
          </span>
        </label>
      {/if}
    </div>

    {#if uploadStatus === "uploading"}
      <div class="progress-container">
        <div class="progress-meta">
          <span>מעלה קובץ...</span>
          <span>{uploadProgress}%</span>
        </div>
        <Progress.Root class="hb-progress-track" value={uploadProgress} max={100}>
          <div class="hb-progress-fill" style:width="{uploadProgress}%"></div>
        </Progress.Root>
      </div>
    {:else if uploadStatus === "processing"}
      <div class="processing-bar">
        <span class="material-symbols-rounded spinner">sync</span>
        <span>הקובץ הועלה בהצלחה. מעבדים בשרתי Mux...</span>
      </div>
    {/if}

    <!-- Details -->
    <div class="details-section">
      <label class="field">
        <span class="field__label">כותרת השיעור</span>
        <input bind:value={title} required maxlength="120" placeholder="למשל: יסודות הרפורמר למתחילות" disabled={uploadStatus === "uploading"} />
      </label>

      <label class="field">
        <span class="field__label">תיאור קצר</span>
        <textarea bind:value={description} bind:this={descEl} maxlength="500" placeholder="ספרי למתאמנות מה נעשה בשיעור זה..." disabled={uploadStatus === "uploading"}></textarea>
      </label>

      <!-- Access Model -->
      <div class="form-field-group">
        <div class="form-field-label">
          <span class="material-symbols-rounded">key</span>
          מודל גישה
        </div>
        <RadioGroup.Root bind:value={accessKind} orientation="horizontal" class="hb-choice-grid">
          {#each accessOptions as option}
            <RadioGroup.Item class="hb-choice" value={option.value}>
              <span class="hb-choice__title">{option.label}</span>
              {#if option.description}
                <span class="hb-choice__description">{option.description}</span>
              {/if}
            </RadioGroup.Item>
          {/each}
        </RadioGroup.Root>
      </div>

      <!-- Categories -->
      <div class="form-field-group">
        <div class="form-field-label">
          <span class="material-symbols-rounded">folder_open</span>
          קטגוריות
          <span class="count-badge">{selectedCategoryIds.length}</span>
        </div>

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
                {category.name}
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
          <Button.Root class="hb-button hb-button--paper"
            type="button"
            onclick={handleAddCategory}
            disabled={creatingCategory || !newCategoryName.trim() || uploadStatus === "uploading"}
          >
            הוסף
          </Button.Root>
        </div>
      </div>

      <!-- Equipment -->
      <div class="form-field-group">
        <div class="form-field-label">
          <span class="material-symbols-rounded">fitness_center</span>
          ציוד נדרש
        </div>
        <EquipmentPicker bind:selected={requiredEquipment} disabled={uploadStatus === "uploading"} />
      </div>

      <!-- Advanced -->
      <div class="advanced-collapsible-wrapper">
        <button type="button" class="advanced-toggle" onclick={() => (showAdvanced = !showAdvanced)}>
          <span>הגדרות קידוד מתקדמות (Mux)</span>
          <span class="material-symbols-rounded arrow-icon" class:rotated={showAdvanced}>expand_more</span>
        </button>
        {#if showAdvanced}
          <div transition:slide={{ duration: 200 }} class="advanced-content">
            <div class="advanced-grid">
              <div class="hb-field">
                <span class="hb-field__label">איכות עיבוד וידאו</span>
                <Select.Root
                  type="single"
                  value={muxVideoQuality}
                  onValueChange={(v) => muxVideoQuality = v as MuxVideoQuality}
                  items={qualityOptions.map((o) => ({ value: o.value, label: o.label }))}
                >
                  <Select.Trigger class="hb-select__trigger" aria-label="איכות עיבוד וידאו">
                    <span class="hb-select__value">{qualityOptions.find((o) => o.value === muxVideoQuality)?.label ?? ""}</span>
                    <span class="hb-select__chevron" aria-hidden="true"></span>
                  </Select.Trigger>
                  <Select.Portal>
                    <Select.Content class="hb-select__content" sideOffset={6}>
                      <Select.Viewport class="hb-select__viewport">
                        {#each qualityOptions as option}
                          <Select.Item class="hb-select__item" value={option.value} label={option.label}>
                            {#snippet children({ selected })}
                              <span>{option.label}</span>
                              {#if selected}
                                <span class="hb-select__check" aria-hidden="true"></span>
                              {/if}
                            {/snippet}
                          </Select.Item>
                        {/each}
                      </Select.Viewport>
                    </Select.Content>
                  </Select.Portal>
                </Select.Root>
              </div>
              <div class="hb-field">
                <span class="hb-field__label">רזולוציה מקסימלית</span>
                <Select.Root
                  type="single"
                  value={muxMaxResolutionTier}
                  onValueChange={(v) => muxMaxResolutionTier = v as MuxMaxResolutionTier}
                  items={maxResolutionOptions.map((o) => ({ value: o.value, label: o.label }))}
                >
                  <Select.Trigger class="hb-select__trigger" aria-label="רזולוציה מקסימלית">
                    <span class="hb-select__value">{maxResolutionOptions.find((o) => o.value === muxMaxResolutionTier)?.label ?? ""}</span>
                    <span class="hb-select__chevron" aria-hidden="true"></span>
                  </Select.Trigger>
                  <Select.Portal>
                    <Select.Content class="hb-select__content" sideOffset={6}>
                      <Select.Viewport class="hb-select__viewport">
                        {#each maxResolutionOptions as option}
                          <Select.Item class="hb-select__item" value={option.value} label={option.label}>
                            {#snippet children({ selected })}
                              <span>{option.label}</span>
                              {#if selected}
                                <span class="hb-select__check" aria-hidden="true"></span>
                              {/if}
                            {/snippet}
                          </Select.Item>
                        {/each}
                      </Select.Viewport>
                    </Select.Content>
                  </Select.Portal>
                </Select.Root>
              </div>
              <div class="hb-field">
                <span class="hb-field__label">הורדת MP4 סטטית</span>
                <Select.Root
                  type="single"
                  value={staticRendition}
                  onValueChange={(v) => staticRendition = v as StaticRendition}
                  items={staticRenditionOptions.map((o) => ({ value: o.value, label: o.label }))}
                >
                  <Select.Trigger class="hb-select__trigger" aria-label="הורדת MP4 סטטית">
                    <span class="hb-select__value">{staticRenditionOptions.find((o) => o.value === staticRendition)?.label ?? ""}</span>
                    <span class="hb-select__chevron" aria-hidden="true"></span>
                  </Select.Trigger>
                  <Select.Portal>
                    <Select.Content class="hb-select__content" sideOffset={6}>
                      <Select.Viewport class="hb-select__viewport">
                        {#each staticRenditionOptions as option}
                          <Select.Item class="hb-select__item" value={option.value} label={option.label}>
                            {#snippet children({ selected })}
                              <span>{option.label}</span>
                              {#if selected}
                                <span class="hb-select__check" aria-hidden="true"></span>
                              {/if}
                            {/snippet}
                          </Select.Item>
                        {/each}
                      </Select.Viewport>
                    </Select.Content>
                  </Select.Portal>
                </Select.Root>
              </div>
            </div>
          </div>
        {/if}
      </div>
    </div>

    <!-- Actions -->
    <div class="submit-action-row">
      {#if onCancel}
        <Button.Root class="hb-button hb-button--paper" type="button" onclick={onCancel} disabled={uploadStatus === "uploading"}>
          ביטול
        </Button.Root>
      {/if}
      <Button.Root class="hb-button hb-button--ink upload-submit-button"
        type="submit"
        disabled={!canSubmit || uploadStatus === "uploading"}
        >
        {#if uploadStatus === "uploading"}
          מעלה...
        {:else if uploadStatus === "processing"}
          מעבד...
        {:else}
          <span class="material-symbols-rounded">cloud_upload</span>
          העלאה לספריה
        {/if}
      </Button.Root>
    </div>
  </form>
</div>
