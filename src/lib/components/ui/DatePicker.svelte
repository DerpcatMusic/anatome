<script lang="ts">
  import { DatePicker } from "bits-ui";
  import { CalendarDate, type DateValue } from "@internationalized/date";
  import { appDateParts } from "$lib/datetime/local";

  let {
    value = $bindable<DateValue | undefined>(undefined),
    label,
    disabled = false,
    onchange,
  }: {
    value?: DateValue | undefined;
    label: string;
    disabled?: boolean;
    onchange?: (value: DateValue | undefined) => void;
  } = $props();

  function updateValue(next: DateValue | undefined) {
    value = next;
    onchange?.(next);
  }

  function initPlaceholder() {
    const today = appDateParts();
    return new CalendarDate(today.year, today.month, today.day);
  }
</script>

<div class="hb-date-picker">
  <span class="hb-date-picker__label">{label}</span>
  <DatePicker.Root {value} placeholder={initPlaceholder()} onValueChange={updateValue}>
    <DatePicker.Trigger class="hb-date-picker__trigger" {disabled}>
      {#snippet child({ props })}
        <button {...props} type="button" class="hb-date-picker__trigger">
          <span class="hb-date-picker__value">
            {value ? value.toString() : "בחרו תאריך"}
          </span>
          <span class="material-symbols-rounded" aria-hidden="true">calendar_today</span>
        </button>
      {/snippet}
    </DatePicker.Trigger>
    <DatePicker.Portal>
      <DatePicker.Content class="hb-date-picker__content">
        {#snippet child({ wrapperProps, props, open })}
          {#if open}
            <div {...wrapperProps}>
              <div {...props}>
                <DatePicker.Calendar class="hb-calendar">
                  {#snippet child({ props: calProps, months })}
                    <div {...calProps}>
                      <DatePicker.Header class="hb-calendar__header">
                        <DatePicker.PrevButton class="hb-calendar__nav">
                          <span class="material-symbols-rounded">chevron_right</span>
                        </DatePicker.PrevButton>
                        <DatePicker.Heading class="hb-calendar__heading" />
                        <DatePicker.NextButton class="hb-calendar__nav">
                          <span class="material-symbols-rounded">chevron_left</span>
                        </DatePicker.NextButton>
                      </DatePicker.Header>
                      <DatePicker.Grid class="hb-calendar__grid">
                        <DatePicker.GridHead>
                          <DatePicker.GridRow class="hb-calendar__row">
                            {#each ["א", "ב", "ג", "ד", "ה", "ו", "ש"] as day}
                              <DatePicker.HeadCell class="hb-calendar__head-cell">{day}</DatePicker.HeadCell>
                            {/each}
                          </DatePicker.GridRow>
                        </DatePicker.GridHead>
                        <DatePicker.GridBody>
                          {#each months[0].weeks as week}
                            <DatePicker.GridRow class="hb-calendar__row">
                              {#each week as date}
                                <DatePicker.Cell {date} month={months[0].value}>
                                  <DatePicker.Day class="hb-calendar__day" />
                                </DatePicker.Cell>
                              {/each}
                            </DatePicker.GridRow>
                          {/each}
                        </DatePicker.GridBody>
                      </DatePicker.Grid>
                    </div>
                  {/snippet}
                </DatePicker.Calendar>
              </div>
            </div>
          {/if}
        {/snippet}
      </DatePicker.Content>
    </DatePicker.Portal>
  </DatePicker.Root>
</div>
