<script lang="ts">
  import { Checkbox } from "bits-ui";
  import type { Snippet } from "svelte";

  let {
    checked = $bindable(false),
    value,
    disabled = false,
    readonly = false,
    class: className = "",
    onchange,
    children,
  }: {
    checked: boolean;
    value?: string;
    disabled?: boolean;
    readonly?: boolean;
    class?: string;
    onchange?: (checked: boolean) => void;
    children?: Snippet;
  } = $props();

  function updateChecked(next: boolean) {
    checked = next;
    onchange?.(next);
  }
</script>

<Checkbox.Root
  class={`hb-choice ${className}`}
  {value}
  {checked}
  {disabled}
  {readonly}
  onCheckedChange={updateChecked}
>
  {@render children?.()}
</Checkbox.Root>
