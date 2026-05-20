<script lang="ts">
  import { ToggleGroup } from "bits-ui";
  import type { Snippet } from "svelte";

  type ToggleItem = { value: string; label: string };

  let {
    value = $bindable<string>(),
    items,
    ariaLabel,
    onValueChange,
  }: {
    value?: string;
    items: ToggleItem[];
    ariaLabel: string;
    onValueChange?: (value: string) => void;
  } = $props();

  function updateValue(next: string) {
    value = next;
    onValueChange?.(next);
  }
</script>

<ToggleGroup.Root class="hb-toggle-group" type="single" value={String(value)} onValueChange={updateValue} aria-label={ariaLabel}>
  {#each items as item (item.value)}
    <ToggleGroup.Item class="hb-toggle-item" value={String(item.value)}>
      {item.label}
    </ToggleGroup.Item>
  {/each}
</ToggleGroup.Root>
