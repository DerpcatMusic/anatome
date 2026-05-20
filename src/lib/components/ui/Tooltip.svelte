<script lang="ts">
  import { Tooltip } from "bits-ui";
  import type { Snippet } from "svelte";

  let {
    label,
    children,
    sideOffset = 8,
    openDelay = 160,
    side = "top",
    align = "center",
  }: {
    label: string;
    children: Snippet;
    sideOffset?: number;
    openDelay?: number;
    side?: "top" | "right" | "bottom" | "left";
    align?: "start" | "center" | "end";
  } = $props();
</script>

<Tooltip.Root>
  <Tooltip.Trigger>
    {#snippet child({ props })}
      <span {...props} class="hb-tooltip-trigger">
        {@render children()}
      </span>
    {/snippet}
  </Tooltip.Trigger>
  <Tooltip.Portal>
    <Tooltip.Content {side} {align} {sideOffset}>
      {#snippet child({ wrapperProps, props, open })}
        {#if open}
          <div {...wrapperProps}>
            <div {...props} class="hb-tooltip-content">
              {label}
            </div>
          </div>
        {/if}
      {/snippet}
    </Tooltip.Content>
  </Tooltip.Portal>
</Tooltip.Root>
