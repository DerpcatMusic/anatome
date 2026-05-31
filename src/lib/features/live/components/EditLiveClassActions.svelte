<script lang="ts">
  import { Button } from "bits-ui";

  interface Props {
    isPopover: boolean;
    status: "scheduled" | "live" | "ended" | "draft" | "cancelled";
    submitting: boolean;
    onEndLive?: () => void;
    onDelete: () => void;
    onCancel: () => void;
  }

  let {
    isPopover,
    status,
    submitting,
    onEndLive,
    onDelete,
    onCancel,
  }: Props = $props();
</script>

<div class="modal-actions" class:modal-actions--popover={isPopover}>
  {#if status === "live"}
    <Button.Root class="hb-button hb-button--ink" type="button" onclick={onEndLive} disabled={submitting}>
      לסיים שידור
    </Button.Root>
    {#if !isPopover}
      <span class="live-badge"><span class="live-dot"></span>שידור חי פעיל</span>
    {/if}
  {:else}
    <Button.Root class="hb-button hb-button--ink" type="submit" disabled={submitting}>
      {submitting ? "מעדכן..." : isPopover ? "שמירה" : "שמירת שינויים"}
    </Button.Root>
    <Button.Root class="hb-button hb-button--danger" type="button" onclick={onDelete} disabled={submitting}>
      ביטול שיעור
    </Button.Root>
  {/if}
  <Button.Root class="hb-button hb-button--ghost" type="button" onclick={onCancel} disabled={submitting}>
    {isPopover ? "סגירה" : "סגור"}
  </Button.Root>
</div>

<style>
  .modal-actions {
    display: flex;
    gap: var(--space-2);
    padding-top: var(--space-3);
    align-items: center;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .modal-actions--popover {
    padding-top: var(--space-2);
    margin-top: var(--space-1);
    border-top: 1px solid var(--line-light);
    position: static;
    background: inherit;
    justify-content: flex-end;
  }

  .live-badge {
    font-family: var(--font-mono);
    font-size: var(--step--1);
    font-weight: 800;
    color: var(--primary);
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
  }

  .live-dot {
    width: 8px;
    height: 8px;
    background: var(--primary);
    border-radius: 50%;
    display: inline-block;
  }
</style>
