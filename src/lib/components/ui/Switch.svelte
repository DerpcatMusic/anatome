<script lang="ts">
  import { Switch } from "bits-ui";

  let {
    label,
    checked = $bindable(false),
    disabled = false,
    class: className = "",
    onchange,
  }: {
    label: string;
    checked: boolean;
    disabled?: boolean;
    class?: string;
    onchange?: () => void;
  } = $props();

  function updateChecked(next: boolean) {
    checked = next;
    onchange?.();
  }
</script>

<span class={`hb-switch ${className}`.trim()}>
  <Switch.Root
    class="hb-switch__root"
    aria-label={label}
    {checked}
    {disabled}
    onCheckedChange={updateChecked}
  >
    <Switch.Thumb class="hb-switch__thumb" />
  </Switch.Root>
  <span>{label}</span>
</span>
