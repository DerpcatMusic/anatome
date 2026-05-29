<script lang="ts">
  import { api } from "$convex/_generated/api";
  import type { Id } from "$convex/_generated/dataModel";
  import { useQuery } from "convex-svelte";
  import { canRunAuthenticatedQuery } from "$lib/auth/session.svelte";
  import RosterMemberIdentity from "./RosterMemberIdentity.svelte";

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
              <RosterMemberIdentity displayName={member.displayName} avatarUrl={member.avatarUrl} />
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
            <li class="instructor-roster__row instructor-roster__row--reserved">
              <RosterMemberIdentity displayName={member.displayName} avatarUrl={member.avatarUrl} />
              <span class="material-symbols-rounded instructor-roster__status-icon" aria-hidden="true"
                >event_seat</span
              >
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
              <RosterMemberIdentity displayName={member.displayName} avatarUrl={member.avatarUrl} />
              <span class="material-symbols-rounded instructor-roster__status-icon" aria-hidden="true"
                >check_circle</span
              >
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
    background: var(--card);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-ambient);
    max-height: min(32rem, 56vh);
    overflow: auto;
    direction: rtl;
  }

  .instructor-roster__head {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    padding-bottom: var(--space-2);
    border-bottom: 1px solid var(--border-color);
  }

  .instructor-roster__title {
    margin: 0;
    font-family: var(--font-display);
    font-size: var(--step-0);
    font-weight: 400;
    line-height: 1.2;
    color: var(--foreground);
  }

  .instructor-roster__stats {
    margin: 0;
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2) var(--space-3);
    font-size: var(--step--2);
    color: var(--foreground-muted);
  }

  .instructor-roster__stat strong {
    color: var(--foreground);
    font-family: var(--font-mono);
    font-weight: 800;
  }

  .instructor-roster__stat--live {
    color: var(--accent);
    font-weight: 700;
  }

  .instructor-roster__section {
    display: grid;
    gap: var(--space-1);
  }

  .instructor-roster__section-title {
    margin: 0;
    font-family: var(--font-mono);
    font-size: var(--step--2);
    font-weight: 800;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--secondary);
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
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-3);
    border-radius: var(--radius-md);
    background: var(--muted);
    font-size: var(--step--1);
    min-height: 2.75rem;
  }

  .instructor-roster__row--waiting {
    background: color-mix(in oklch, var(--accent) 14%, var(--muted));
    outline: 1px solid color-mix(in oklch, var(--accent) 28%, var(--border-color));
    outline-offset: -1px;
  }

  .instructor-roster__row--waiting :global(.roster-member-identity),
  .instructor-roster__row--reserved :global(.roster-member-identity),
  .instructor-roster__row--joined :global(.roster-member-identity) {
    flex: 1;
    min-width: 0;
  }

  .instructor-roster__status-icon {
    flex-shrink: 0;
    font-size: 1.125rem;
    color: var(--foreground-muted);
  }

  .instructor-roster__row--joined .instructor-roster__status-icon {
    color: var(--success);
  }

  .instructor-roster__meta {
    flex-shrink: 0;
    font-size: var(--step--2);
    font-weight: 600;
    color: var(--foreground-muted);
    white-space: nowrap;
  }

  .instructor-roster__empty {
    margin: 0;
    padding: var(--space-3);
    font-size: var(--step--1);
    color: var(--foreground-muted);
    text-align: center;
    border-radius: var(--radius-md);
    background: var(--muted);
  }
</style>
