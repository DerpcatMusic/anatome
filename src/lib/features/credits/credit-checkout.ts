import type { ConvexClient } from "convex/browser";
import type { Id } from "$convex/_generated/dataModel";
import { api } from "$convex/_generated/api";

export async function pollCreditCheckoutUrl(
  client: ConvexClient,
  orderId: Id<"creditOrders">,
): Promise<string> {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    const status = await client.query(api.credits.checkout.getOrderStatus, { orderId });
    if (status?.redirectUrl) return status.redirectUrl;
    if (status?.status === "failed_payment") {
      throw new Error("לא הצלחנו לפתוח את דף התשלום. נסו שוב בעוד רגע.");
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error("דף התשלום לוקח זמן להיטען. רעננו ונסו שוב.");
}
