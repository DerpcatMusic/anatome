<script lang="ts">
  import Notice from "$components/ui/Notice.svelte";
  import { api } from "$convex/_generated/api";
  import type { FunctionReturnType } from "convex/server";
  import type { Id } from "$convex/_generated/dataModel";
  import { useQuery, useConvexClient } from "convex-svelte";
  import { initAuth, getCachedRole, setCachedRole } from "$lib/auth/session.svelte";
  import { useI18n } from "$lib/i18n/runes.svelte";
  import { routePath } from "$lib/i18n/context";
  import DayStrip from "./DayStrip.svelte";
  import ClassCard from "./ClassCard.svelte";

  type CalendarClass = FunctionReturnType<typeof api.customerLive.listCalendarRange>[number];

  const dayMs = 24 * 60 * 60 * 1000;
  const rangeStart = startOfToday();
  const formatter = new Intl.DateTimeFormat("he-IL", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "Asia/Jerusalem",
  });

  let selectedDay = $state(rangeStart);
  let actionId = $state<string | null>(null);
  let actionError = $state("");

  const auth = initAuth();
  const client = useConvexClient();
  const profileQuery = useQuery(api.appProfiles.viewer, () => auth.isAuthenticated ? {} : "skip");
  const role = $derived(profileQuery.data?.role ?? getCachedRole());
  const isStaff = $derived(role === "instructor" || role === "admin");

  const query = useQuery(api.customerLive.listCalendarRange, () => auth.isAuthenticated ? {
    from: rangeStart,
    to: rangeStart + 14 * dayMs,
  } : "skip");

  const classes = $derived(query.data ?? []);

  $effect(() => {
    if (profileQuery.data?.role) setCachedRole(profileQuery.data.role);
  });

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

  const { t } = useI18n();

  async function reserve(liveClassId: Id<"liveClasses">) {
    actionId = liveClassId;
    actionError = "";
    try {
      await client.mutation(api.customerLive.reserve, { liveClassId });
    } catch (reason) {
      actionError = reason instanceof Error ? reason.message : t.calendar.error.reserve();
    } finally {
      actionId = null;
    }
  }

  async function cancel(liveClassId: Id<"liveClasses">) {
    actionId = liveClassId;
    actionError = "";
    try {
      await client.mutation(api.customerLive.cancelReservation, { liveClassId });
    } catch (reason) {
      actionError = reason instanceof Error ? reason.message : t.calendar.error.cancel();
    } finally {
      actionId = null;
    }
  }
</script>

{#if query.isLoading}
  <div class="state-card">
    <div class="skeleton skeleton--wide"></div>
    <div class="skeleton"></div>
    <div class="skeleton"></div>
  </div>
{:else}
  <div class="calendar-page">
    <div class="page-header">
      <div>
        <p class="kicker">{t.calendar.kicker()}</p>
        <h1>{t.calendar.title()}</h1>
      </div>
      <div class="page-header__actions">
        {#if isStaff}
          <a href={routePath("studioLive")} class="btn btn--primary">{t.calendar.studio()}</a>
        {/if}
        <button type="button" class="btn btn--ghost" onclick={() => { selectedDay = rangeStart; }}>
          {t.calendar.today()}
        </button>
      </div>
    </div>
    <p class="description">{t.calendar.description()}</p>

    {#if query.error || actionError}
      <Notice tone="danger">{query.error?.message ?? actionError}</Notice>
    {/if}

    <DayStrip {days} {selectedDay} onSelect={(date) => { selectedDay = date; }} />

    <div class="agenda" aria-live="polite">
      {#if visibleClasses.length === 0}
        <div class="empty-agenda">
          <p class="empty-agenda__kicker">{t.calendar.empty.kicker()}</p>
          <p>{t.calendar.empty.text()}</p>
        </div>
      {:else}
        {#each visibleClasses as item}
          <ClassCard {item} {actionId} onReserve={reserve} onCancel={cancel} />
        {/each}
      {/if}
    </div>
  </div>
{/if}

<style>
  .calendar-page {
    display: flex;
    flex-direction: column;
    gap: var(--space-5);
  }

  .page-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-4);
    flex-wrap: wrap;
  }

  .page-header__actions {
    display: flex;
    align-items: center;
    gap: var(--space-3);
  }

  .btn--primary {
    display: inline-flex;
    min-height: 44px;
    align-items: center;
    justify-content: center;
    border: var(--border);
    background: var(--ink);
    color: var(--white);
    padding-inline: var(--space-5);
    font: inherit;
    font-weight: 800;
    text-decoration: none;
    cursor: pointer;
    transition: background var(--duration-fast);
  }

  .btn--primary:hover {
    background: var(--ink-secondary);
  }

  .kicker {
    font-family: var(--font-mono);
    font-size: var(--step--1);
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--muted);
    margin: 0;
  }

  h1 {
    font-size: var(--step-3);
    line-height: 1.1;
    margin: 0;
  }

  .description {
    color: var(--muted);
    line-height: 1.7;
    max-width: 60ch;
    margin: 0;
  }

  .btn--ghost {
    display: inline-flex;
    min-height: 44px;
    align-items: center;
    justify-content: center;
    border: var(--border);
    background: var(--white);
    color: var(--ink);
    padding-inline: var(--space-5);
    font: inherit;
    font-weight: 800;
    cursor: pointer;
    transition: background var(--duration-fast);
  }

  .btn--ghost:hover {
    background: var(--surface);
  }

  .agenda {
    display: grid;
    gap: var(--space-4);
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

  @keyframes skeleton-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.35; }
  }
</style>
