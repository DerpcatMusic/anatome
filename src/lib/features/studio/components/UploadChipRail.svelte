<script lang="ts">
  import { Button } from "bits-ui";
  import { horizontalWheelScroll } from "$lib/actions/horizontal-wheel-scroll";

  export type ChipOption = {
    id: string;
    label: string;
    hint?: string;
  };

  let {
    label,
    required = false,
    hint = "",
    options = [],
    selectedIds = $bindable<string[]>([]),
    disabled = false,
    addPlaceholder = "",
    addBusy = false,
    onAdd,
    emptyText = "אין פריטים עדיין",
  }: {
    label: string;
    required?: boolean;
    hint?: string;
    options: ChipOption[];
    selectedIds?: string[];
    disabled?: boolean;
    addPlaceholder?: string;
    addBusy?: boolean;
    onAdd?: (name: string) => void | Promise<void>;
    emptyText?: string;
  } = $props();

  let addValue = $state("");

  function deriveSelectedLabels(options: ChipOption[], selectedIds: string[]) {
    return options.filter((option) => selectedIds.includes(option.id)).map((option) => option.label);
  }

  const selectedLabels = $derived(deriveSelectedLabels(options, selectedIds));

  function toggle(id: string) {
    if (disabled) return;
    selectedIds = selectedIds.includes(id)
      ? selectedIds.filter((value) => value !== id)
      : [...selectedIds, id];
  }

  async function submitAdd() {
    const name = addValue.trim();
    if (!onAdd || name.length < 2) return;
    await onAdd(name);
    addValue = "";
  }

  function handleSubmit(e: Event) {
    e.preventDefault();
    void submitAdd();
  }

  function handleToggle(id: string) {
    toggle(id);
  }

  const makeToggleHandler = (id: string) => () => handleToggle(id);
</script>

<section class="upload-rail" aria-label={label}>
  <div class="upload-rail__head">
    <h3 class="upload-rail__title">
      {label}
      {#if required}
        <span class="upload-rail__required" aria-hidden="true">*</span>
      {/if}
    </h3>
    {#if hint}
      <p class="upload-rail__hint">{hint}</p>
    {/if}
    {#if selectedLabels.length > 0}
      <p class="upload-rail__picked" role="status">
        <span class="upload-rail__picked-label">נבחר:</span>
        {selectedLabels.join(" · ")}
      </p>
    {/if}
  </div>

  {#if onAdd}
    <form
      class="upload-rail__add"
      onsubmit={handleSubmit}
    >
      <input
        type="text"
        class="upload-rail__add-input"
        bind:value={addValue}
        placeholder={addPlaceholder}
        maxlength="80"
        disabled={disabled || addBusy}
        autocomplete="off"
      />
      <Button.Root
        class="hb-button hb-button--ink hb-button--sm"
        type="submit"
        disabled={disabled || addBusy || addValue.trim().length < 2}
      >
        {addBusy ? "…" : "הוספה"}
      </Button.Root>
    </form>
  {/if}

  <div class="upload-rail__track" use:horizontalWheelScroll>
    {#if options.length === 0}
      <p class="upload-rail__empty">{emptyText}</p>
    {:else}
      {#each options as option (option.id)}
        <button
          type="button"
          class="upload-rail__chip"
          class:is-selected={selectedIds.includes(option.id)}
          {disabled}
          aria-pressed={selectedIds.includes(option.id)}
          onclick={makeToggleHandler(option.id)}
        >
          <span class="upload-rail__chip-label">{option.label}</span>
          {#if option.hint}
            <span class="upload-rail__chip-hint">{option.hint}</span>
          {/if}
        </button>
      {/each}
    {/if}
  </div>
</section>
