<script lang="ts">
  import { Button } from "bits-ui";
  import { TextareaAutosize } from "runed";

  interface Props {
    isPopover: boolean;
    showDescription: boolean;
    editDescription?: string;
    submitting: boolean;
    onShowDescription: () => void;
  }

  let {
    isPopover,
    showDescription,
    editDescription = $bindable(""),
    submitting,
    onShowDescription,
  }: Props = $props();

  let descEl: HTMLTextAreaElement | null = $state(null);
  const _descAutosize = new TextareaAutosize({
    element: () => descEl ?? undefined,
    input: () => editDescription,
  });
</script>

<div class="form-field">
  {#if isPopover && !showDescription}
    <Button.Root
      class="hb-button hb-button--ghost edit-desc-toggle"
      type="button"
      disabled={submitting}
      onclick={onShowDescription}
    >
      <span class="material-symbols-rounded" aria-hidden="true">add</span>
      תיאור (אופציונלי)
    </Button.Root>
  {:else if !isPopover || showDescription}
    <label class="field-label" for="edit-desc">
      תיאור <span class="field-optional">(אופציונלי)</span>
    </label>
    <textarea
      id="edit-desc"
      class="hb-textarea"
      class:edit-desc--popover={isPopover}
      bind:value={editDescription}
      bind:this={descEl}
      disabled={submitting}
      maxlength="500"
      rows="2"
      placeholder="פרטים על קצב השיעור, מיקוד גופני או דגשים..."
    ></textarea>
  {/if}
</div>

<style>
  .form-field {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }

  .field-label {
    font-weight: 800;
    font-size: var(--step--1);
    color: var(--ink);
  }

  .field-optional {
    font-weight: 600;
    color: var(--foreground-muted);
  }

  :global(.edit-desc-toggle) {
    justify-content: flex-start;
    padding-inline: 0;
    min-height: 32px;
  }

  .edit-desc--popover {
    min-height: 3.5rem;
    resize: vertical;
  }
</style>
