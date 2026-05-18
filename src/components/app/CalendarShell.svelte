<script lang="ts">
  import { api } from "../../../convex/_generated/api";
  import type { FunctionReturnType } from "convex/server";
  import type { Id } from "../../../convex/_generated/dataModel";
  import { useAuthQuery } from "../../lib/convex/useAuthQuery.svelte";
  import { convex } from "../../lib/convex/client";
  import { equipmentLabel, classTypeLabel, creditLabel } from "../../lib/labels";
  import AppLayout from "./AppLayout.svelte";
  import AuthGuard from "./AuthGuard.svelte";
  import PageShell from "./PageShell.svelte";
  import Notice from "../ui/Notice.svelte";

  type CalendarClass = FunctionReturnType<typeof api.liveClasses.listCalendarRange>[number];

  const dayMs = 24 * 60 * 60 * 1000;
  const rangeStart = startOfToday();
  const formatter = new Intl.DateTimeFormat("he-IL", {
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

  let selectedDay = $state(rangeStart);
  let actionId = $state<string | null>(null);
  let actionError = $state("");

  const classesResource = useAuthQuery(api.liveClasses.listCalendarRange, {
    from: rangeStart,
    to: rangeStart + 14 * dayMs,
  }, { initialValue: [] });

  const classes = $derived(classesResource.current ?? []);

  const days = $derived(
    Array.from({ length: 14 }, (_, index) => {
      const date = rangeStart + index * dayMs;
      return { date, label: formatter.format(new Date(date)) };
    }),
  );
  const visibleClasses = $derived(
    classes.filter((item) => {
      const startsAt = item.liveClass.startsAt;
      return startsAt >= selectedDay && startsAt < selectedDay + dayMs;
    }),
  );

  function startOfToday() {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  }

  function statusLabel(item: CalendarClass) {
    if (item.viewerReservationStatus === "reserved" || item.viewerReservationStatus === "joined") return "שמורה לך";
    if (item.liveClass.status === "live") return "עכשיו בלייב";
    if (item.seatsRemaining <= 0) return "מלא";
    if (item.viewerMissingEquipment.length > 0) return "חסר ציוד";
    if (item.viewerAvailableCredits < item.liveClass.creditCost) return "אין מספיק קרדיטים";
    return "פתוח להרשמה";
  }

  async function reserve(liveClassId: Id<"liveClasses">) {
    actionId = liveClassId;
    actionError = "";
    try {
      await convex.mutation(api.liveClasses.reserve, { liveClassId });
      await classesResource.refetch();
    } catch (reason) {
      actionError = reason instanceof Error ? reason.message : "לא הצלחנו לשמור מקום.";
    } finally {
      actionId = null;
    }
  }

  async function cancel(liveClassId: Id<"liveClasses">) {
    actionId = liveClassId;
    actionError = "";
    try {
      await convex.mutation(api.liveClasses.cancelReservation, { liveClassId });
      await classesResource.refetch();
    } catch (reason) {
      actionError = reason instanceof Error ? reason.message : "לא הצלחנו לבטל הרשמה.";
    } finally {
      actionId = null;
    }
  }
</script>

<AppLayout>
  <AuthGuard>
    {#if classesResource.loading}
      <div class="state-card">
        <div class="skeleton skeleton--wide"></div>
        <div class="skeleton"></div>
        <div class="skeleton"></div>
      </div>
    {:else}
      <PageShell
        title="לוח לייבים"
        kicker="HomeBody Live"
        description="הרשמה לשיעור אפשרית רק כשיש קרדיטים פנויים בתוכנית. מקום נשמר ברגע שההרשמה מצליחה."
      >
        {#snippet headerExtra()}
          <button type="button" class="btn btn--ghost" onclick={() => { selectedDay = rangeStart; }}>
            היום
          </button>
        {/snippet}

        {#if classesResource.error || actionError}
          <Notice tone="danger">{classesResource.error?.message ?? actionError}</Notice>
        {/if}

        <div class="day-strip" aria-label="בחירת יום">
        {#each days as day}
          <button
            type="button"
            class:day-strip__day--active={day.date === selectedDay}
            class="day-strip__day"
            onclick={() => { selectedDay = day.date; }}
          >
            {day.label}
          </button>
        {/each}
      </div>

      <div class="agenda" aria-live="polite">
        {#if visibleClasses.length === 0}
          <div class="empty-agenda">
            <p class="empty-agenda__kicker">אין שיעורים ביום הזה</p>
            <p>נסי יום אחר בלוח. כשיעלו לייבים חדשים הם יופיעו כאן.</p>
          </div>
        {:else}
          {#each visibleClasses as item}
            <article class="class-card">
              <div class="class-card__time">
                <span>{timeFormatter.format(new Date(item.liveClass.startsAt))}</span>
                <span>{timeFormatter.format(new Date(item.liveClass.endsAt))}</span>
              </div>

              <div class="class-card__content">
                <div class="class-card__header">
                  <div>
                    <p class="class-card__type">{classTypeLabel(item.liveClass.type)}</p>
                    <h3>{item.liveClass.title}</h3>
                  </div>
                  <span class="class-card__status">{statusLabel(item)}</span>
                </div>

                {#if item.liveClass.description}
                  <p class="class-card__description">{item.liveClass.description}</p>
                {/if}

                <div class="class-card__meta">
                  <span>{creditLabel(item.liveClass.creditKind)}</span>
                  <span>{item.seatsRemaining} מקומות פנויים מתוך {item.liveClass.capacity}</span>
                  {#each item.liveClass.requiredEquipment as equipment}
                    <span>{equipmentLabel(equipment)}</span>
                  {/each}
                </div>

                {#if item.viewerMissingEquipment.length > 0}
                  <Notice>
                    חסר בפרופיל שלך: {item.viewerMissingEquipment.map(equipmentLabel).join(", ")}.
                    אפשר לעדכן ציוד בפרופיל פילאטיס.
                  </Notice>
                {/if}

                <div class="class-card__actions">
                  {#if item.viewerCanJoin}
                    <a class="class-card__join" href={`/live-room?classId=${item.liveClass._id}`}>להיכנס ללייב</a>
                  {:else if item.viewerReservationStatus === "reserved" || item.viewerReservationStatus === "joined"}
                    <button
                      type="button"
                      onclick={() => cancel(item.liveClass._id)}
                      disabled={actionId === item.liveClass._id}
                    >
                      לבטל הרשמה
                    </button>
                  {:else}
                    <button
                      type="button"
                      class="class-card__reserve"
                      onclick={() => reserve(item.liveClass._id)}
                      disabled={!item.viewerCanReserve || actionId === item.liveClass._id}
                    >
                      לשמור מקום
                    </button>
                  {/if}
                </div>
              </div>
            </article>
          {/each}
        {/if}
      </div>
      </PageShell>
    {/if}
  </AuthGuard>
</AppLayout>

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

  .agenda {
    display: grid;
    gap: var(--space-4);
  }

  .class-card {
    display: grid;
    grid-template-columns: 96px 1fr;
    border: var(--border);
    background: var(--white);
  }

  .class-card__time {
    display: grid;
    align-content: start;
    gap: var(--space-2);
    padding: var(--space-5);
    border-inline-start: var(--border);
    font-family: var(--font-mono);
    font-weight: 800;
  }

  .class-card__time span:first-child {
    font-size: var(--step-1);
  }

  .class-card__time span:last-child {
    color: var(--muted);
  }

  .class-card__content {
    display: grid;
    gap: var(--space-4);
    padding: var(--space-5);
  }

  .class-card__header {
    display: flex;
    align-items: start;
    justify-content: space-between;
    gap: var(--space-4);
  }

  .class-card h3 {
    font-size: var(--step-1);
    line-height: 1.2;
    margin: 0;
  }

  .class-card__type {
    font-family: var(--font-mono);
    font-size: var(--step--1);
    color: var(--muted);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    font-weight: 700;
    margin: 0 0 var(--space-1);
  }

  .class-card__status {
    border: var(--border);
    background: var(--surface);
    padding: var(--space-2) var(--space-3);
    font-size: var(--step--1);
    font-weight: 800;
    white-space: nowrap;
  }

  .class-card__description {
    color: var(--muted);
    line-height: 1.7;
    margin: 0;
  }

  .class-card__meta {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
  }

  .class-card__meta span {
    border: 1px solid var(--line-light);
    background: var(--surface);
    padding: var(--space-2) var(--space-3);
    font-size: var(--step--1);
    font-weight: 700;
  }

  .class-card__actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-3);
  }

  .class-card__actions button,
  .class-card__join {
    display: inline-flex;
    min-height: 44px;
    align-items: center;
    justify-content: center;
    border: var(--border);
    background: var(--white);
    color: var(--ink);
    padding-inline: var(--space-4);
    font: inherit;
    font-weight: 800;
    cursor: pointer;
    text-decoration: none;
    transition: background var(--duration-fast);
  }

  .class-card__actions button:hover,
  .class-card__join:hover {
    background: var(--surface);
  }

  .class-card__reserve,
  .class-card__join {
    background: var(--ink);
    color: var(--white);
    border-color: var(--ink);
  }

  .class-card__reserve:hover,
  .class-card__join:hover {
    background: var(--ink-secondary);
  }

  .class-card__actions button:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }

  .empty-agenda,
  .state-card {
    display: grid;
    gap: var(--space-3);
    border: var(--border);
    background: var(--white);
    padding: var(--space-6);
  }

  .empty-agenda__kicker {
    font-family: var(--font-mono);
    font-size: var(--step--1);
    color: var(--muted);
    font-weight: 700;
    margin: 0 0 var(--space-2);
  }

  .skeleton {
    height: 64px;
    background: var(--line-light);
    animation: skeleton-pulse 1.6s ease-in-out infinite;
  }

  .skeleton--wide {
    height: 120px;
  }

  @media (max-width: 860px) {
    .class-card {
      grid-template-columns: 1fr;
    }

    .class-card__time {
      display: flex;
      border-inline-start: 0;
      border-bottom: var(--border);
      gap: var(--space-3);
    }

    .class-card__header {
      flex-direction: column;
    }
  }
</style>
