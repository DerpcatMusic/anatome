<script lang="ts">
  import { Button } from "bits-ui";
  import type { FunctionReturnType } from "convex/server";
  import { api } from "$convex/_generated/api";

  type OpenSlot = FunctionReturnType<typeof api.oneOnOne.customer.listAvailableSlots>[number];

  let {
    slot,
    actionId,
    onBook,
    onBuyCredits,
  }: {
    slot: OpenSlot;
    actionId: string | null;
    onBook: (slot: OpenSlot) => void;
    onBuyCredits: () => void;
  } = $props();

  const timeFormatter = new Intl.DateTimeFormat("he-IL", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jerusalem",
  });

  const slotKey = $derived(`${slot.instructorUserId}-${slot.startsAt}`);
  const hasCredits = $derived(slot.availableCredits >= 1);
</script>

<article class="class-card class-card--open-slot">
  <div class="class-card__time">
    <span class="class-card__start">{timeFormatter.format(new Date(slot.startsAt))}</span>
    <span class="class-card__end">{timeFormatter.format(new Date(slot.endsAt))}</span>
  </div>

  <div class="class-card__body">
    <div class="class-card__main">
      <div class="class-card__title-row">
        <h3>שיעור 1:1 אישי</h3>
        <span class="status-badge status-badge--violet">חלון פתוח</span>
      </div>

      <div class="class-card__meta">
        <span class="meta-tag meta-tag--type meta-tag--one-on-one">1:1</span>
        <span class="meta-tag">קרדיט 1:1 אחד</span>
        {#if !hasCredits}
          <span class="meta-tag meta-tag--urgent">אין קרדיטים זמינים</span>
        {/if}
      </div>
    </div>

    <div class="class-card__action">
      {#if hasCredits}
        <Button.Root
          class="hb-button hb-button--violet hb-button--sm"
          type="button"
          onclick={() => onBook(slot)}
          disabled={actionId === slotKey}
        >
          {actionId === slotKey ? "מזמינה..." : "הזמנה מיידית"}
        </Button.Root>
      {:else}
        <Button.Root class="hb-button hb-button--ink hb-button--sm" type="button" onclick={onBuyCredits}>
          רכישת קרדיטים
        </Button.Root>
      {/if}
    </div>
  </div>
</article>

<style>
  .class-card {
    display: grid;
    grid-template-columns: 72px 1fr;
    align-items: center;
    gap: var(--space-4);
    padding: var(--space-3) var(--space-4);
    background: var(--white);
    border-bottom: 1px solid var(--line-light);
  }

  .class-card--open-slot {
    border-inline-start: 3px solid var(--violet-strong);
    background: color-mix(in srgb, var(--violet-soft) 18%, var(--white));
  }

  .class-card__time {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    font-family: var(--font-mono);
    text-align: center;
  }

  .class-card__start {
    font-size: var(--step-1);
    font-weight: 800;
    line-height: 1;
  }

  .class-card__end {
    font-size: var(--step--2);
    color: var(--muted);
    font-weight: 700;
  }

  .class-card__body {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    min-width: 0;
  }

  .class-card__main {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    min-width: 0;
    flex: 1;
  }

  .class-card__title-row {
    display: flex;
    align-items: baseline;
    gap: var(--space-3);
    min-width: 0;
  }

  .class-card__title-row h3 {
    font-size: var(--step-0);
    line-height: 1.2;
    margin: 0;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .status-badge {
    flex-shrink: 0;
    font-size: var(--step--2);
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    padding: 2px 8px;
    border-radius: 4px;
    white-space: nowrap;
  }

  .status-badge--violet {
    background: var(--violet-soft);
    color: var(--violet-strong);
  }

  .class-card__meta {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-2);
  }

  .meta-tag {
    font-size: var(--step--1);
    color: var(--muted);
    font-weight: 600;
    white-space: nowrap;
  }

  .meta-tag--type {
    color: var(--ink);
    font-weight: 700;
  }

  .meta-tag--one-on-one {
    color: var(--violet-strong);
    font-weight: 800;
  }

  .meta-tag--urgent {
    color: var(--violet-strong);
    font-weight: 800;
  }

  .class-card__action {
    flex-shrink: 0;
  }
</style>
