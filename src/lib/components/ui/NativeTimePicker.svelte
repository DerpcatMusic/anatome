<script lang="ts">
  let {
    value = $bindable("09:00"),
    label,
    disabled = false,
    onchange,
  }: {
    value?: string;
    label: string;
    disabled?: boolean;
    onchange?: () => void;
  } = $props();

  function handleInput(e: Event) {
    const target = e.target as HTMLInputElement;
    if (target.value) {
      value = target.value;
      onchange?.();
    }
  }
</script>

<div class="hb-input-field">
  <span class="hb-input-field__label">{label}</span>
  <input
    type="time"
    class="hb-input"
    {disabled}
    value={value}
    oninput={handleInput}
    step="60"
  />
</div>

<style>
  input[type="time"] {
    font-family: var(--font-mono);
    font-weight: 800;
    text-align: center;
    direction: ltr;
  }

  input[type="time"]::-webkit-calendar-picker-indicator {
    filter: invert(0.2);
    cursor: pointer;
  }
</style>
