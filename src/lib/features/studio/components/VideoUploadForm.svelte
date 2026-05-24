<script lang="ts">
  import "@mux/mux-uploader";
  import { api } from "$convex/_generated/api";
  import type { Id } from "$convex/_generated/dataModel";
  import { useConvexClient } from "convex-svelte";
  import { Button, Checkbox, RadioGroup, Progress } from "bits-ui";
  import Notice from "$components/ui/Notice.svelte";
  import EquipmentPicker from "$components/ui/EquipmentPicker.svelte";

  type AccessKind = "macroflow" | "microflow";

  interface Props {
    categories: Array<{ _id: Id<"videoCategories">; name: string }>;
    onComplete: () => void;
    onCancel: () => void;
  }

  let { categories, onComplete, onCancel }: Props = $props();

  const client = useConvexClient();

  // ── Form state ──
  let title = $state("");
  let description = $state("");
  let accessKind = $state<AccessKind>("macroflow");
  let selectedCategoryIds = $state<Id<"videoCategories">[]>([]);
  let requiredEquipment = $state<string[]>(["mat"]);
  let file = $state<File | null>(null);
  let isDragOver = $state(false);

  // ── Validation state ──
  let titleError = $state<string | null>(null);
  let categoryError = $state<string | null>(null);
  let fileError = $state<string | null>(null);

  // ── Upload state ──
  let step = $state<"idle" | "uploading" | "success" | "error">("idle");
  let progress = $state(0);
  let uploadErrorMsg = $state("");

  // ── Mux uploader engine (hidden) ──
  let muxUploader = $state<HTMLElement | null>(null);

  // ── Derived ──
  const canSubmit = $derived(
    file !== null &&
      title.trim().length >= 3 &&
      selectedCategoryIds.length > 0 &&
      step !== "uploading"
  );

  const accessOptions = [
    {
      value: "macroflow" as const,
      label: "רכישה חד-פעמית",
      description: "הלקוחה רוכשת גישה קבועה לשיעור באמצעות קרדיט.",
    },
    {
      value: "microflow" as const,
      label: "מנוי בלבד",
      description: "זמין למנויות פעילות ללא צריכת קרדיט.",
    },
  ];

  // ── Wire mux-uploader events ──
  $effect(() => {
    if (!muxUploader) return;

    const onProgress = (e: CustomEvent<number>) => {
      progress = e.detail;
    };
    const onSuccess = () => {
      step = "success";
    };
    const onError = (e: CustomEvent<{ message?: string }>) => {
      step = "error";
      uploadErrorMsg = e.detail?.message ?? "העלאה נכשלה";
    };

    muxUploader.addEventListener("progress", onProgress as EventListener);
    muxUploader.addEventListener("success", onSuccess as EventListener);
    muxUploader.addEventListener("uploaderror", onError as EventListener);

    return () => {
      muxUploader!.removeEventListener("progress", onProgress as EventListener);
      muxUploader!.removeEventListener("success", onSuccess as EventListener);
      muxUploader!.removeEventListener("uploaderror", onError as EventListener);
    };
  });

  // ── Validation ──
  function validate(): boolean {
    titleError = title.trim().length >= 3 ? null : "הכותרת חייבת להכיל לפחות 3 תווים";
    categoryError = selectedCategoryIds.length > 0 ? null : "נדרשת לפחות קטגוריה אחת";
    fileError = file !== null ? null : "יש לבחור קובץ וידאו";
    return titleError === null && categoryError === null && fileError === null;
  }

  // ── File handling ──
  function handleDrop(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    isDragOver = false;
    const dropped = e.dataTransfer?.files?.[0];
    if (!dropped) return;
    if (!dropped.type.startsWith("video/")) {
      fileError = "יש לבחור קובץ וידאו בלבד";
      return;
    }
    if (dropped.size > 2 * 1024 * 1024 * 1024) {
      fileError = "הקובץ גדול מ-2GB. צריך לדחוס או לחתוך.";
      return;
    }
    file = dropped;
    fileError = null;
  }

  function handleDragOver(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    isDragOver = true;
  }

  function handleDragLeave(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    isDragOver = false;
  }

  function handleFileInput(e: Event) {
    const input = e.target as HTMLInputElement;
    const selected = input.files?.[0];
    if (selected) {
      if (selected.size > 2 * 1024 * 1024 * 1024) {
        fileError = "הקובץ גדול מ-2GB. צריך לדחוס או לחתוך.";
        input.value = "";
        return;
      }
      file = selected;
      fileError = null;
    }
    input.value = "";
  }

  function clearFile() {
    file = null;
    if (muxUploader) (muxUploader as any).file = null;
  }

  // ── Category handling ──
  function toggleCategory(id: Id<"videoCategories">) {
    selectedCategoryIds = selectedCategoryIds.includes(id)
      ? selectedCategoryIds.filter((c) => c !== id)
      : [...selectedCategoryIds, id];
    categoryError = null;
  }

  // ── Submit ──
  async function handleSubmit(e: Event) {
    e.preventDefault();
    if (!validate() || !muxUploader || !file) return;

    step = "uploading";
    progress = 0;
    uploadErrorMsg = "";

    try {
      const result = await client.action(api.video.uploads.requestUpload, {
        title: title.trim(),
        description: description.trim(),
        requiredEquipment: requiredEquipment as any,
        accessKind,
        categoryIds: selectedCategoryIds,
        muxVideoQuality: "plus",
        muxMaxResolutionTier: "1080p",
        staticRendition: "none",
      });

      if (!result?.uploadUrl) throw new Error("לא קיבלנו כתובת העלאה מהשרת");

      (muxUploader as any).endpoint = result.uploadUrl;
      (muxUploader as any).file = file;
    } catch (reason) {
      step = "error";
      uploadErrorMsg = reason instanceof Error ? reason.message : "התחלת ההעלאה נכשלה";
    }
  }

  function handleReset() {
    title = "";
    description = "";
    accessKind = "macroflow";
    selectedCategoryIds = [];
    requiredEquipment = ["mat"];
    file = null;
    step = "idle";
    progress = 0;
    uploadErrorMsg = "";
    titleError = null;
    categoryError = null;
    fileError = null;
    if (muxUploader) {
      (muxUploader as any).file = null;
      (muxUploader as any).endpoint = null;
    }
  }
</script>

<!-- Hidden Mux upload engine -->
<mux-uploader bind:this={muxUploader} style="display: none;"></mux-uploader>

<form class="upload-form" onsubmit={handleSubmit}>
  <!-- File -->
  {#if !file}
    <div
      class="drop-zone"
      class:active={isDragOver}
      ondragover={handleDragOver}
      ondragleave={handleDragLeave}
      ondrop={handleDrop}
      role="region"
      aria-label="אזור גרירת קובץ וידאו"
    >
      <span class="material-symbols-rounded drop-icon">video_file</span>
      <div class="drop-text">
        <strong>גררי קובץ וידאו לכאן</strong>
        <span>או לחצי לבחירה מהמחשב · עד 2GB</span>
      </div>
      <label class="browse-wrap">
        <Button.Root class="hb-button hb-button--ink" type="button">בחירת קובץ</Button.Root>
        <input type="file" accept="video/*" onchange={handleFileInput} />
      </label>
      {#if fileError}
        <span class="field-error">{fileError}</span>
      {/if}
    </div>
  {:else}
    <div class="file-chip">
      <span class="material-symbols-rounded file-chip__icon">movie</span>
      <span class="file-chip__name">{file.name}</span>
      <span class="file-chip__meta">{(file.size / (1024 * 1024)).toFixed(1)} MB</span>
      <Button.Root
        class="hb-button hb-button--icon hb-button--icon-danger"
        type="button"
        onclick={clearFile}
        aria-label="הסרת קובץ"
      >
        <span class="material-symbols-rounded">close</span>
      </Button.Root>
    </div>
  {/if}

  <!-- Title -->
  <label class="field" class:invalid={titleError !== null}>
    <span class="field-label">כותרת השיעור <span class="required">*</span></span>
    <input
      type="text"
      bind:value={title}
      placeholder="למשל: יסודות הרפורמר למתחילות"
      maxlength="120"
      disabled={step === "uploading"}
    />
    {#if titleError}
      <span class="field-error">{titleError}</span>
    {/if}
  </label>

  <!-- Description -->
  <label class="field">
    <span class="field-label">תיאור השיעור</span>
    <textarea
      bind:value={description}
      placeholder="ספרי למתאמנות מה נעשה בשיעור זה..."
      maxlength="500"
      rows="2"
      disabled={step === "uploading"}
    ></textarea>
  </label>

  <!-- Access Model -->
  <div class="field-group">
    <span class="field-label">מודל גישה <span class="required">*</span></span>
    <RadioGroup.Root bind:value={accessKind} orientation="horizontal" class="hb-choice-grid">
      {#each accessOptions as option}
        <RadioGroup.Item value={option.value} class="hb-choice access-choice">
          <span class="hb-choice__title">{option.label}</span>
          <span class="hb-choice__description">{option.description}</span>
        </RadioGroup.Item>
      {/each}
    </RadioGroup.Root>
  </div>

  <!-- Categories / Tags -->
  <div class="field-group" class:invalid={categoryError !== null}>
    <span class="field-label">
      קטגוריות
      <span class="required">*</span>
      {#if selectedCategoryIds.length > 0}
        <span class="count-pill">{selectedCategoryIds.length}</span>
      {/if}
    </span>
    {#if categories.length === 0}
      <Notice tone="neutral">אין קטגוריות זמינות.</Notice>
    {:else}
      <div class="category-wrap">
        {#each categories as cat (cat._id)}
          <Checkbox.Root
            class="hb-choice tag-choice"
            checked={selectedCategoryIds.includes(cat._id)}
            onchange={() => toggleCategory(cat._id)}
            disabled={step === "uploading"}
          >
            <span class="hb-choice__title">{cat.name}</span>
          </Checkbox.Root>
        {/each}
      </div>
    {/if}
    {#if categoryError}
      <span class="field-error">{categoryError}</span>
    {/if}
  </div>

  <!-- Equipment -->
  <div class="field-group">
    <EquipmentPicker bind:selected={requiredEquipment} compact disabled={step === "uploading"} />
  </div>

  <!-- Status -->
  {#if step === "uploading"}
    <div class="status-box uploading">
      <div class="status-header">
        <span>מעלה קובץ...</span>
        <span class="status-percent">{Math.round(progress)}%</span>
      </div>
      <Progress.Root class="progress-track" value={progress} max={100}>
        <div class="progress-fill" style:width="{progress}%"></div>
      </Progress.Root>
    </div>
  {:else if step === "success"}
    <div class="status-box success">
      <span class="material-symbols-rounded status-icon">check_circle</span>
      <div class="status-text">
        <strong>השיעור הועלה בהצלחה</strong>
        <span>יופיע בספריה לאחר עיבוד (כ־2–5 דקות)</span>
      </div>
    </div>
  {:else if step === "error"}
    <div class="status-box error">
      <span class="material-symbols-rounded status-icon">error</span>
      <span class="status-text">{uploadErrorMsg}</span>
    </div>
  {/if}

  <!-- Actions -->
  <div class="actions">
    {#if step === "success"}
      <Button.Root class="hb-button hb-button--paper" type="button" onclick={handleReset}>
        העלאת שיעור נוסף
      </Button.Root>
      <Button.Root class="hb-button hb-button--ink" type="button" onclick={onComplete}>
        סיום
      </Button.Root>
    {:else}
      <Button.Root
        class="hb-button hb-button--ghost"
        type="button"
        onclick={onCancel}
        disabled={step === "uploading"}
      >
        ביטול
      </Button.Root>
      <Button.Root
        class="hb-button hb-button--ink"
        type="submit"
        disabled={!canSubmit || step === "uploading"}
      >
        {#if step === "uploading"}
          מעלה...
        {:else}
          העלאה לספריה
        {/if}
      </Button.Root>
    {/if}
  </div>
</form>
