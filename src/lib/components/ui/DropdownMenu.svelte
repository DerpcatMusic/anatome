<script lang="ts">
  import { DropdownMenu } from "bits-ui";
  import type { Snippet } from "svelte";

  type MenuItem = {
    label: string;
    onclick?: () => void;
    disabled?: boolean;
    danger?: boolean;
  };

  let {
    open = $bindable(false),
    items,
    trigger,
    side = "bottom",
    align = "end",
    sideOffset = 6,
  }: {
    open?: boolean;
    items: MenuItem[];
    trigger: Snippet;
    side?: "top" | "right" | "bottom" | "left";
    align?: "start" | "center" | "end";
    sideOffset?: number;
  } = $props();
</script>

<DropdownMenu.Root bind:open>
  <DropdownMenu.Trigger>
    {#snippet child({ props })}
      <span {...props} class="hb-dropdown-trigger">
        {@render trigger()}
      </span>
    {/snippet}
  </DropdownMenu.Trigger>
  <DropdownMenu.Portal>
    <DropdownMenu.Content {side} {align} {sideOffset}>
      {#snippet child({ wrapperProps, props, open: isOpen })}
        {#if isOpen}
          <div {...wrapperProps}>
            <div {...props} class="hb-dropdown-content">
              {#each items as item (item.label)}
                <DropdownMenu.Item
                  class={`hb-dropdown-item ${item.danger ? "hb-dropdown-item--danger" : ""}`.trim()}
                  disabled={item.disabled}
                  onclick={item.onclick}
                >
                  {item.label}
                </DropdownMenu.Item>
              {/each}
            </div>
          </div>
        {/if}
      {/snippet}
    </DropdownMenu.Content>
  </DropdownMenu.Portal>
</DropdownMenu.Root>
