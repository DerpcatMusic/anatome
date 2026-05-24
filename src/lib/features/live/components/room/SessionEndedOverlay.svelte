<script lang="ts">
  import { Button } from "bits-ui";
  import { useI18n } from "$lib/i18n/runes.svelte";

  let {
    isInstructorRoom,
    onExit,
  }: {
    isInstructorRoom: boolean;
    onExit: () => void;
  } = $props();

  const { t } = useI18n();
</script>

<div class="session-ended-overlay">
  <div class="session-ended-card">
    <span class="material-symbols-rounded" aria-hidden="true">event_available</span>
    <h2>{t.live.room.classEndedTitle()}</h2>
    <p>{t.live.room.classEndedBody()}</p>
    <Button.Root class="hb-button hb-button--ink hb-button--md" type="button" onclick={onExit}>
      {isInstructorRoom ? t.live.preConnect.backStudio() : t.live.room.classEndedCta()}
    </Button.Root>
  </div>
</div>

<style>
  .session-ended-overlay {
    position: fixed;
    inset: 0;
    z-index: 65;
    display: grid;
    place-items: center;
    background: var(--ink);
    color: var(--white);
  }

  .session-ended-card {
    display: grid;
    gap: var(--space-4);
    max-width: 400px;
    text-align: center;
    padding: var(--space-6);
    border: 1px solid var(--white);
  }

  .session-ended-card .material-symbols-rounded {
    font-size: var(--step-4);
    color: var(--primary);
    justify-self: center;
  }

  .session-ended-card h2 {
    margin: 0;
    font-size: var(--step-3);
  }

  .session-ended-card p {
    margin: 0;
    color: var(--white);
    line-height: 1.5;
  }
</style>
