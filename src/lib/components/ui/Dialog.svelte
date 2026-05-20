<script lang="ts">
  import { Dialog } from "bits-ui";
  import type { Snippet } from "svelte";

  let {
    open = $bindable(false),
    children,
    title,
    description,
  }: {
    open?: boolean;
    children: Snippet;
    title?: string;
    description?: string;
  } = $props();
</script>

<Dialog.Root bind:open>
  <Dialog.Portal>
    <Dialog.Overlay class="hb-dialog-overlay" />
    <Dialog.Content class="hb-dialog-content" aria-label={title}>
      {#if title}
        <Dialog.Title class="hb-dialog-title">{title}</Dialog.Title>
      {/if}
      {#if description}
        <Dialog.Description class="hb-dialog-description">{description}</Dialog.Description>
      {/if}
      {@render children()}
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>
