<script lang="ts">
  import Button from "$components/ui/Button.svelte";
  import type { Id } from "$convex/_generated/dataModel";
  import type { FunctionReturnType } from "convex/server";
  import { api } from "$convex/_generated/api";
  import { useI18n } from "$lib/i18n/runes.svelte";
  import { classTypeLabel, creditLabel } from "$lib/labels";
  import { liveRoomHref } from "$lib/i18n/context";

  type CalendarClass = FunctionReturnType<typeof api.customerLive.listCalendarRange>[number];

  let {
    item,
    actionId,
    onReserve,
    onCancel,
  }: {
    item: CalendarClass;
    actionId: string | null;
    onReserve: (liveClassId: Id<"liveClasses">) => void;
    onCancel: (liveClassId: Id<"liveClasses">) => void;
  } = $props();

  const { t } = useI18n();

  const timeFormatter = new Intl.DateTimeFormat("he-IL", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jerusalem",
  });

  function statusInfo(item: CalendarClass) {
    if (item.viewerReservationStatus === "reserved" || item.viewerReservationStatus === "joined") {
      return { label: t.calendar.status.reserved(), tone: "success" as const };
    }
    if (item.liveClass.status === "live") {
      return { label: t.calendar.status.nowLive(), tone: "terra" as const };
    }
    if (item.seatsRemaining <= 0) {
      return { label: t.calendar.status.full(), tone: "muted" as const };
    }
    if (item.viewerMissingEquipment.length > 0) {
      return { label: t.calendar.status.missingEquipmentShort(), tone: "muted" as const };
    }
    if (item.viewerAvailableCredits < item.liveClass.creditCost) {
      return { label: t.calendar.status.notEnoughCredits(), tone: "muted" as const };
    }
    return { label: t.calendar.status.open(), tone: "sky" as const };
  }

  function rsvpText(item: CalendarClass): string | null {
    const now = Date.now();
    const closesAt = item.liveClass.joinClosesAt;
    if (closesAt <= now) return "ההרשמה נסגרה";
    const diffMs = closesAt - now;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    if (diffMinutes < 60) return `נסגרת בעוד ${diffMinutes} דקות`;
    if (diffHours < 24) return `נסגרת בעוד ${diffHours} שעות`;
    return null;
  }

  const info = $derived(statusInfo(item));
  const rsvp = $derived(rsvpText(item));
</script>

<article class="class-card">
  <div class="class-card__time">
    <span class="class-card__start">{timeFormatter.format(new Date(item.liveClass.startsAt))}</span>
    <span class="class-card__end">{timeFormatter.format(new Date(item.liveClass.endsAt))}</span>
  </div>

  <div class="class-card__body">
    <div class="class-card__main">
      <div class="class-card__title-row">
        <h3>{item.liveClass.title}</h3>
        <span class="status-badge status-badge--{info.tone}">{info.label}</span>
      </div>

      <div class="class-card__meta">
        <span class="meta-tag meta-tag--type">{classTypeLabel(item.liveClass.type)}</span>
        <span class="meta-tag">{creditLabel(item.liveClass.creditKind)}</span>
        {#if item.liveClass.capacity > 1}
          <span class="meta-tag">{item.seatsRemaining} / {item.liveClass.capacity}</span>
        {/if}
        {#if rsvp}
          <span class="meta-tag meta-tag--rsvp" class:meta-tag--urgent={info.tone === "sky" && item.liveClass.joinClosesAt - Date.now() < 1000 * 60 * 60}>
            {rsvp}
          </span>
        {/if}
      </div>
    </div>

    <div class="class-card__action">
      {#if item.viewerCanJoin}
        {#if item.viewerIsWalkIn}
          <Button tone="terra" size="sm" href={liveRoomHref(item.liveClass._id)}>
            {t.calendar.class.joinWalkIn()}
          </Button>
        {:else}
          <Button tone="terra" size="sm" href={liveRoomHref(item.liveClass._id)}>
            {t.calendar.class.join()}
          </Button>
        {/if}
      {:else if item.viewerReservationStatus === "reserved" || item.viewerReservationStatus === "joined"}
        <Button type="button" tone="paper" size="sm" onclick={() => onCancel(item.liveClass._id)} disabled={actionId === item.liveClass._id}>
          {t.calendar.class.cancel()}
        </Button>
      {:else}
        <Button
          type="button"
          tone={info.tone === "sky" ? "ink" : "paper"}
          size="sm"
          onclick={() => onReserve(item.liveClass._id)}
          disabled={!item.viewerCanReserve || actionId === item.liveClass._id}
        >
          {t.calendar.class.reserve()}
        </Button>
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
    transition: background var(--duration-fast);
  }

  .class-card:hover {
    background: color-mix(in srgb, var(--sky-soft) 30%, var(--white));
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

  .status-badge--sky {
    background: var(--sky-soft);
    color: var(--sky-strong);
  }

  .status-badge--terra {
    background: var(--terra-soft);
    color: var(--terra-strong);
  }

  .status-badge--success {
    background: var(--success-bg);
    color: var(--success-text);
  }

  .status-badge--muted {
    background: var(--surface);
    color: var(--muted);
  }

  .class-card__meta {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-2);
    min-width: 0;
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

  .meta-tag--rsvp {
    color: var(--muted);
    font-size: var(--step--2);
  }

  .meta-tag--urgent {
    color: var(--terra-strong);
    font-weight: 800;
  }

  .class-card__action {
    flex-shrink: 0;
  }

  .class-card__action :global(button) {
    min-width: 100px;
  }

  @media (max-width: 680px) {
    .class-card {
      grid-template-columns: 1fr;
      gap: var(--space-3);
      padding: var(--space-3);
    }

    .class-card__time {
      flex-direction: row;
      gap: var(--space-2);
      justify-content: flex-start;
    }

    .class-card__body {
      flex-direction: column;
      align-items: stretch;
      gap: var(--space-3);
    }

    .class-card__title-row h3 {
      white-space: normal;
    }
  }
</style>
