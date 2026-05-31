<script lang="ts">
  import { ToggleGroup } from "bits-ui";

  let {
    days,
    selectedDay,
    onSelect,
  }: {
    days: { date: number; label: string }[];
    selectedDay: number;
    onSelect: (date: number) => void;
  } = $props();

  const dayNameFormatter = new Intl.DateTimeFormat("he-IL", {
    weekday: "short",
    timeZone: "Asia/Jerusalem",
  });

  const dayNumFormatter = new Intl.DateTimeFormat("he-IL", {
    day: "numeric",
    timeZone: "Asia/Jerusalem",
  });

  function dayName(ts: number): string {
    return dayNameFormatter.format(new Date(ts));
  }

  function dayNum(ts: number): string {
    return dayNumFormatter.format(new Date(ts));
  }

  function handleValueChange(v: string | undefined) {
    if (v) onSelect(Number(v));
  }
</script>

<ToggleGroup.Root
  type="single"
  value={String(selectedDay)}
  onValueChange={handleValueChange}
  class="day-strip"
  aria-label="בחירת יום"
>
  {#each days as { date } (date)}
    <ToggleGroup.Item value={String(date)} class="day-pill" aria-label={dayName(date)}>
      <span class="day-pill__name">{dayName(date)}</span>
      <span class="day-pill__num">{dayNum(date)}</span>
    </ToggleGroup.Item>
  {/each}
</ToggleGroup.Root>
