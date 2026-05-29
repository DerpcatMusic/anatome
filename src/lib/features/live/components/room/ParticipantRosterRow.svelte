<script lang="ts">
  import type { Participant } from "livekit-client";
  import ParticipantRosterRowConnected from "./ParticipantRosterRowConnected.svelte";
  import RosterMemberIdentity from "./RosterMemberIdentity.svelte";

  let {
    displayName,
    avatarUrl = null,
    reservationStatus,
    participant = null,
  }: {
    displayName: string;
    avatarUrl?: string | null;
    reservationStatus: "reserved" | "joined";
    participant?: Participant | null;
  } = $props();

  const hasJoined = $derived(reservationStatus === "joined");
</script>

{#if participant}
  <ParticipantRosterRowConnected {displayName} {avatarUrl} {reservationStatus} {participant} />
{:else}
  <div
    class="lr-participant lr-participant--roster"
    class:lr-participant--roster-joined={hasJoined}
    class:lr-participant--roster-reserved={!hasJoined}
  >
    <div class="lr-participant__left">
      <RosterMemberIdentity {displayName} {avatarUrl} size={28} />
      <span
        class="lr-participant__role lr-participant__role--roster"
        class:lr-participant__role--joined={hasJoined}
      >
        <span class="material-symbols-rounded" aria-hidden="true">
          {hasJoined ? "check_circle" : "event_seat"}
        </span>
        {hasJoined ? "בשידור" : "שמורה"}
      </span>
    </div>
  </div>
{/if}
