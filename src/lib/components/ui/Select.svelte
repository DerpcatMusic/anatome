<script lang="ts">
  import { Select } from "bits-ui";

  type SelectValue = string | number;
  type SelectOption = { value: SelectValue; label: string; disabled?: boolean };

  let {
    label,
    value = $bindable<SelectValue>(),
    options,
    compact = false,
    disabled = false,
    placeholder = "בחרו אפשרות",
    onchange,
  }: {
    label: string;
    value: SelectValue;
    options: SelectOption[];
    compact?: boolean;
    disabled?: boolean;
    placeholder?: string;
    onchange?: () => void;
  } = $props();

  const bitsItems = $derived(
    options.map((option) => ({
      value: String(option.value),
      label: option.label,
      disabled: option.disabled,
    })),
  );
  const stringValue = $derived(String(value ?? ""));
  const selectedLabel = $derived(options.find((option) => option.value === value)?.label ?? placeholder);

  function updateValue(next: string) {
    const nextOption = options.find((option) => String(option.value) === next);
    if (!nextOption) return;
    value = nextOption.value;
    onchange?.();
  }
</script>

<label class="hb-field" class:hb-field--compact={compact}>
  <span class="hb-field__label">{label}</span>
  <Select.Root
    type="single"
    value={stringValue}
    items={bitsItems}
    {disabled}
    onValueChange={updateValue}
  >
    <Select.Trigger class="hb-select__trigger" aria-label={label}>
      <span class="hb-select__value">{selectedLabel}</span>
      <span class="hb-select__chevron" aria-hidden="true"></span>
    </Select.Trigger>
    <Select.Portal>
      <Select.Content class="hb-select__content" sideOffset={6}>
        <Select.Viewport class="hb-select__viewport">
          {#each options as option (String(option.value))}
            <Select.Item
              class="hb-select__item"
              value={String(option.value)}
              label={option.label}
              disabled={option.disabled}
            >
              {#snippet children({ selected })}
                <span>{option.label}</span>
                {#if selected}
                  <span class="hb-select__check" aria-hidden="true"></span>
                {/if}
              {/snippet}
            </Select.Item>
          {/each}
        </Select.Viewport>
      </Select.Content>
    </Select.Portal>
  </Select.Root>
</label>
