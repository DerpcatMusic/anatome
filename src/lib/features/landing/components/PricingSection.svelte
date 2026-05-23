<script lang="ts">
  import { Button } from "bits-ui";
  import { api } from "$convex/_generated/api";
  import { initAuth } from "$lib/auth/session.svelte";
  import { useI18n } from "$lib/i18n/runes";
  import { useConvexClient, useQuery } from "convex-svelte";

  interface Props {
    openAuthOverlay: () => void;
  }

  let { openAuthOverlay }: Props = $props();

  const { t } = useI18n();
  const auth = initAuth();
  const client = useConvexClient();
  const plansQuery = useQuery(api.subscriptions.customer.listPlans, {});
  let pendingPlan = $state<string | null>(null);
  let status = $state("");

  const planDescriptions: Record<string, string> = {
    starter: "כולל את דמי הפלטפורמה, 4 סרטוני macroflow, ושיעור לייב קבוצתי אחד.",
    steady: "למי שרוצה קצב שבועי: 8 סרטוני macroflow ו-2 לייבים קבוצתיים.",
    guided: "מוסיף קרדיט 1:1 חודשי לליווי אישי לצד וידאו ולייבים.",
    intensive: "מסלול כמעט מלא עם יותר פגישות אישיות ויותר תרגול חודשי.",
  };

  async function subscribe(planSlug: string) {
    status = "";
    if (!auth.isAuthenticated) {
      openAuthOverlay();
      return;
    }

    pendingPlan = planSlug;
    try {
      await client.mutation(api.subscriptions.customer.activatePlan, { planSlug });
      window.location.assign("/u/dashboard");
    } catch (reason) {
      status = reason instanceof Error ? reason.message : "לא הצלחנו להפעיל מנוי כרגע.";
    } finally {
      pendingPlan = null;
    }
  }
</script>

<section class="content-section section--pricing" aria-label="מחירים">
  <div class="section-header section-header--center">
    <span class="section-tag">{t.landing.pricing.tag()}</span>
    <h2>{t.landing.pricing.headline()}</h2>
  </div>
  <div class="pricing-grid">
    {#each plansQuery.data ?? [] as plan, index}
      <div class="pricing-card" class:pricing-card--featured={index === 1}>
        <div class="pricing-header">
          <span class="pricing-label">{plan.nameHe}</span>
          <span class="pricing-price" class:pricing-price--highlight={index !== 1}>{plan.monthlyPriceIls} ₪/חודש</span>
        </div>
        <p class="pricing-note">{planDescriptions[plan.slug] ?? "מסלול חודשי עם קרדיטים לתרגול."}</p>
        <div class="pricing-breakdown">
          <span>פלטפורמה: {plan.platformFeeIls ?? 40} ₪</span>
          <span>Macroflow: {plan.vodCreditsPerMonth} קרדיטים</span>
          <span>לייב קבוצתי: {plan.liveCreditsPerMonth} קרדיטים</span>
          <span>1:1 אישי: {plan.oneOnOneCreditsPerMonth} קרדיטים</span>
        </div>
        <Button.Root class="hb-button hb-button--ink" type="button" disabled={pendingPlan !== null} onclick={() => subscribe(plan.slug)}>
          {pendingPlan === plan.slug ? "מפעילים..." : "הפעלת מסלול"}
        </Button.Root>
      </div>
    {/each}
  </div>
  {#if status}
    <p class="pricing-status">{status}</p>
  {/if}
  <p class="pricing-guarantee">
    כרגע אין ספק תשלום מחובר: המסלולים אמיתיים, והחיוב יחובר בהמשך דרך ספק סליקה ישראלי.
  </p>
</section>
