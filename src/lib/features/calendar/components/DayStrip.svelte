<script lang="ts">
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
</script>

<div class="day-strip" role="tablist" aria-label="בחירת יום">
  {#each days as { date }}
    <button
      type="button"
      role="tab"
      class="day-pill"
      class:day-pill--active={date === selectedDay}
      aria-selected={date === selectedDay}
      onclick={() => onSelect(date)}
    >
      <span class="day-pill__name">{dayName(date)}</span>
      <span class="day-pill__num">{dayNum(date)}</span>
    </button>
  {/each}
</div>

<style>
  .day-strip {
    display: flex;
    gap: var(--space-2);
    overflow-x: auto;
    padding-block: var(--space-1);
    scrollbar-width: none;
  }

  .day-strip::-webkit-scrollbar {
    display: none;
  }

  .day-pill {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px;
    min-width: 52px;
    height: 56px;
    padding: var(--space-2);
    border: var(--border);
    background: var(--white);
    color: var(--ink);
    font: inherit;
    cursor: pointer;
    border-radius: 0;
    transition:
      background var(--duration-fast) var(--ease-out),
      border-color var(--duration-fast) var(--ease-out),
      border-radius 0.35s cubic-bezier(0.34, 1.8, 0.64, 1);
    flex-shrink: 0;
  }

  .day-pill:hover {
    background: var(--surface);
    border-color: var(--sky-strong);
  }

  .day-pill--active {
    background: var(--sky-soft);
    border-color: var(--sky-strong);
    border-radius: 12px;
  }

  .day-pill__name {
    font-size: var(--step--2);
    font-weight: 700;
    color: var(--muted);
    text-transform: uppercase;
    line-height: 1;
  }

  .day-pill--active .day-pill__name {
    color: var(--sky-strong);
  }

  .day-pill__num {
    font-family: var(--font-mono);
    font-size: var(--step-0);
    font-weight: 800;
    line-height: 1;
  }
</style>
