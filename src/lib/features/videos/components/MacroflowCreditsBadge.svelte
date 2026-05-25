<script lang="ts">
  let {
    balance,
  }: {
    balance: number;
  } = $props();
</script>

<div class="macroflow-credits" aria-label="יתרת קרדיטי וידאו">
  <span class="macroflow-credits__icon" aria-hidden="true">▶</span>
  <div class="macroflow-credits__copy">
    <span class="macroflow-credits__label">קרדיטי Macroflow</span>
    <span class="macroflow-credits__value">{balance}</span>
  </div>
</div>

<style>
  .macroflow-credits {
    display: inline-flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-2) var(--space-4);
    border: var(--border);
    background: linear-gradient(135deg, var(--white) 0%, var(--surface) 100%);
    box-shadow: var(--shadow-sm), inset 0 0 0 2px color-mix(in oklch, var(--secondary) 25%, transparent);
    border-radius: 999px;
    min-width: 0;
  }

  .macroflow-credits__icon {
    display: grid;
    place-items: center;
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    background: var(--secondary);
    color: var(--white);
    font-size: 0.65rem;
    flex-shrink: 0;
  }

  .macroflow-credits__copy {
    display: grid;
    gap: 0.1rem;
    min-width: 0;
  }

  .macroflow-credits__label {
    font-family: var(--font-mono);
    font-size: var(--step--2);
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--muted);
    line-height: 1;
  }

  .macroflow-credits__value {
    font-family: var(--font-display);
    font-size: var(--step-1);
    line-height: 1;
    color: var(--ink);
  }
</style>
