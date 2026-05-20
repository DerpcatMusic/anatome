<script lang="ts">
  import Button from "$components/ui/Button.svelte";

  let {
    isInstructorRoom,
    open = $bindable(false),
    onLeave,
    onEndLive,
  }: {
    isInstructorRoom: boolean;
    open?: boolean;
    onLeave: () => void;
    onEndLive?: () => void;
  } = $props();
</script>

{#if open}
  <div class="leave-modal-backdrop" role="dialog" aria-modal="true" aria-label="יציאה מהחדר">
    <div class="leave-modal">
      <h2>{isInstructorRoom ? "סיום שידור" : "יציאה מהחדר"}</h2>
      <p>
        {isInstructorRoom
          ? "האם לסיים את השידור לכל המשתתפות?"
          : "האם לצאת מהחדר? תוכלי להיכנס שוב דרך הלוח."}
      </p>
      <div class="leave-modal__actions">
        {#if isInstructorRoom && onEndLive}
          <Button tone="danger" size="md" onclick={onEndLive}>סיום שידור</Button>
          <Button tone="paper" size="md" onclick={onLeave}>יציאה בלבד</Button>
        {:else}
          <Button tone="ink" size="md" onclick={onLeave}>יציאה מהחדר</Button>
        {/if}
        <Button tone="ghost" size="sm" onclick={() => { open = false; }}>ביטול</Button>
      </div>
    </div>
  </div>
{/if}

<style>
  .leave-modal-backdrop {
    position: fixed;
    inset: 0;
    z-index: 100;
    display: grid;
    place-items: center;
    background: rgba(0, 0, 0, 0.72);
    backdrop-filter: blur(6px);
  }

  .leave-modal {
    display: grid;
    gap: var(--space-4);
    max-width: 420px;
    width: calc(100% - var(--space-6));
    padding: var(--space-6);
    border: var(--border);
    background: var(--white);
    text-align: center;
  }

  .leave-modal h2 {
    font-size: var(--step-2);
    line-height: 1.2;
    margin: 0;
  }

  .leave-modal p {
    color: var(--muted);
    margin: 0;
  }

  .leave-modal__actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-3);
    justify-content: center;
    padding-top: var(--space-2);
  }
</style>
