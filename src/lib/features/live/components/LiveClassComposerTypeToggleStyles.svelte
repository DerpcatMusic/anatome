<style>
  :global(.live-type-toggle) {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-2);
    width: 100%;
  }

  :global(.live-type-toggle__item) {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-2);
    min-height: 44px;
    padding: var(--space-2) var(--space-3);
    border: var(--border);
    background: var(--elevated);
    color: var(--ink);
    font: inherit;
    font-weight: 800;
    font-size: var(--step--1);
    cursor: pointer;
    border-radius: 4px;
    transition:
      background 0.2s ease,
      border-color 0.2s ease,
      border-radius 0.35s ease,
      transform 0.08s ease;
  }

  :global(.live-type-toggle__item[data-state="on"]) {
    background: color-mix(in oklch, var(--accent) 22%, var(--elevated));
    border-color: var(--accent);
  }

  :global(.live-type-toggle__item[data-state="on"][data-value="one_on_one"]) {
    background: var(--surface);
    border-color: var(--primary);
  }

  :global(.live-type-toggle__item:hover:not([data-state="on"])) {
    background: var(--surface);
    border-color: color-mix(in oklch, var(--accent) 45%, var(--line-light));
  }

  :global(.live-type-toggle__item[data-state="on"]:hover) {
    box-shadow: 0 0 0 1px color-mix(in oklch, var(--accent) 55%, transparent);
  }

  :global(.live-type-toggle__item[data-state="on"][data-value="one_on_one"]:hover) {
    background: color-mix(in oklch, var(--primary) 10%, var(--surface));
    border-color: var(--primary);
    box-shadow: 0 0 0 1px color-mix(in oklch, var(--primary) 45%, transparent);
  }

  :global(.live-type-toggle__item .material-symbols-rounded) {
    font-size: var(--step-1);
  }

  :global(.live-composer--popover :global(.live-type-toggle--quick)) {
    gap: var(--space-1);
    padding: var(--space-1);
    background: var(--surface);
    border-radius: 8px;
    border: none;
  }

  :global(.live-composer--popover :global(.live-type-toggle--quick .live-type-toggle__item)) {
    min-height: 40px;
    border: none;
    background: transparent;
    border-radius: 6px;
  }

  :global(.live-composer--popover :global(.live-type-toggle--quick .live-type-toggle__item[data-state="on"])) {
    background: color-mix(in oklch, var(--accent) 22%, var(--surface));
    color: var(--ink);
    box-shadow: none;
  }

  :global(.live-composer--popover
    :global(.live-type-toggle--quick .live-type-toggle__item[data-state="on"][data-value="one_on_one"])) {
    background: color-mix(in oklch, var(--primary) 18%, var(--paper));
    color: var(--primary);
  }
</style>
