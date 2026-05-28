import type { Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import { grantWalletCredits } from "./lib";
import type { CreditPool } from "./lib";

export async function fulfillPaidCreditOrder(
  ctx: MutationCtx,
  orderId: Id<"creditOrders">,
) {
  const order = await ctx.db.get(orderId);
  if (order === null) throw new Error("Credit order not found");
  if (order.status === "fulfilled") {
    return { walletGranted: true as const, alreadyFulfilled: true as const };
  }

  const grant: Partial<Record<CreditPool, number>> = {};

  if (order.lines && order.lines.length > 0) {
    for (const line of order.lines) {
      grant[line.pool] = (grant[line.pool] ?? 0) + line.quantity;
    }
  } else {
    grant[order.pool] = order.quantity;
  }

  await grantWalletCredits(ctx, order.userId, grant);

  const now = Date.now();
  await ctx.db.patch(order._id, {
    status: "fulfilled",
    fulfilledAt: now,
    updatedAt: now,
  });

  return { walletGranted: true as const, alreadyFulfilled: false as const };
}
