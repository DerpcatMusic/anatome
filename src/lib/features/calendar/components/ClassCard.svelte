<script lang="ts">
  import { Button } from "bits-ui";
  import type { Id } from "$convex/_generated/dataModel";
  import type { FunctionReturnType } from "convex/server";
  import { api } from "$convex/_generated/api";
  import { useI18n } from "$lib/i18n/runes.svelte";
  import { liveRoomHref } from "$lib/i18n/context";
  import { CREDITS_PURCHASE_ENABLED } from "$lib/features/subscriptions/featureFlags";
  import type { TypeFilter } from "../lib/agenda";
  import InstructorAvatar from "./InstructorAvatar.svelte";
  import "../styles/cal-time.css";
  import "../styles/agenda-card.css";

  type CalendarClass = FunctionReturnType<typeof api.live.calendar.listRange>[number];

  let {
    item,
    typeFilter = "all",
    actionId,
    nowMs,
    onReserve,
    onCancel,
    onBuyCredits,
  }: {
    item: CalendarClass;
    typeFilter?: TypeFilter;
    actionId: string | null;
    nowMs: number;
    onReserve: (liveClassId: Id<"liveClasses">) => void;
    onCancel: (liveClassId: Id<"liveClasses">) => void;
    onBuyCredits?: () => void;
  } = $props();

  const { t } = useI18n();

  const timeFormatter = new Intl.DateTimeFormat("he-IL", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jerusalem",
  });

  function statusInfo(item: CalendarClass) {
    if (item.viewerReservationStatus === "reserved" || item.viewerReservationStatus === "joined") {
      return { label: t.calendar.status.reserved(), emphasis: true, live: false };
    }
    if (item.liveClass.status === "live") {
      return { label: t.calendar.status.nowLive(), emphasis: false, live: true };
    }
    if (item.seatsRemaining <= 0) {
      return { label: t.calendar.status.full(), emphasis: false, live: false };
    }
    if (item.viewerMissingEquipment.length > 0) {
      return { label: t.calendar.status.missingEquipmentShort(), emphasis: false, live: false };
    }
    if (item.viewerAvailableCredits < item.liveClass.creditCost) {
      return { label: t.calendar.status.notEnoughCredits(), emphasis: false, live: false };
    }
    return null;
  }

  function rsvpText(item: CalendarClass, now: number): string | null {
    const closesAt = item.liveClass.joinClosesAt;
    const diffMs = closesAt - now;
    if (diffMs <= 0 || diffMs > 1000 * 60 * 60) return null;
    const diffMinutes = Math.max(1, Math.floor(diffMs / (1000 * 60)));
    return t.calendar.class.registrationClosesMinutes({ minutes: diffMinutes });
  }

  const status = $derived(statusInfo(item));
  const rsvp = $derived(rsvpText(item, nowMs));
  const showStatusBadge = $derived(status !== null && (status.emphasis || status.live));

  const isPrivate = $derived(item.liveClass.type === "one_on_one");
  const lacksCredits = $derived(item.viewerAvailableCredits < item.liveClass.creditCost);
  const isPrivateCreditBlocked = $derived(isPrivate && lacksCredits);
  const showSeats = $derived(item.liveClass.capacity > 1);
</script>

<article
  class="agenda-card agenda-card--list cal-time"
  class:agenda-card--private={isPrivate}
  class:agenda-card--group={!isPrivate}
  class:agenda-card--disabled={isPrivateCreditBlocked && !item.viewerCanJoin}
>
  <div class="agenda-card__row">
    <div class="agenda-card__time">
      <span class="agenda-card__start">{timeFormatter.format(new Date(item.liveClass.startsAt))}</span>
      <span class="agenda-card__end">{timeFormatter.format(new Date(item.liveClass.endsAt))}</span>
    </div>

    <div class="agenda-card__identity">
      <InstructorAvatar
        name={item.instructorDisplayName}
        avatarUrl={item.instructorAvatarUrl}
        size={36}
      />
    </div>

    <div class="agenda-card__main">
      <div class="agenda-card__title-row">
        <h3>{item.liveClass.title}</h3>
        {#if showStatusBadge && status}
          <span
            class="agenda-status-badge"
            class:agenda-status-badge--emphasis={status.emphasis}
            class:agenda-status-badge--live={status.live && !isPrivate}
            class:agenda-status-badge--live-private={status.live && isPrivate}
          >
            {status.label}
          </span>
        {/if}
      </div>

      {#if !isPrivate || showSeats || (status && !showStatusBadge)}
        <p class="agenda-card__meta-line">
          {#if !isPrivate}
            <span>{item.instructorDisplayName}</span>
          {/if}
          {#if showSeats}
            {#if !isPrivate}
              <span class="agenda-card__meta-sep" aria-hidden="true">·</span>
            {/if}
            <span class="agenda-card__meta-strong">
              {item.seatsRemaining}/{item.liveClass.capacity}
            </span>
          {/if}
          {#if status && !showStatusBadge}
            <span class="agenda-card__meta-sep" aria-hidden="true">·</span>
            <span>{status.label}</span>
          {/if}
        </p>
      {/if}

      {#if rsvp}
        <p class="agenda-card__rsvp agenda-card__rsvp--urgent">{rsvp}</p>
      {/if}
    </div>

    <div class="agenda-card__action">
      {#if item.viewerCanJoin}
        <Button.Root
          class="hb-button hb-button--sm hb-button--{item.liveClass.type === 'one_on_one' ? 'primary' : 'secondary'}"
          href={liveRoomHref(item.liveClass._id)}
        >
          {item.viewerIsWalkIn ? t.calendar.class.joinWalkIn() : t.calendar.class.join()}
        </Button.Root>
      {:else if item.viewerReservationStatus === "reserved" || item.viewerReservationStatus === "joined"}
        <Button.Root
          class="hb-button hb-button--paper hb-button--sm"
          type="button"
          onclick={() => onCancel(item.liveClass._id)}
          disabled={actionId === item.liveClass._id}
        >
          {t.calendar.class.cancel()}
        </Button.Root>
      {:else if lacksCredits && CREDITS_PURCHASE_ENABLED && onBuyCredits}
        <Button.Root class="hb-button hb-button--ink hb-button--sm" type="button" onclick={onBuyCredits}>
          רכישת קרדיטים
        </Button.Root>
      {:else if isPrivateCreditBlocked}
        <Button.Root class="hb-button hb-button--paper hb-button--sm" type="button" disabled>
          {t.calendar.class.noCredits()}
        </Button.Root>
      {:else}
        <Button.Root
          class="hb-button hb-button--sm {isPrivate ? 'hb-button--primary' : 'hb-button--secondary'}"
          type="button"
          onclick={() => onReserve(item.liveClass._id)}
          disabled={!item.viewerCanReserve || actionId === item.liveClass._id}
        >
          {t.calendar.class.reserve()}
        </Button.Root>
      {/if}
    </div>
  </div>
</article>
