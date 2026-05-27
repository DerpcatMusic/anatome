<script lang="ts">
  let {
    activeId = $bindable("macroflow"),
    macroLabel,
    microLabel,
    categories = [],
    onJump,
  }: {
    activeId?: string;
    macroLabel: string;
    microLabel: string;
    categories: { id: string; name: string }[];
    onJump: (id: string) => void;
  } = $props();
</script>

<nav class="catalog-rail" aria-label="ניווט בספרייה">
  <ul class="catalog-rail__list">
    <li>
      <button
        type="button"
        class="catalog-rail__item catalog-rail__item--zone"
        class:catalog-rail__item--active={activeId === "macroflow"}
        aria-current={activeId === "macroflow" ? "true" : undefined}
        onclick={() => onJump("macroflow")}
      >
        {macroLabel}
      </button>
    </li>

    <li class="catalog-rail__sep" aria-hidden="true"></li>

    <li>
      <button
        type="button"
        class="catalog-rail__item catalog-rail__item--zone"
        class:catalog-rail__item--active={activeId === "microflow"}
        aria-current={activeId === "microflow" ? "true" : undefined}
        onclick={() => onJump("microflow")}
      >
        {microLabel}
      </button>
    </li>

    {#each categories as cat (cat.id)}
      <li>
        <button
          type="button"
          class="catalog-rail__item catalog-rail__item--cat"
          class:catalog-rail__item--active={activeId === cat.id}
          aria-current={activeId === cat.id ? "true" : undefined}
          onclick={() => onJump(cat.id)}
        >
          {cat.name}
        </button>
      </li>
    {/each}
  </ul>
</nav>

<style>
  .catalog-rail {
    position: sticky;
    top: 56px;
    align-self: stretch;
    height: calc(100dvh - 56px);
    max-height: calc(100dvh - 56px);
    overflow-y: auto;
    padding: var(--space-2) 0;
    border-inline-start: var(--border);
    background: var(--paper);
    scrollbar-width: thin;
  }

  .catalog-rail__list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
  }

  .catalog-rail__sep {
    height: 1px;
    margin: var(--space-2) var(--space-3);
    background: var(--line-light, var(--border));
  }

  .catalog-rail__item {
    display: block;
    width: 100%;
    min-height: 44px;
    padding: var(--space-2) var(--space-3);
    border: none;
    background: transparent;
    text-align: start;
    cursor: pointer;
    font: inherit;
    color: inherit;
    transition: background 120ms ease;
  }

  .catalog-rail__item:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }

  .catalog-rail__item--zone {
    font-size: var(--step-0);
    font-weight: 800;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .catalog-rail__item--cat {
    font-size: var(--step--1);
    font-weight: 600;
    color: var(--foreground-muted);
    padding-inline-start: var(--space-5);
  }

  .catalog-rail__item:hover {
    background: var(--accent-soft);
  }

  .catalog-rail__item--active {
    background: var(--accent-soft);
    color: var(--ink);
    font-weight: 700;
    box-shadow: var(--shadow-sm);
  }

  .catalog-rail__item--active.catalog-rail__item--cat {
    color: var(--ink);
    font-weight: 700;
  }

  @media (max-width: 768px) {
    .catalog-rail {
      position: static;
      height: auto;
      max-height: none;
      border-inline-start: none;
      border-block-end: var(--border);
    }

    .catalog-rail__list {
      flex-direction: row;
      flex-wrap: nowrap;
      overflow-x: auto;
      padding: var(--space-2) var(--space-3);
      gap: var(--space-1);
    }

    .catalog-rail__sep {
      width: 1px;
      height: auto;
      min-height: 1.5rem;
      margin: 0 var(--space-1);
      align-self: stretch;
    }

    .catalog-rail__item--cat {
      padding-inline-start: var(--space-3);
      white-space: nowrap;
    }
  }
</style>
