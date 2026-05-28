import { v } from "convex/values";
import { internalMutation } from "../../_generated/server";
import { fulfillPaidOrder } from "../../subscriptions/lib";

export const applyDeferredCharge = internalMutation({
  args: {
    orderId: v.id("subscriptionOrders"),
    responseCode: v.number(),
    description: v.optional(v.string()),
    tranzactionId: v.optional(v.number()),
    documentNumber: v.optional(v.number()),
    documentType: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);
    if (order === null) throw new Error("Order not found");

    const now = Date.now();
    await ctx.db.patch(order._id, {
      cardcomResponseCode: String(args.responseCode),
      cardcomDescription: args.description,
      cardcomTranzactionId: args.tranzactionId,
      cardcomDocumentNumber: args.documentNumber,
      cardcomDocumentType: args.documentType,
      updatedAt: now,
    });

    if (args.responseCode !== 0) {
      return {
        ok: false as const,
        description: args.description ?? "Charge failed",
      };
    }

    await ctx.db.patch(order._id, { status: "paid", updatedAt: now });
    await fulfillPaidOrder(ctx, order._id);

    return {
      ok: true as const,
      tranzactionId: args.tranzactionId,
      documentNumber: args.documentNumber,
      documentType: args.documentType,
    };
  },
});
