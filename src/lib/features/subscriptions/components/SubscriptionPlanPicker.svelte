<script lang="ts">
  import type { FunctionReturnType } from "convex/server";
  import { api } from "$convex/_generated/api";
  import CreditPoolChip from "$lib/features/credits/CreditPoolChip.svelte";
  import { planTierTheme } from "../planTierTheme";
  import "./plan-picker.css";

  type Plan = NonNullable<FunctionReturnType<typeof api.subscriptions.customer.listPlans>>[number];

  let {
    plans,
    highlightSlug = null,
    activePlanSlug = null,
    pendingPlanSlug = null,
    pending = null,
    onSelectPlan,
  }: {
    plans: Plan[];
    highlightSlug?: string | null;
    activePlanSlug?: string | null;
    pendingPlanSlug?: string | null;
    pending?: string | null;
    onSelectPlan: (slug: string) => void;
  } = $props();

  const sortedPlans = $derived(
    [...plans].sort((a, b) => planTierTheme(a.slug).tier - planTierTheme(b.slug).tier),
  );

</script>

<div class="plan-picker-grid" role="list">
  {#each sortedPlans as plan (plan.slug)}
    {@const theme = planTierTheme(plan.slug)}
    {@const isActive = plan.slug === activePlanSlug}
    {@const isScheduled = plan.slug === pendingPlanSlug}
    {@const isHighlighted = plan.slug === highlightSlug}
    <button
      type="button"
      class="plan-picker-card {theme.cardClass}"
      class:plan-picker-card--highlight={isHighlighted}
      disabled={pending !== null || isActive || isScheduled}
      onclick={() => onSelectPlan(plan.slug)}
      role="listitem"
    >
      <p class="plan-picker-card__tier">{theme.label}</p>
      <h3 class="plan-picker-card__name">{plan.nameHe}</h3>
      <p class="plan-picker-card__price">{plan.monthlyPriceIls} ₪<span aria-hidden="true">/חודש</span></p>
      <p class="plan-picker-card__tagline">{theme.tagline}</p>
      <div class="plan-picker-card__credits">
        <CreditPoolChip pool="vod" count={plan.vodCreditsPerMonth} label="מוקלט" size="xs" />
        <CreditPoolChip pool="live" count={plan.liveCreditsPerMonth} label="לייב" size="xs" />
        <CreditPoolChip pool="oneOnOne" count={plan.oneOnOneCreditsPerMonth} label="פרטי" size="xs" />
      </div>
      <span class="hb-button hb-button--paper hb-button--sm plan-picker-card__cta">
        {#if isActive}
          המסלול הנוכחי
        {:else if isScheduled}
          מתוזמן
        {:else if pending === plan.slug}
          מעבדים…
        {:else}
          בחירת מסלול
        {/if}
      </span>
    </button>
  {/each}
</div>

<style>
  .plan-picker-card__cta {
    justify-self: start;
    pointer-events: none;
  }
</style>
