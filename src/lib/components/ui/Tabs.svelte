<script lang="ts">
  import { Tabs } from "bits-ui";
  import type { Snippet } from "svelte";
  import { spring } from "svelte/motion";

  type TabItem = { value: string; label: string };

  let {
    value = $bindable<string>(),
    items,
    children,
    ariaLabel,
    activationMode = "automatic",
  }: {
    value?: string;
    items: TabItem[];
    children: Snippet;
    ariaLabel: string;
    activationMode?: "automatic" | "manual";
  } = $props();

  let listEl = $state<HTMLElement | null>(null);
  let triggerElements = $state<Record<string, HTMLElement | null>>({});

  $effect.pre(() => {
    for (const item of items) {
      if (!(item.value in triggerElements)) {
        triggerElements[item.value] = null;
      }
    }
  });

  const position = spring({ left: 0, width: 0 }, {
    stiffness: 0.12,
    damping: 0.65
  });

  $effect(() => {
    const activeEl = value ? triggerElements[value] : null;
    if (activeEl && listEl) {
      const parentRect = listEl.getBoundingClientRect();
      const activeRect = activeEl.getBoundingClientRect();
      const left = activeRect.left - parentRect.left;
      const width = activeRect.width;
      position.set({ left, width });
    }
  });
</script>

<Tabs.Root bind:value {activationMode}>
  <Tabs.List bind:ref={listEl} class="hb-tabs-list" style="position: relative;" aria-label={ariaLabel}>
    {#if $position.width > 0}
      <div
        class="hb-tab-indicator"
        style="
          position: absolute;
          top: 0;
          bottom: 0;
          left: 0;
          width: {$position.width}px;
          transform: translateX({$position.left}px);
          background: var(--ink);
          border: var(--border);
          pointer-events: none;
          z-index: 0;
        "
      ></div>
    {/if}
    {#each items as item (item.value)}
      <Tabs.Trigger
        bind:ref={triggerElements[item.value]}
        class="hb-tab"
        value={item.value}
        style="position: relative; z-index: 1; background: transparent; transition: color var(--duration-base);"
      >
        <span style="color: {value === item.value ? 'var(--white)' : 'var(--ink)'}; transition: color var(--duration-fast) var(--ease-out);">
          {item.label}
        </span>
      </Tabs.Trigger>
    {/each}
  </Tabs.List>
  {@render children()}
</Tabs.Root>
