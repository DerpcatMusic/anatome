<script lang="ts">
  import type { Participant } from "livekit-client";
  import ParticipantRosterRow from "./ParticipantRosterRow.svelte";
  import RosterMemberIdentity from "./RosterMemberIdentity.svelte";
  import { useI18n } from "$lib/i18n/runes.svelte";

  let {
    displayName,
    avatarUrl = null,
    participant = null,
  }: {
    displayName: string;
    avatarUrl?: string | null;
    participant?: Participant | null;
  } = $props();

  const { t } = useI18n();
</script>

{#if participant}
  <div class="lr-participant lr-participant--host-live">
    <ParticipantRosterRow
      {displayName}
      {avatarUrl}
      reservationStatus="joined"
      {participant}
    />
  </div>
{:else}
  <div class="lr-participant lr-participant--roster lr-participant--host">
    <div class="lr-participant__left">
      <RosterMemberIdentity {displayName} {avatarUrl} size={28} />
      <span class="lr-participant__role lr-participant__role--instructor">
        {t.live.room.instructor()}
      </span>
      <span class="lr-participant__role lr-participant__role--roster-waiting">
        {t.live.room.waitingForInstructor()}
      </span>
    </div>
  </div>
{/if}

<style>
  .lr-participant--host .lr-participant__left {
    flex-wrap: wrap;
    gap: var(--space-1) var(--space-2);
  }

  .lr-participant__role--instructor {
    color: var(--accent, var(--terracotta));
    font-weight: 600;
  }

  .lr-participant__role--roster-waiting {
    font-size: var(--text-xs);
    color: var(--muted);
  }
</style>
