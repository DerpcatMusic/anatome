<script lang="ts">
  let {
    href,
    label,
    badge,
    current = false,
    disabled = false,
  }: {
    href?: string;
    label: string;
    badge?: string;
    current?: boolean;
    disabled?: boolean;
  } = $props();
</script>

{#if disabled}
  <span class="sidebar-item sidebar-item--disabled" aria-disabled="true">
    <span class="sidebar-item__label">{label}</span>
    {#if badge}
      <span class="sidebar-item__badge">{badge}</span>
    {/if}
  </span>
{:else if href}
  <a {href} class="sidebar-item" class:sidebar-item--current={current} aria-current={current ? "page" : undefined}>
    <span class="sidebar-item__label">{label}</span>
    {#if badge}
      <span class="sidebar-item__badge">{badge}</span>
    {/if}
  </a>
{/if}

<style>
  .sidebar-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-3);
    padding-block: var(--space-3);
    border-bottom: var(--border);
    color: var(--ink);
    font-size: var(--step--1);
    font-weight: 600;
    text-decoration: none;
    transition: color var(--duration-fast);
  }

  .sidebar-item:hover {
    color: var(--secondary);
  }

  .sidebar-item--current {
    font-weight: 700;
  }

  .sidebar-item--current .sidebar-item__label::before {
    content: "→ ";
    font-family: var(--font-mono);
  }

  .sidebar-item--disabled {
    color: var(--muted);
    cursor: not-allowed;
  }

  .sidebar-item--disabled:hover {
    color: var(--muted);
  }

  .sidebar-item__badge {
    font-family: var(--font-mono);
    font-size: var(--step--2);
    color: var(--muted);
    border: var(--border);
    padding: 1px 6px;
    line-height: 1;
    flex-shrink: 0;
  }

  @media (max-width: 820px) {
    .sidebar-item {
      border-bottom: 0;
      border: var(--border);
      padding: var(--space-2) var(--space-3);
    }
  }
</style>
