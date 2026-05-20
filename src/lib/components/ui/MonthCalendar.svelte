<script lang="ts">
  import { Calendar } from "bits-ui";
  import { CalendarDate, type DateValue } from "@internationalized/date";

  type EventDot = {
    date: DateValue;
    tone: "sky" | "terra" | "success" | "muted";
  };

  let {
    value = $bindable<DateValue | undefined>(undefined),
    onchange,
    events = [],
  }: {
    value?: DateValue | undefined;
    onchange?: (value: DateValue | undefined) => void;
    events?: EventDot[];
  } = $props();

  function updateValue(next: DateValue | undefined) {
    value = next;
    onchange?.(next);
  }

  function initPlaceholder() {
    const today = new Date();
    return new CalendarDate(today.getFullYear(), today.getMonth() + 1, today.getDate());
  }

  const eventMap = $derived.by(() => {
    const map = new Map<string, string>();
    for (const ev of events) {
      map.set(ev.date.toString(), ev.tone);
    }
    return map;
  });

  function dateKey(d: DateValue): string {
    return d.toString();
  }
</script>

<Calendar.Root
  class="hb-calendar"
  type="single"
  {value}
  onValueChange={updateValue}
  placeholder={initPlaceholder()}
>
  {#snippet child({ props, months })}
    <div {...props}>
      <Calendar.Header class="hb-calendar__header">
        <Calendar.PrevButton class="hb-calendar__nav">
          <span class="material-symbols-rounded">chevron_right</span>
        </Calendar.PrevButton>
        <Calendar.Heading class="hb-calendar__heading" />
        <Calendar.NextButton class="hb-calendar__nav">
          <span class="material-symbols-rounded">chevron_left</span>
        </Calendar.NextButton>
      </Calendar.Header>
      <Calendar.Grid class="hb-calendar__grid">
        <Calendar.GridHead>
          <Calendar.GridRow class="hb-calendar__row">
            {#each ["א", "ב", "ג", "ד", "ה", "ו", "ש"] as day}
              <Calendar.HeadCell class="hb-calendar__head-cell">{day}</Calendar.HeadCell>
            {/each}
          </Calendar.GridRow>
        </Calendar.GridHead>
        <Calendar.GridBody>
          {#each months[0].weeks as week}
            <Calendar.GridRow class="hb-calendar__row">
              {#each week as date}
                <Calendar.Cell {date} month={months[0].value}>
                  <Calendar.Day class="hb-calendar__day hb-calendar__day--with-dots">
                    {#snippet children({ day })}
                      <span class="day-number">{day}</span>
                      {@const tone = eventMap.get(dateKey(date))}
                      {#if tone}
                        <span class="event-dot event-dot--{tone}"></span>
                      {/if}
                    {/snippet}
                  </Calendar.Day>
                </Calendar.Cell>
              {/each}
            </Calendar.GridRow>
          {/each}
        </Calendar.GridBody>
      </Calendar.Grid>
    </div>
  {/snippet}
</Calendar.Root>

<style>
  :global(.hb-calendar__day--with-dots) {
    flex-direction: column;
    gap: 2px;
    padding-bottom: 4px;
  }

  .day-number {
    line-height: 1;
  }

  .event-dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .event-dot--sky {
    background: var(--sky-strong);
  }

  .event-dot--terra {
    background: var(--terra-strong);
  }

  .event-dot--success {
    background: var(--success);
  }

  .event-dot--muted {
    background: var(--muted);
  }
</style>
