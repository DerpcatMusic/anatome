<script lang="ts">
  import { useParticipants } from "$lib/livekit";

  let {
    onParticipantCount,
  }: {
    onParticipantCount: (count: number) => void;
  } = $props();

  const participants = useParticipants();

  $effect(() => {
    onParticipantCount(participants.length);
  });
</script>
