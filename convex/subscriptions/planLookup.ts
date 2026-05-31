import type { Doc } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import { DEFAULT_PLANS, planPayload } from "./plans";

export async function getActivePlanBySlug(
  ctx: MutationCtx,
  planSlug: string,
): Promise<Doc<"plans"> | null> {
  const slug = planSlug.trim().toLowerCase();
  const plans = await ctx.db
    .query("plans")
    .withIndex("by_slug", (q) => q.eq("slug", slug))
    .take(10);
  return plans.find((plan) => plan.isActive) ?? null;
}

export async function resolveCheckoutPlan(
  ctx: MutationCtx,
  planSlug: string,
): Promise<Doc<"plans">> {
  const slug = planSlug.trim().toLowerCase();
  let plan = await getActivePlanBySlug(ctx, slug);
  if (plan === null) {
    const fallback = DEFAULT_PLANS.find((item) => item.slug === slug);
    if (fallback === undefined) throw new Error("Plan is not available");
    const planId = await ctx.db.insert("plans", planPayload(fallback));
    plan = await ctx.db.get(planId);
  }
  if (plan === null || !plan.isActive) throw new Error("Plan is not available");
  return plan;
}
