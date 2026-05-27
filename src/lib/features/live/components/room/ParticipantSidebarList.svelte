<script lang="ts">
  import { ScrollArea } from "bits-ui";
  import { useParticipants } from "$lib/livekit";
  import { isInstructorIdentity } from "$lib/features/live/live-room-shared";
  import ParticipantSidebarItem from "./ParticipantSidebarItem.svelte";

  const participants = useParticipants();

  const sortedParticipants = $derived(
    [...participants].sort(
      (a, b) =>
        Number(isInstructorIdentity(b.identity)) - Number(isInstructorIdentity(a.identity)) ||
        (a.name || a.identity).localeCompare(b.name || b.identity),
    ),
  );
</script>

<ScrollArea.Root class="hb-scroll-area lr-panel__scroll">
  <ScrollArea.Viewport class="hb-scroll-area__viewport">
    <div class="lr-participant-list">
      {#each sortedParticipants as participant (participant.identity)}
        <ParticipantSidebarItem {participant} />
      {/each}
    </div>
  </ScrollArea.Viewport>
  <ScrollArea.Scrollbar orientation="vertical" class="hb-scroll-area__scrollbar" />
</ScrollArea.Root>
