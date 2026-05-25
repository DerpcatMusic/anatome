<script lang="ts">
  import ClassCard from "./ClassCard.svelte";
  import OneOnOneDayCard from "./OneOnOneDayCard.svelte";
  import type { Id } from "$convex/_generated/dataModel";
  import type { AgendaEntry, DayAgendaGroup, TypeFilter } from "../lib/agenda";
  import { formatAgendaDayHeader } from "../lib/agenda";

  let {
    paneTitle,
    paneVariant,
    groups,
    listTypeFilter,
    emptyText,
    actionId,
    nowMs,
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
    onReserve: (liveClassId: Id<"liveClasses">) => void;
    onCancel: (liveClassId: Id<"liveClasses">) => void;
    onOpenOneOnOneRequest?: (dayStart: number) => void;
    onBuyCredits?: () => void;
  } = $props();

  function entryKey(entry: AgendaEntry): string {
    if (entry.kind === "class") return entry.item.liveClass._id;
    return `day-${entry.window.dayStart}-${entry.window.instructorUserId}`;
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

  {#if groups.length === 0}
    <p class="agenda-pane__empty">{emptyText}</p>
  {:else}
    <div class="agenda-pane__stream">
      {#each groups as group (group.dayStart)}
        <div class="agenda-pane__day-block">
          <h3 class="agenda-pane__day">{formatAgendaDayHeader(group.dayStart)}</h3>
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
                    window={entry.window}
                    onOpenRequest={onOpenOneOnOneRequest}
                    {onBuyCredits}
                  />
                {/if}
              </li>
            {/each}
          </ul>
        </div>
      {/each}
    </div>
  {/if}
</section>
