<script lang="ts">
  import { Button } from "bits-ui";
  import { durationLabel } from "$lib/labels";
  import { formatAppDate, formatAppTime } from "$lib/datetime/local";
  import type { Id } from "$convex/_generated/dataModel";
  import type { Equipment } from "$lib/labels";

  type LiveClass = {
    _id: Id<"liveClasses">;
    title: string;
    status: "scheduled" | "live" | "ended" | "draft" | "cancelled";
    startsAt: number;
    endsAt: number;
    type: "group_live" | "one_on_one";
  };

  interface Props {
    liveClass: LiveClass;
    isPopover: boolean;
    onCancel: () => void;
    submitting?: boolean;
  }

  let {
    liveClass,
    isPopover,
    onCancel,
    submitting = false,
  }: Props = $props();
</script>

<div class="ended-class-details" class:ended-class-details--popover={isPopover}>
  <div class="read-only-banner">
    <span class="material-symbols-rounded completed-tick">check_circle</span>
    <div class="banner-text">
      <h3>השיעור הושלם בהצלחה</h3>
      <p>שיעורים שהסתיימו נעולים לעריכה מטעמי שלמות היסטוריית אימונים וקרדיטים.</p>
    </div>
  </div>

  <div class="details-section">
    <div class="detail-row">
      <span class="detail-label">שם השיעור:</span>
      <span class="detail-value">{liveClass.title}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">מועד השידור:</span>
      <span class="detail-value">
        {formatAppDate(liveClass.startsAt)} בשעה {formatAppTime(liveClass.startsAt)}
      </span>
    </div>
    <div class="detail-row">
      <span class="detail-label">משך השיעור:</span>
      <span class="detail-value">{durationLabel(Math.round((liveClass.endsAt - liveClass.startsAt) / 60000))}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">סוג שידור:</span>
      <span class="detail-value">{liveClass.type === "one_on_one" ? "אימון אישי 1:1" : "שיעור קבוצתי"}</span>
    </div>
  </div>

  <div class="modal-actions" class:modal-actions--popover={isPopover}>
    <Button.Root class="hb-button hb-button--ink" type="button" onclick={onCancel} disabled={submitting}>
      {isPopover ? "סגירה" : "סגור פרטים"}
    </Button.Root>
  </div>
</div>

<style>
  .ended-class-details {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  .ended-class-details--popover {
    gap: var(--space-2);
    min-height: 0;
  }

  .ended-class-details--popover .read-only-banner {
    padding: var(--space-2);
  }

  .ended-class-details--popover .details-section {
    padding: var(--space-2);
    gap: var(--space-1);
  }

  .read-only-banner {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    background: var(--surface);
    border: var(--border);
    padding: var(--space-3);
    border-radius: 4px;
  }

  .completed-tick {
    font-size: var(--step-3);
    color: var(--foreground-muted);
    flex-shrink: 0;
  }

  .banner-text h3 {
    margin: 0;
    font-size: var(--step-0);
    font-weight: 900;
  }

  .banner-text p {
    margin: 4px 0 0;
    font-size: var(--step--2);
    color: var(--foreground-muted);
    line-height: 1.3;
  }

  .details-section {
    border: var(--border);
    background: var(--elevated);
    padding: var(--space-4);
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    border-radius: 4px;
  }

  .detail-row {
    display: flex;
    justify-content: space-between;
    font-size: var(--step--1);
    border-bottom: 1px dashed var(--line-light);
    padding-bottom: var(--space-1);
    gap: var(--space-2);
  }

  .detail-row:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }

  .detail-label {
    font-weight: 800;
    color: var(--foreground-muted);
  }

  .detail-value {
    font-weight: 900;
    color: var(--ink);
    text-align: end;
  }

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
</style>
