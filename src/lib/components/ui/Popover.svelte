<script lang="ts">
  import { Popover } from "bits-ui";
  import type { Snippet } from "svelte";

  let {
    open = $bindable(false),
    children,
    trigger,
    side = "bottom",
    align = "center",
    sideOffset = 6,
  }: {
    open?: boolean;
    children: Snippet;
    trigger: Snippet;
    side?: "top" | "right" | "bottom" | "left";
    align?: "start" | "center" | "end";
    sideOffset?: number;
  } = $props();
</script>

<Popover.Root bind:open>
  <Popover.Trigger>
    {#snippet child({ props })}
      <span {...props} class="hb-popover-trigger">
        {@render trigger()}
      </span>
    {/snippet}
  </Popover.Trigger>
  <Popover.Portal>
    <Popover.Content {side} {align} {sideOffset}>
      {#snippet child({ wrapperProps, props, open: isOpen })}
        {#if isOpen}
          <div {...wrapperProps}>
            <div {...props} class="hb-popover-content">
              {@render children()}
            </div>
          </div>
        {/if}
      {/snippet}
    </Popover.Content>
  </Popover.Portal>
</Popover.Root>
