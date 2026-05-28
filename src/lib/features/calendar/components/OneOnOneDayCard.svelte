<script lang="ts">
  import "../styles/cal-time.css";
  import "../styles/agenda-card.css";
  import { Button } from "bits-ui";
  import type { DayAvailability } from "../lib/agenda";
  import {
    formatWallMinutes,
    wallMinutesFromTimestamp,
  } from "../lib/one-on-one-time";
  import { useI18n } from "$lib/i18n/runes.svelte";
  import { CREDITS_PURCHASE_ENABLED } from "$lib/features/subscriptions/featureFlags";
  import InstructorAvatar from "./InstructorAvatar.svelte";

  let {
    window: dayWindow,
    onOpenRequest,
    onBuyCredits,
  }: {
    window: DayAvailability;
    onOpenRequest?: (dayStart: number) => void;
    onBuyCredits?: (pool?: import("$lib/features/credits/types").CreditPool) => void;
  } = $props();

  const { t } = useI18n();

  const hasCredits = $derived(dayWindow.availableCredits >= 1);

  const rangeLabel = $derived.by(() => {
    const start = formatWallMinutes(wallMinutesFromTimestamp(dayWindow.windowStartsAt, dayWindow.dayStart));
    const end = formatWallMinutes(wallMinutesFromTimestamp(dayWindow.windowEndsAt, dayWindow.dayStart));
    return `${start}–${end}`;
  });
</script>

<article
  class="agenda-card agenda-card--list agenda-card--pane-one-on-one cal-time"
  class:agenda-card--disabled={!hasCredits}
  aria-label="{dayWindow.instructorDisplayName}, {rangeLabel}"
>
  <div class="agenda-card__row">
    <div class="agenda-card__time">
      <span class="agenda-card__start">{rangeLabel}</span>
    </div>

    <div class="agenda-card__identity">
      <InstructorAvatar
        name={dayWindow.instructorDisplayName}
        avatarUrl={dayWindow.instructorAvatarUrl}
        size={40}
      />
    </div>

    <div class="agenda-card__main">
      <h3 class="agenda-card__title-only">{dayWindow.instructorDisplayName}</h3>
    </div>

    <div class="agenda-card__action">
      {#if hasCredits && onOpenRequest}
        <Button.Root
          class="hb-button hb-button--primary hb-button--sm"
          type="button"
          onclick={() => onOpenRequest(dayWindow.dayStart)}
        >
          {t.calendar.class.pickTime()}
        </Button.Root>
      {:else if CREDITS_PURCHASE_ENABLED && onBuyCredits}
        <Button.Root
          class="hb-button hb-button--ink hb-button--sm"
          type="button"
          onclick={() => onBuyCredits?.("oneOnOne")}
        >
          {t.calendar.class.noCredits()}
        </Button.Root>
      {:else}
        <Button.Root class="hb-button hb-button--paper hb-button--sm" type="button" disabled>
          {t.calendar.class.noCredits()}
        </Button.Root>
      {/if}
    </div>
  </div>
</article>
