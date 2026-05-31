<script lang="ts">
  import { Button } from "bits-ui";

  interface Props {
    title: string;
    isPopover: boolean;
    onCancel: () => void;
  }

  let { title, isPopover, onCancel }: Props = $props();
</script>

<div class="live-composer__ended">
  <p class="live-composer__ended-title">{title}</p>
  <p class="live-composer__ended-hint">הסתיים — צפייה בלבד</p>
</div>
{#if !isPopover}
  <div class="live-composer__footer" class:live-composer__footer--cols-1={true}>
    <Button.Root
      class="hb-button hb-button--ink live-composer__footer-action"
      type="button"
      onclick={onCancel}
    >
      סגירה
    </Button.Root>
  </div>
{/if}

<style>
  .live-composer__ended {
    padding: var(--space-2) 0 var(--space-3);
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .live-composer__ended-title {
    margin: 0;
    font-size: var(--step-0);
    font-weight: 900;
    color: var(--ink);
  }

  .live-composer__ended-hint {
    margin: 0;
    font-size: var(--step--1);
    color: var(--foreground-muted);
  }

  .live-composer__footer {
    display: grid;
    gap: var(--space-2);
    align-items: stretch;
    flex-shrink: 0;
    padding-top: var(--space-3);
    margin-top: var(--space-2);
    border-top: 1px solid var(--line-light);
    background: inherit;
  }

  .live-composer__footer--cols-1 {
    grid-template-columns: 1fr;
    justify-items: stretch;
  }

  .live-composer__footer:not(.live-composer__footer--popover) {
    grid-auto-flow: column;
    grid-auto-columns: max-content;
    justify-content: end;
  }

  .live-composer__footer:not(.live-composer__footer--popover) :global(.live-composer__footer-action) {
    width: auto;
  }
</style>
