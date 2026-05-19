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

<label class="field">
  <span>{label}</span>
  <input bind:value {name} {type} {autocomplete} {inputmode} {required} />
</label>

<style>
  .field {
    display: grid;
    gap: var(--space-1);
    font-size: var(--step--1);
    font-weight: 700;
  }

  input {
    min-height: 44px;
    border: var(--border);
    border-radius: 0;
    background: var(--white);
    color: var(--ink);
    padding-inline: var(--space-3);
    font: inherit;
    font-size: var(--step-0);
    transition: border-color var(--duration-fast) var(--ease-out);
  }

  input:focus {
    outline: none;
    border-color: var(--sky-strong);
  }
</style>
