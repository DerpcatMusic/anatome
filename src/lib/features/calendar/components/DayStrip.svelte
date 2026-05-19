<script lang="ts">
  import { useI18n } from "$lib/i18n/runes.svelte";

  let {
    days,
    selectedDay,
    onSelect,
  }: {
    days: { date: number; label: string }[];
    selectedDay: number;
    onSelect: (date: number) => void;
  } = $props();

  const { t } = useI18n();
</script>

<div class="day-strip" aria-label={t.calendar.daySelect()}>
  {#each days as day}
    <button
      type="button"
      class:day-strip__day--active={day.date === selectedDay}
      class="day-strip__day"
      onclick={() => onSelect(day.date)}
    >
      {day.label}
    </button>
  {/each}
</div>

<style>
  .day-strip {
    display: flex;
    gap: var(--space-2);
    overflow-x: auto;
    padding-block-end: var(--space-2);
  }

  .day-strip__day {
    min-width: 108px;
    min-height: 64px;
    border: var(--border);
    background: var(--white);
    color: var(--ink);
    font: inherit;
    font-weight: 800;
    cursor: pointer;
    transition: background var(--duration-fast);
  }

  .day-strip__day:hover {
    background: var(--surface);
  }

  .day-strip__day--active {
    background: var(--sky);
  }
</style>
