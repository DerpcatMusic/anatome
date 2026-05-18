<script lang="ts">
  import type { Id } from "../../../convex/_generated/dataModel";

  type LiveClass = {
    _id: Id<"liveClasses">;
    title: string;
    description: string;
    status: "scheduled" | "live" | "ended" | "draft" | "cancelled";
    startsAt: number;
    endsAt: number;
    capacity: number;
    type: "group_live" | "one_on_one";
    requiredEquipment: string[];
  };

  let {
    classes,
    onStart,
    onEnd,
    actionId,
  }: {
    classes: LiveClass[];
    onStart: (id: Id<"liveClasses">) => void;
    onEnd: (id: Id<"liveClasses">) => void;
    actionId: string | null;
  } = $props();

  const hebrewDays = ["א", "ב", "ג", "ד", "ה", "ו", "ש"];

  const dayFormatter = new Intl.DateTimeFormat("he-IL", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "Asia/Jerusalem",
  });

  const timeFormatter = new Intl.DateTimeFormat("he-IL", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jerusalem",
  });

  function getDayStart(ts: number) {
    const d = new Date(ts);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  }

  function getWeekStart(ts: number) {
    const d = new Date(ts);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday.getTime();
  }

  const now = Date.now();
  const weekStart = $derived(getWeekStart(now));

  const weekDays = $derived(
    Array.from({ length: 7 }, (_, i) => {
      const start = weekStart + i * 24 * 60 * 60 * 1000;
      return {
        start,
        label: dayFormatter.format(new Date(start)),
        dayIndex: (new Date(start).getDay() + 6) % 7, // 0=Monday for Hebrew
        isToday: getDayStart(start) === getDayStart(now),
      };
    })
  );

  const classesByDay = $derived(() => {
    const map = new Map<number, LiveClass[]>();
    for (const day of weekDays) {
      const dayEnd = day.start + 24 * 60 * 60 * 1000;
      map.set(
        day.start,
        classes
          .filter((c) => c.startsAt >= day.start && c.startsAt < dayEnd)
          .sort((a, b) => a.startsAt - b.startsAt)
      );
    }
    return map;
  });

  function statusClass(status: string) {
    if (status === "live") return "status--live";
    if (status === "scheduled") return "status--scheduled";
    if (status === "ended") return "status--ended";
    return "status--other";
  }

  function statusDot(status: string) {
    if (status === "live") return "●";
    if (status === "scheduled") return "○";
    return "·";
  }
</script>

<div class="agenda">
  <div class="agenda-header">
    <p class="eyebrow">Weekly Schedule</p>
    <h2>לוח שבועי</h2>
  </div>

  <div class="agenda-grid">
    {#each weekDays as day}
      {@const dayClasses = classesByDay().get(day.start) ?? []}
      <div class="day-col" class:today={day.isToday}>
        <div class="day-header">
          <span class="day-name">{hebrewDays[day.dayIndex]}</span>
          <span class="day-date">{day.label}</span>
        </div>
        <div class="day-classes">
          {#if dayClasses.length === 0}
            <div class="day-empty">—</div>
          {:else}
            {#each dayClasses as liveClass}
              <article class="class-card {statusClass(liveClass.status)}">
                <div class="class-time">
                  <span class="dot">{statusDot(liveClass.status)}</span>
                  <span>{timeFormatter.format(new Date(liveClass.startsAt))}</span>
                </div>
                <h4 class="class-title">{liveClass.title}</h4>
                <p class="class-meta">
                  {liveClass.capacity} מקומות ·
                  {liveClass.type === "one_on_one" ? "1:1" : "קבוצתי"}
                </p>
                <div class="class-actions">
                  {#if liveClass.status === "scheduled"}
                    <button
                      class="btn btn--ink"
                      onclick={() => onStart(liveClass._id)}
                      disabled={actionId === liveClass._id}
                    >
                      {actionId === liveClass._id ? "..." : "התחל"}
                    </button>
                  {:else if liveClass.status === "live"}
                    <a class="btn btn--sky" href={`/live-room?classId=${liveClass._id}`}>חדר</a>
                    <button
                      class="btn btn--danger"
                      onclick={() => onEnd(liveClass._id)}
                      disabled={actionId === liveClass._id}
                    >
                      סיים
                    </button>
                  {:else}
                    <span class="status-label">{liveClass.status}</span>
                  {/if}
                </div>
              </article>
            {/each}
          {/if}
        </div>
      </div>
    {/each}
  </div>
</div>

<style>
  .agenda {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  .agenda-header {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .agenda-header h2 {
    font-size: var(--step-2);
    line-height: 1.1;
    margin: 0;
  }

  .eyebrow {
    font-family: var(--font-mono);
    font-size: var(--step--1);
    color: var(--muted);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    font-weight: 700;
    margin: 0;
  }

  .agenda-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: var(--space-2);
    border: var(--border);
    background: var(--white);
    padding: var(--space-3);
  }

  .day-col {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    min-width: 0;
  }

  .day-col.today .day-header {
    background: var(--sky);
    border-color: var(--ink);
  }

  .day-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-1);
    padding: var(--space-3) var(--space-2);
    border: var(--border);
    background: var(--surface);
    text-align: center;
  }

  .day-name {
    font-family: var(--font-mono);
    font-size: var(--step-1);
    font-weight: 900;
    line-height: 1;
  }

  .day-date {
    font-size: var(--step--2);
    color: var(--muted);
    font-weight: 700;
  }

  .day-classes {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    flex: 1;
  }

  .day-empty {
    text-align: center;
    color: var(--line-light);
    padding: var(--space-4) 0;
    font-family: var(--font-mono);
    font-size: var(--step-1);
  }

  .class-card {
    border: var(--border);
    padding: var(--space-3);
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    background: var(--white);
    transition: box-shadow var(--duration-fast);
  }

  .class-card:hover {
    box-shadow: 3px 3px 0 var(--ink);
  }

  .class-time {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    font-family: var(--font-mono);
    font-size: var(--step--2);
    font-weight: 800;
  }

  .dot {
    font-size: var(--step-0);
    line-height: 1;
  }

  .status--live .dot { color: #188038; }
  .status--scheduled .dot { color: var(--sky-strong); }
  .status--ended .dot { color: var(--muted); }

  .class-title {
    font-size: var(--step-0);
    line-height: 1.2;
    margin: 0;
    font-weight: 800;
  }

  .class-meta {
    font-size: var(--step--2);
    color: var(--muted);
    margin: 0;
    font-family: var(--font-mono);
  }

  .class-actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-1);
    margin-top: auto;
  }

  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 28px;
    padding-inline: var(--space-3);
    border: var(--border);
    font: inherit;
    font-size: var(--step--2);
    font-weight: 900;
    cursor: pointer;
    text-decoration: none;
    transition: background var(--duration-fast);
  }

  .btn--ink {
    background: var(--ink);
    color: var(--white);
  }

  .btn--ink:hover { background: var(--ink-secondary); }

  .btn--sky {
    background: var(--sky);
    color: var(--ink);
  }

  .btn--sky:hover {
    background: var(--sky-strong);
    color: var(--white);
  }

  .btn--danger {
    background: #fef2f2;
    color: #b42318;
    border-color: #fecaca;
  }

  .btn--danger:hover { background: #fee2e2; }

  .btn:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }

  .status-label {
    font-size: var(--step--2);
    color: var(--muted);
    font-family: var(--font-mono);
    font-weight: 700;
    text-transform: uppercase;
    padding: var(--space-1) 0;
  }

  /* Mobile: horizontal scroll */
  @media (max-width: 1200px) {
    .agenda-grid {
      grid-template-columns: repeat(7, minmax(160px, 1fr));
      overflow-x: auto;
      padding-bottom: var(--space-4);
    }
  }

  @media (max-width: 640px) {
    .agenda-grid {
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
    }

    .day-col {
      gap: var(--space-2);
    }

    .day-header {
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
    }

    .day-classes {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: var(--space-2);
    }
  }
</style>
