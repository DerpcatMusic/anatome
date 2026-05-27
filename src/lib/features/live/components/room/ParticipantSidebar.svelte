<script lang="ts">
  import { Button } from "bits-ui";
  import { useI18n } from "$lib/i18n/runes.svelte";
  import ParticipantSidebarList from "./ParticipantSidebarList.svelte";

  let {
    open,
    onClose,
  }: {
    open: boolean;
    onClose: () => void;
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
    <ParticipantSidebarList />
  </aside>
{/if}
