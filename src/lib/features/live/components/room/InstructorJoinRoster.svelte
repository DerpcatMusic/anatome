<script lang="ts">
  import { api } from "$convex/_generated/api";
  import type { Id } from "$convex/_generated/dataModel";
  import { useQuery } from "convex-svelte";
  import { canRunAuthenticatedQuery } from "$lib/auth/session.svelte";

  interface Props {
    liveClassId: Id<"liveClasses">;
    nowMs: number;
  }

  let { liveClassId, nowMs }: Props = $props();

  const panelQuery = useQuery(api.live.roster.getInstructorPanel, () =>
    canRunAuthenticatedQuery() ? { liveClassId, now: nowMs } : "skip",
  );

  const panel = $derived(panelQuery.data ?? null);

  function lobbyPhaseLabel(phase: "waiting_broadcast" | "device_setup") {
    return phase === "waiting_broadcast" ? "ממתינה לשידור" : "בהכנה לכניסה";
  }
</script>

{#if panel}
  <aside class="instructor-roster" aria-label="משתתפות רשומות וממתינות">
    <header class="instructor-roster__head">
      <h2 class="instructor-roster__title">הרשמות וממתינות</h2>
      <p class="instructor-roster__stats">
        <span class="instructor-roster__stat">
          <strong>{panel.summary.seatsTaken}</strong> / {panel.summary.capacity} שמורות
        </span>
        {#if panel.summary.lobbyWaitingCount > 0}
          <span class="instructor-roster__stat instructor-roster__stat--live">
            {panel.summary.lobbyWaitingCount} בחדר כניסה עכשיו
          </span>
        {/if}
      </p>
    </header>

    {#if panel.waitingInLobby.length > 0}
      <section class="instructor-roster__section">
        <h3 class="instructor-roster__section-title">ממתינות לכניסה</h3>
        <ul class="instructor-roster__list">
          {#each panel.waitingInLobby as member (member.userId)}
            <li class="instructor-roster__row instructor-roster__row--waiting">
              <span class="material-symbols-rounded" aria-hidden="true">hourglass_top</span>
              <span class="instructor-roster__name">{member.displayName}</span>
              <span class="instructor-roster__meta">{lobbyPhaseLabel(member.phase)}</span>
            </li>
          {/each}
        </ul>
      </section>
    {/if}

    {#if panel.reserved.length > 0}
      <section class="instructor-roster__section">
        <h3 class="instructor-roster__section-title">שמורות ({panel.reserved.length})</h3>
        <ul class="instructor-roster__list">
          {#each panel.reserved as member (member.userId)}
            <li class="instructor-roster__row">
              <span class="material-symbols-rounded" aria-hidden="true">event_seat</span>
              <span class="instructor-roster__name">{member.displayName}</span>
            </li>
          {/each}
        </ul>
      </section>
    {/if}

    {#if panel.joined.length > 0}
      <section class="instructor-roster__section">
        <h3 class="instructor-roster__section-title">בשידור ({panel.joined.length})</h3>
        <ul class="instructor-roster__list">
          {#each panel.joined as member (member.userId)}
            <li class="instructor-roster__row instructor-roster__row--joined">
              <span class="material-symbols-rounded" aria-hidden="true">check_circle</span>
              <span class="instructor-roster__name">{member.displayName}</span>
            </li>
          {/each}
        </ul>
      </section>
    {/if}

    {#if panel.reserved.length === 0 && panel.waitingInLobby.length === 0 && panel.joined.length === 0}
      <p class="instructor-roster__empty">עדיין אין הרשמות לשיעור הזה.</p>
    {/if}
  </aside>
{/if}

<style>
  .instructor-roster {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    padding: var(--space-4);
    background: var(--elevated);
    border: 1px solid color-mix(in oklch, var(--line) 55%, transparent);
    border-radius: 2px;
    max-height: min(28rem, 50vh);
    overflow: auto;
  }

  .instructor-roster__head {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }

  .instructor-roster__title {
    margin: 0;
    font-size: var(--step-0);
    font-weight: 800;
  }

  .instructor-roster__stats {
    margin: 0;
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
    font-size: var(--step--1);
    color: var(--foreground-muted);
  }

  .instructor-roster__stat strong {
    color: var(--ink);
    font-family: var(--font-mono);
  }

  .instructor-roster__stat--live {
    color: var(--primary);
    font-weight: 700;
  }

  .instructor-roster__section-title {
    margin: 0 0 var(--space-2);
    font-size: var(--step--1);
    font-weight: 800;
    color: var(--foreground-muted);
  }

  .instructor-roster__list {
    margin: 0;
    padding: 0;
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }

  .instructor-roster__row {
    display: grid;
    grid-template-columns: auto 1fr auto;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2);
    border-radius: 2px;
    background: var(--paper);
    font-size: var(--step--1);
  }

  .instructor-roster__row--waiting {
    border-inline-start: 3px solid var(--accent);
  }

  .instructor-roster__row--joined .material-symbols-rounded {
    color: var(--success);
  }

  .instructor-roster__name {
    font-weight: 700;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .instructor-roster__meta {
    font-size: var(--step--2);
    color: var(--foreground-muted);
    white-space: nowrap;
  }

  .instructor-roster__empty {
    margin: 0;
    font-size: var(--step--1);
    color: var(--foreground-muted);
  }
</style>
