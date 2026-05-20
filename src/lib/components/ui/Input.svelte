<script lang="ts">
  let {
    label,
    name,
    type = "text",
    value = $bindable(""),
    autocomplete,
    inputmode,
    required = false,
  }: {
    label: string;
    name: string;
    type?: string;
    value?: string;
    autocomplete?: HTMLInputElement["autocomplete"];
    inputmode?: "none" | "text" | "decimal" | "numeric" | "tel" | "search" | "email" | "url";
    required?: boolean;
  } = $props();
</script>

<label class="hb-input-field">
  <span class="hb-field__label">{label}</span>
  <input class="hb-input" bind:value {name} {type} {autocomplete} {inputmode} {required} />
</label>
