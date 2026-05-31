<script lang="ts">
  import { Checkbox, RadioGroup } from "bits-ui";
  import Notice from "$components/ui/Notice.svelte";
  import EquipmentPicker from "$components/ui/EquipmentPicker.svelte";
  import { videoAccessLabel, type VideoAccessKind } from "$lib/labels";
  import type { Id } from "$convex/_generated/dataModel";

  interface Props {
    title?: string;
    description?: string;
    accessKind?: VideoAccessKind;
    selectedCategoryIds?: Id<"videoCategories">[];
    requiredEquipment?: string[];
    categories: Array<{ _id: Id<"videoCategories">; name: string }>;
    isBusy: boolean;
    titleError: string | null;
    categoryError: string | null;
  }

  let {
    title = $bindable(""),
    description = $bindable(""),
    accessKind = $bindable<VideoAccessKind>("macroflow"),
    selectedCategoryIds = $bindable<Id<"videoCategories">[]>([]),
    requiredEquipment = $bindable<string[]>(["mat"]),
    categories,
    isBusy,
    titleError,
    categoryError,
  }: Props = $props();

  const accessOptions = [
    {
      value: "macroflow" as const,
      label: videoAccessLabel("macroflow"),
      description: "קרדיט — גישה לצמיתות.",
    },
    {
      value: "microflow" as const,
      label: videoAccessLabel("microflow"),
      description: "למנויות פעילות.",
    },
  ];

  function toggleCategory(id: Id<"videoCategories">) {
    selectedCategoryIds = selectedCategoryIds.includes(id)
      ? selectedCategoryIds.filter((c) => c !== id)
      : [...selectedCategoryIds, id];
    categoryError = null;
  }

  const makeCategoryToggleHandler = (id: Id<"videoCategories">) => () => toggleCategory(id);
</script>

<div class="upload-form__body">
  <div class="upload-form__primary">
    <label class="field" class:invalid={titleError !== null}>
      <span class="field-label">כותרת השיעור <span class="required" aria-hidden="true">*</span></span>
      <input
        type="text"
        bind:value={title}
        placeholder="לדוגמה: יסודות רפורמר למתחילות"
        maxlength="120"
        disabled={isBusy}
        autocomplete="off"
      />
      {#if titleError}
        <span class="field-error" role="alert">{titleError}</span>
      {/if}
    </label>

    <label class="field">
      <span class="field-label">תיאור (אופציונלי)</span>
      <textarea
        bind:value={description}
        placeholder="מה נעשה בשיעור? למי הוא מתאים?"
        maxlength="500"
        rows="3"
        disabled={isBusy}
      ></textarea>
    </label>
  </div>

  <div class="upload-form__meta">
    <div class="field-group access-grid">
      <span class="field-label">איך לקוחות יגיעו לשיעור? <span class="required" aria-hidden="true">*</span></span>
      <RadioGroup.Root bind:value={accessKind} orientation="horizontal" class="hb-choice-grid">
        {#each accessOptions as option (option.value)}
          <RadioGroup.Item value={option.value} class="hb-choice" disabled={isBusy}>
            <span class="hb-choice__title">{option.label}</span>
            <span class="hb-choice__description">{option.description}</span>
          </RadioGroup.Item>
        {/each}
      </RadioGroup.Root>
    </div>

    <div class="field-group" class:invalid={categoryError !== null}>
      <span class="field-label">
        קטגוריות
        <span class="required" aria-hidden="true">*</span>
        {#if selectedCategoryIds.length > 0}
          <span class="count-pill">{selectedCategoryIds.length}</span>
        {/if}
      </span>
      {#if categories.length === 0}
        <Notice tone="neutral">עדיין אין קטגוריות במערכת. פני למנהלת להוספה.</Notice>
      {:else}
        <div class="category-grid">
          {#each categories as cat (cat._id)}
            <Checkbox.Root
              class="hb-choice"
              checked={selectedCategoryIds.includes(cat._id)}
              onchange={makeCategoryToggleHandler(cat._id)}
              disabled={isBusy}
            >
              <span class="hb-choice__title">{cat.name}</span>
            </Checkbox.Root>
          {/each}
        </div>
      {/if}
      {#if categoryError}
        <span class="field-error" role="alert">{categoryError}</span>
      {/if}
    </div>

    <div class="field-group equipment-section">
      <EquipmentPicker bind:selected={requiredEquipment} label="ציוד בשיעור" disabled={isBusy} />
    </div>
  </div>
</div>
