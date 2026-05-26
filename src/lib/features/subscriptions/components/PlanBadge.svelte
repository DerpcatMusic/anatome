<script lang="ts">
  /** Read-only plan indicator — visible even when subscriptions checkout is disabled. */
  let {
    planName,
    planSlug,
    size = "md",
  }: {
    planName: string;
    planSlug?: string | null;
    size?: "sm" | "md";
  } = $props();

  const slug = $derived((planSlug ?? planName).trim().toLowerCase());
</script>

<span
  class="plan-badge plan-badge--{size}"
  class:plan-badge--starter={slug.includes("starter") || slug.includes("בסיס")}
  class:plan-badge--steady={slug.includes("steady") || slug.includes("קבוע")}
  class:plan-badge--guided={slug.includes("guided") || slug.includes("ליווי")}
  class:plan-badge--intensive={slug.includes("intensive") || slug.includes("אינטנס")}
  title="מסלול נוכחי"
>
  <span class="plan-badge__dot" aria-hidden="true"></span>
  <span class="plan-badge__label">{planName}</span>
</span>

<style>
  .plan-badge {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    max-width: 100%;
    padding: var(--space-1) var(--space-3);
    border: var(--border);
    border-radius: 999px;
    background: var(--white);
    font-family: var(--font-mono);
    font-weight: 800;
    line-height: 1.2;
    color: var(--ink);
  }

  .plan-badge--sm {
    font-size: var(--step--2);
    padding: 2px var(--space-2);
    gap: var(--space-1);
  }

  .plan-badge--md {
    font-size: var(--step--1);
  }

  .plan-badge__dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
    background: var(--secondary);
    box-shadow: 0 0 0 2px color-mix(in oklch, var(--secondary) 25%, transparent);
  }

  .plan-badge--starter .plan-badge__dot {
    background: var(--muted);
    box-shadow: 0 0 0 2px color-mix(in oklch, var(--foreground-muted) 30%, transparent);
  }

  .plan-badge--steady .plan-badge__dot {
    background: var(--secondary);
  }

  .plan-badge--guided .plan-badge__dot {
    background: var(--primary);
    box-shadow: 0 0 0 2px color-mix(in oklch, var(--primary) 28%, transparent);
  }

  .plan-badge--intensive .plan-badge__dot {
    background: linear-gradient(135deg, var(--primary), var(--secondary));
  }

  .plan-badge__label {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
</style>
