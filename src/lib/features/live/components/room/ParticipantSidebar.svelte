<script lang="ts">
  import { Button } from "bits-ui";
  import { useI18n } from "$lib/i18n/runes.svelte";
  import ParticipantSidebarList from "./ParticipantSidebarList.svelte";

  import type { Id } from "$convex/_generated/dataModel";

  let {
    open,
    onClose,
    liveClassId = null,
    showClassRoster = false,
  }: {
    open: boolean;
    onClose: () => void;
    liveClassId?: Id<"liveClasses"> | null;
    showClassRoster?: boolean;
  } = $props();

  const { t } = useI18n();
</script>

{#if open}
  <aside class="lr-panel lr-panel--participants" aria-label={t.live.room.participantsTitle()}>
    <div class="lr-panel__header">
      <h3>{t.live.room.participantsTitle()}</h3>
      <Button.Root
        class="hb-button hb-button--close"
        type="button"
        onclick={onClose}
        aria-label={t.live.room.close()}
      >
        <span class="material-symbols-rounded">close</span>
      </Button.Root>
    </div>
    <ParticipantSidebarList {liveClassId} {showClassRoster} />
  </aside>
{/if}
