<script lang="ts">
  import { Button } from "bits-ui";
  import type { Snippet } from "svelte";

  let {
    type = "button",
    tone = "paper",
    size = "md",
    href,
    disabled = false,
    onclick,
    class: className = "",
    children,
  }: {
    type?: "button" | "submit";
    tone?: "paper" | "ink" | "sky" | "primary" | "secondary" | "ghost" | "danger" | "terra";
    size?: "sm" | "md" | "lg";
    href?: string;
    disabled?: boolean;
    onclick?: () => void | Promise<void>;
    class?: string;
    children?: Snippet;
  } = $props();

  const classes = $derived(
    `hb-button hb-button--${tone} hb-button--${size} ${className}`.trim()
  );
</script>

{#if href}
  <Button.Root class={classes} {href} {disabled} {onclick}>
    {@render children?.()}
  </Button.Root>
{:else}
  <Button.Root class={classes} {type} {disabled} {onclick}>
    {@render children?.()}
  </Button.Root>
{/if}
