<script lang="ts">
  import ClassCard from "./ClassCard.svelte";
  import OneOnOneDayCard from "./OneOnOneDayCard.svelte";
  import type { Id } from "$convex/_generated/dataModel";
  import type { AgendaEntry, CalendarClass, DayAgendaGroup, TypeFilter } from "../lib/agenda";

  let {
    paneTitle,
    paneVariant,
    groups,
    listTypeFilter,
    emptyText,
    actionId,
    nowMs,
    dayHeaders,
    onReserve,
    onCancel,
    onOpenOneOnOneRequest,
    onBuyCredits,
  }: {
    paneTitle: string;
    paneVariant: "group" | "one_on_one";
    groups: DayAgendaGroup[];
    listTypeFilter: TypeFilter;
    emptyText: string;
    actionId: string | null;
    nowMs: number;
    dayHeaders: Record<number, string>;
    onReserve: (liveClassId: Id<"liveClasses">) => void;
    onCancel: (item: CalendarClass) => void;
    onOpenOneOnOneRequest?: (dayStart: number) => void;
    onBuyCredits?: () => void;
  } = $props();

  function entryKey(entry: AgendaEntry): string {
    if (entry.kind === "class") return entry.item.liveClass._id;
    return `day-${entry.dayWindow.dayStart}-${entry.dayWindow.instructorUserId}`;
  }

</script>

<section
  class="agenda-pane"
  class:agenda-pane--group={paneVariant === "group"}
  class:agenda-pane--one-on-one={paneVariant === "one_on_one"}
  aria-label={paneTitle}
>
  <header class="agenda-pane__head">
    <h2 class="agenda-pane__title">{paneTitle}</h2>
  </header>

  {#snippet dayBlock(group: DayAgendaGroup)}
    <div class="agenda-pane__day-block">
      <h3 class="agenda-pane__day">{dayHeaders[group.dayStart] ?? ""}</h3>
      <ul class="agenda-pane__rows">
        {#each group.entries as entry (entryKey(entry))}
          <li>
            {#if entry.kind === "class"}
              <ClassCard
                item={entry.item}
                typeFilter={listTypeFilter}
                {actionId}
                {nowMs}
                onReserve={onReserve}
                onCancel={onCancel}
                {onBuyCredits}
              />
            {:else}
              <OneOnOneDayCard
                dayWindow={entry.dayWindow}
                onOpenRequest={onOpenOneOnOneRequest}
                {onBuyCredits}
              />
            {/if}
          </li>
        {/each}
      </ul>
    </div>
  {/snippet}

  {#if groups.length === 0}
    <p class="agenda-pane__empty">{emptyText}</p>
  {:else}
    <div class="agenda-pane__stream">
      {#each groups as group (group.dayStart)}
        {@render dayBlock(group)}
      {/each}
    </div>
  {/if}
</section>
