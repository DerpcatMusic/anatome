<script lang="ts">
  let {
    type = "button",
    tone = "paper",
    disabled = false,
    onclick,
    children,
  }: {
    type?: "button" | "submit";
    tone?: "paper" | "ink" | "sky";
    disabled?: boolean;
    onclick?: () => void | Promise<void>;
    children?: import("svelte").Snippet;
  } = $props();
</script>

<button class={`button button--${tone}`} {type} {disabled} {onclick}>
  {@render children?.()}
</button>

<style>
  .button {
    display: inline-flex;
    min-height: 52px;
    align-items: center;
    justify-content: center;
    border: var(--border);
    padding-inline: var(--space-6);
    background: var(--white);
    color: var(--ink);
    font-weight: 700;
    font-size: var(--step-0);
    font-family: inherit;
    cursor: pointer;
    transition: background var(--duration-fast) var(--ease-out);
  }

  .button:hover {
    background: var(--surface);
  }

  .button--ink {
    background: var(--ink);
    color: var(--white);
    border-color: var(--ink);
  }

  .button--ink:hover {
    background: var(--ink-secondary);
  }

  .button--sky {
    background: var(--sky);
    color: var(--ink);
    border-color: var(--line);
  }

  .button--sky:hover {
    background: var(--sky-strong);
    color: var(--white);
  }

  .button:disabled {
    cursor: not-allowed;
    opacity: 0.35;
  }
</style>
