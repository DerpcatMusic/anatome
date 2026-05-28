import type { FunctionReturnType } from "convex/server";
import type { api } from "$convex/_generated/api";

type Plan = FunctionReturnType<typeof api.subscriptions.customer.listPlans>[number];
type SubscriptionPlan = NonNullable<
  FunctionReturnType<typeof api.users.dashboard.get>
>["subscriptionPlan"];

export type PlanChangeMode = "subscribe" | "upgrade_now" | "downgrade_scheduled" | "same";

export function resolvePlanChangeMode(
  target: Plan,
  current: SubscriptionPlan | null | undefined,
): PlanChangeMode {
  if (!current) return "subscribe";
  if (target.slug === current.slug) return "same";
  if (target.monthlyPriceIls > current.monthlyPriceIls) return "upgrade_now";
  return "downgrade_scheduled";
}

export function planChangeChargeIls(target: Plan, current: SubscriptionPlan | null | undefined) {
  if (!current) return target.monthlyPriceIls;
  if (target.monthlyPriceIls > current.monthlyPriceIls) {
    return target.monthlyPriceIls - current.monthlyPriceIls;
  }
  return 0;
}

export function orderStatusLabelHe(status: string): string {
  switch (status) {
    case "fulfilled":
      return "שולם";
    case "paid":
      return "אושר";
    case "refunded":
      return "הוחזר";
    case "failed_payment":
      return "נכשל";
    case "pending_charge":
      return "ממתין לחיוב";
    case "redirected":
      return "בתשלום";
    case "pending":
      return "ממתין";
    default:
      return status;
  }
}
