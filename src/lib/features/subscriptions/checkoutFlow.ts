import type { ConvexClient } from "convex/browser";
import type { Id } from "$convex/_generated/dataModel";
import { api } from "$convex/_generated/api";

export type PlanCheckoutResult =
  | { mode: "checkout"; orderId: Id<"subscriptionOrders"> }
  | { mode: "scheduled" }
  | { mode: "unchanged" }
  | { mode: "subscribe" };

export async function pollCheckoutRedirectUrl(
  client: ConvexClient,
  orderId: Id<"subscriptionOrders">,
): Promise<string> {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    const status = await client.query(api.subscriptions.checkout.getOrderStatus, { orderId });
    if (status?.redirectUrl) return status.redirectUrl;
    if (status?.status === "failed_payment") {
      throw new Error("לא הצלחנו לפתוח את דף התשלום. נסו שוב בעוד רגע.");
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error("דף התשלום לוקח זמן להיטען. רעננו ונסו שוב.");
}

export async function runPlanCheckout(
  client: ConvexClient,
  slug: string,
  options: { hasSubscription: boolean; checkoutEnabled: boolean },
): Promise<PlanCheckoutResult> {
  if (options.hasSubscription) {
    const result = await client.mutation(api.subscriptions.customer.changePlan, {
      planSlug: slug,
    });
    if (result.mode === "checkout" && "orderId" in result) {
      return { mode: "checkout", orderId: result.orderId };
    }
    if (result.mode === "scheduled") return { mode: "scheduled" };
    if (result.mode === "unchanged") return { mode: "unchanged" };
    return { mode: "scheduled" };
  }

  if (!options.checkoutEnabled) {
    await client.mutation(api.subscriptions.customer.activatePlan, { planSlug: slug });
    return { mode: "subscribe" };
  }

  const result = await client.mutation(api.subscriptions.customer.activatePlan, { planSlug: slug });
  if ("orderId" in result) {
    return { mode: "checkout", orderId: result.orderId };
  }
  return { mode: "subscribe" };
}
