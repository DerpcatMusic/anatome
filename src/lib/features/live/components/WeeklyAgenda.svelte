<script lang="ts">
  import { Calendar } from "@event-calendar/core";
  import "@event-calendar/core/index.css";
  import "$features/live/styles/calendar-theme.css";

  import type { Id } from "$convex/_generated/dataModel";
  import type { FunctionReturnType } from "convex/server";
  import { api } from "$convex/_generated/api";
  import { theme } from "$features/app/theme.svelte";
  import type { SelectionAnchor } from "$features/live/types/selection-anchor";
  import type { PaintedSlots } from "$features/studio/lib/one-on-one-availability";
  import {
    useWeeklyAgendaCalendar,
    type CalendarHandle,
    type LiveClass,
    type ClassTypeFilter,
  } from "./weekly-agenda-calendar.svelte";

  interface Props {
    classes: LiveClass[];
    /** Live-class rows only; availability blocks always show in every mode. */
    typeFilter?: ClassTypeFilter;
    onStart: (id: Id<"liveClasses">) => void;
    onEnd: (id: Id<"liveClasses">) => void;
    actionId: string | null;
    onSelectSlot: (timeLocalString: string, durationMinutes: number, anchor: SelectionAnchor) => void;
    onEventClick: (liveClass: LiveClass, anchor: SelectionAnchor) => void;
    createPreview?: { startsAt: number; endsAt: number; requiredEquipment?: string[] } | null;
    onCreatePreviewChange?: (startsAt: number, endsAt: number) => void;
    availabilityPaintMode?: boolean;
    availabilityPainted?: PaintedSlots;
    onAvailabilityPaintChange?: (painted: PaintedSlots) => void;
    onViewRangeChange?: (start: Date, end: Date) => void;
  }

  let {
    classes,
    typeFilter = "all",
    onStart,
    onEnd,
    actionId,
    onSelectSlot,
    onEventClick,
    createPreview = null,
    onCreatePreviewChange,
    availabilityPaintMode = false,
    availabilityPainted,
    onAvailabilityPaintChange,
    onViewRangeChange,
  }: Props = $props();

  let containerEl: HTMLElement | undefined = $state(undefined);
  let calendarRef: CalendarHandle | undefined = $state(undefined);

  const calendar = useWeeklyAgendaCalendar({
    get classes() {
      return classes;
    },
    get typeFilter() {
      return typeFilter;
    },
    get onSelectSlot() {
      return onSelectSlot;
    },
    get onEventClick() {
      return onEventClick;
    },
    get createPreview() {
      return createPreview;
    },
    get onCreatePreviewChange() {
      return onCreatePreviewChange;
    },
    get availabilityPaintMode() {
      return availabilityPaintMode;
    },
    get availabilityPainted() {
      return availabilityPainted;
    },
    get onAvailabilityPaintChange() {
      return onAvailabilityPaintChange;
    },
    get onViewRangeChange() {
      return onViewRangeChange;
    },
    getContainerEl: () => containerEl,
    getCalendarRef: () => calendarRef,
  });

  /** Clears drag selection highlight and quick-create preview chrome on the grid. */
  export function clearCalendarSelection() {
    calendar.clearCalendarSelection();
  }
</script>

<div
  bind:this={containerEl}
  class="weekly-agenda-container"
  class:ec-dark={theme.isDark}
  class:weekly-agenda-container--availability-paint={availabilityPaintMode}
  class:weekly-agenda-container--panning={calendar.panGesture !== null}
  role="region"
  aria-label="לוח שיעורי לייב"
  onwheel={calendar.handleCalendarWheel}
  onpointerdown={calendar.handleCalendarPointerDown}
  onpointermove={calendar.handleCalendarPointerMove}
  onpointerup={calendar.clearPanGesture}
  onpointercancel={calendar.clearPanGesture}
  onlostpointercapture={calendar.clearPanGesture}
>
  {@render availabilityPaintStrip()}
  {@render dragErrorBanner()}
  <Calendar bind:this={calendarRef} plugins={calendar.plugins} options={calendar.calendarOptions} />
</div>

{#snippet availabilityPaintStrip()}
  {#if availabilityPaintMode}
    <div class="availability-paint-strip" role="status">
      <span class="material-symbols-rounded" aria-hidden="true">gesture</span>
      <span>סימון זמינות 1:1</span>
    </div>
  {/if}
{/snippet}

{#snippet dragErrorBanner()}
  {#if calendar.dragError}
    <div class="drag-error" role="alert">
      <span class="material-symbols-rounded">error</span>
      {calendar.dragError}
    </div>
  {/if}
{/snippet}

<style>
  .weekly-agenda-container {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    width: 100%;
    direction: rtl;
    contain: layout;
  }

  .drag-error {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    margin: 0 var(--space-3) var(--space-2);
    padding: var(--space-2) var(--space-3);
    background: var(--surface);
    color: var(--danger);
    border: 1px solid var(--danger);
    font-weight: 800;
    font-size: var(--step--1);
    flex-shrink: 0;
  }

  .drag-error .material-symbols-rounded {
    font-size: var(--step-1);
    flex-shrink: 0;
  }

  :global(.weekly-agenda-container .ec-highlight) {
    outline: 2px solid var(--accent);
    outline-offset: -1px;
  }

  :global(.weekly-agenda-container .ec-selecting .ec-day) {
    outline: 2px dashed var(--accent);
    outline-offset: -1px;
  }

  :global(.weekly-agenda-container--availability-paint) {
    cursor: crosshair;
  }

  :global(.weekly-agenda-container--availability-paint .ec-body) {
    cursor: crosshair;
  }

  :global(.weekly-agenda-container--panning),
  :global(.weekly-agenda-container--panning .ec),
  :global(.weekly-agenda-container--panning .ec-body) {
    cursor: grabbing;
    user-select: none;
  }

  .availability-paint-strip {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-2);
    min-height: 32px;
    padding: 0 var(--space-3);
    border-bottom: 1px solid color-mix(in oklch, var(--primary) 30%, var(--line-light));
    background: var(--primary);
    color: var(--paper);
    font-size: var(--step--1);
    font-weight: 900;
    letter-spacing: 0;
    flex-shrink: 0;
  }

  .availability-paint-strip .material-symbols-rounded {
    font-size: 1rem;
  }

  :global(.weekly-agenda-container--availability-paint .ec) {
    box-shadow: inset 0 0 0 2px var(--primary);
  }

  :global(.weekly-agenda-container--availability-paint .ec-toolbar),
  :global(.weekly-agenda-container--availability-paint .ec-header) {
    background: color-mix(in oklch, var(--primary) 5%, var(--ec-bg-color));
  }

  :global(.weekly-agenda-container--availability-paint .ec-highlight) {
    outline-color: var(--primary);
    background: color-mix(in oklch, var(--primary) 16%, transparent);
  }

  :global(.weekly-agenda-container--availability-paint .ec-selecting .ec-day) {
    outline-color: var(--primary);
  }

</style>
