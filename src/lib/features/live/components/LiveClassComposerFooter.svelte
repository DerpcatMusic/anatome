<script lang="ts">
  import { Button } from "bits-ui";

  interface Props {
    confirmCancel: boolean;
    isEdit: boolean;
    editStatus?: "scheduled" | "live" | "ended" | "draft" | "cancelled";
    hasDeleteHandler: boolean;
    pending: boolean;
    submitLabel: string;
    canSubmit: boolean;
    showDismissButton: boolean;
    isPopover: boolean;
    footerColumnCount: number;
    onDismissDeleteConfirm: () => void;
    onConfirmDelete: () => void;
    onEndLive: () => void;
    onRequestDelete: () => void;
    onCancel?: () => void;
  }

  let {
    confirmCancel,
    isEdit,
    editStatus,
    hasDeleteHandler,
    pending,
    submitLabel,
    canSubmit,
    showDismissButton,
    isPopover,
    footerColumnCount,
    onDismissDeleteConfirm,
    onConfirmDelete,
    onEndLive,
    onRequestDelete,
    onCancel,
  }: Props = $props();
</script>

<div
  class="live-composer__footer"
  class:live-composer__footer--popover={isPopover}
  class:live-composer__footer--cols-1={footerColumnCount === 1}
  class:live-composer__footer--cols-2={footerColumnCount === 2}
>
  {#if confirmCancel}
    <p class="live-composer__confirm-text" role="status">
      לבטל את השיעור? ההרשמות יזוכו בקרדיט.
    </p>
    <Button.Root
      class="hb-button hb-button--ghost hb-button--md live-composer__footer-action"
      type="button"
      disabled={pending}
      onclick={onDismissDeleteConfirm}
    >
      חזרה לעריכה
    </Button.Root>
    <Button.Root
      class="hb-button hb-button--danger hb-button--md live-composer__footer-action"
      type="button"
      disabled={pending}
      onclick={onConfirmDelete}
    >
      {pending ? "מבטלת..." : "כן, לבטל"}
    </Button.Root>
  {:else if isEdit && editStatus === "live"}
    <Button.Root
      class="hb-button hb-button--ink hb-button--md live-composer__footer-action"
      type="button"
      disabled={pending}
      onclick={onEndLive}
    >
      לסיים שידור
    </Button.Root>
    {#if hasDeleteHandler}
      <Button.Root
        class="hb-button hb-button--danger hb-button--md live-composer__footer-action"
        type="button"
        disabled={pending}
        onclick={onRequestDelete}
      >
        ביטול שיעור
      </Button.Root>
    {/if}
  {:else}
    <Button.Root
      class="hb-button hb-button--ink hb-button--md live-composer__footer-action"
      type="submit"
      disabled={pending || !canSubmit}
    >
      {submitLabel}
    </Button.Root>
    {#if isEdit && hasDeleteHandler && editStatus === "scheduled"}
      <Button.Root
        class="hb-button hb-button--danger hb-button--md live-composer__footer-action"
        type="button"
        disabled={pending}
        onclick={onRequestDelete}
      >
        ביטול שיעור
      </Button.Root>
    {/if}
    {#if showDismissButton}
      <Button.Root
        class="hb-button hb-button--ghost live-composer__footer-action"
        type="button"
        disabled={pending}
        onclick={onCancel}
      >
        ביטול
      </Button.Root>
    {/if}
  {/if}
</div>

<style>
  .live-composer__footer {
    display: grid;
    gap: var(--space-2);
    align-items: stretch;
    flex-shrink: 0;
    padding-top: var(--space-3);
    margin-top: var(--space-2);
    border-top: 1px solid var(--line-light);
    background: inherit;
  }

  .live-composer__footer--cols-1 {
    grid-template-columns: 1fr;
    justify-items: stretch;
  }

  .live-composer__footer--cols-2 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    column-gap: var(--space-2);
  }

  .live-composer__footer--popover.live-composer__footer--cols-1
    :global(.live-composer__footer-action:only-of-type),
  .live-composer__footer--popover.live-composer__footer--cols-1
    :global(.live-composer__footer-action) {
    grid-column: 1 / -1;
  }

  .live-composer__footer--popover {
    gap: var(--space-2);
    padding: var(--space-4) var(--space-5) var(--space-5);
    margin-top: 0;
    justify-items: stretch;
    width: 100%;
    box-sizing: border-box;
  }

  .live-composer__footer--popover :global(.live-composer__footer-action) {
    display: flex;
    width: 100%;
    max-width: none;
    min-height: 48px;
    margin: 0;
    padding-inline: var(--space-4);
    font-size: var(--step--1);
    box-sizing: border-box;
    justify-content: center;
    align-self: stretch;
  }

  .live-composer__footer:not(.live-composer__footer--popover) {
    grid-auto-flow: column;
    grid-auto-columns: max-content;
    justify-content: end;
  }

  .live-composer__footer:not(.live-composer__footer--popover) :global(.live-composer__footer-action) {
    width: auto;
  }

  .live-composer__confirm-text {
    grid-column: 1 / -1;
    margin: 0 0 var(--space-1);
    font-size: var(--step--1);
    font-weight: 700;
    color: var(--danger);
    line-height: 1.45;
    text-align: center;
  }
</style>
