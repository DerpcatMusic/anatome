<script lang="ts">
  import { Button } from "bits-ui";
  import { useI18n } from "$lib/i18n/runes.svelte";
  import ConnectionStatusOverlay from "./ConnectionStatusOverlay.svelte";

  let {
    isInstructorRoom,
    onExit,
  }: {
    isInstructorRoom: boolean;
    onExit: () => void;
  } = $props();

  const { t } = useI18n();
</script>

<ConnectionStatusOverlay
  icon="event_available"
  title={t.live.room.classEndedTitle()}
  message={t.live.room.classEndedBody()}
  primaryLabel={isInstructorRoom ? t.live.preConnect.backStudio() : t.live.room.classEndedCta()}
  onPrimary={onExit}
/>
