<script lang="ts">
  import { RadioGroup } from "bits-ui";

  type RadioValue = string | number;
  type RadioOption = { value: RadioValue; label: string; description?: string; disabled?: boolean };

  let {
    value = $bindable<RadioValue>(),
    options,
    orientation = "horizontal",
    class: className = "",
    onchange,
  }: {
    value: RadioValue;
    options: RadioOption[];
    orientation?: "horizontal" | "vertical";
    class?: string;
    onchange?: (value: RadioValue) => void;
  } = $props();

  const stringValue = $derived(String(value ?? ""));

  function updateValue(next: string) {
    const option = options.find((item) => String(item.value) === next);
    if (!option) return;
    value = option.value;
    onchange?.(option.value);
  }
</script>

<RadioGroup.Root
  class={`hb-choice-grid ${className}`}
  {orientation}
  value={stringValue}
  onValueChange={updateValue}
>
  {#each options as option (String(option.value))}
    <RadioGroup.Item class="hb-choice" value={String(option.value)} disabled={option.disabled}>
      <span class="hb-choice__title">{option.label}</span>
      {#if option.description}
        <span class="hb-choice__description">{option.description}</span>
      {/if}
    </RadioGroup.Item>
  {/each}
</RadioGroup.Root>
