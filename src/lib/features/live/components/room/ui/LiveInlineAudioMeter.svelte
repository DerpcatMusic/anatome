<script lang="ts">
  let { level, label }: { level: number; label: string } = $props();
  const scale = $derived(Math.max(0, Math.min(1, level)));
</script>

<div class="lr-inline-meter" role="meter" aria-label={label} aria-valuenow={Math.round(scale * 100)} aria-valuemin={0} aria-valuemax={100}>
  <div class="lr-inline-meter__track">
    <div class="lr-inline-meter__fill" style:--meter-scale={scale}></div>
  </div>
</div>

<style>
  .lr-inline-meter {
    flex: 0 1 72px;
    min-width: 56px;
    max-width: 96px;
    display: flex;
    align-items: center;
    padding-inline: var(--space-2);
    margin-inline-start: 2px;
    border-inline-start: 1px solid var(--lr-bar-edge);
  }

  .lr-inline-meter__track {
    position: relative;
    width: 100%;
    height: 6px;
    border-radius: 999px;
    overflow: hidden;
    background: color-mix(in oklch, var(--foreground) 12%, transparent);
  }

  .lr-inline-meter__fill {
    position: absolute;
    inset: 0;
    transform-origin: inline-start center;
    transform: scaleX(var(--meter-scale, 0));
    border-radius: inherit;
    background: linear-gradient(
      90deg,
      color-mix(in oklch, var(--foreground) 45%, transparent),
      color-mix(in oklch, var(--foreground) 78%, transparent)
    );
  }
</style>
