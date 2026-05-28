"use node";

import { v } from "convex/values";
import { internalAction } from "../../_generated/server";
import { internal } from "../../_generated/api";
import { cancelDocument as cancelDocumentApi, chargeToken } from "./client";

const cancelDocResponseValidator = v.object({
  ResponseCode: v.number(),
  Description: v.optional(v.string()),
  NewDocumentNumber: v.optional(v.number()),
  NewDocumentType: v.optional(v.string()),
});

export const runCancelDocument = internalAction({
  args: {
    documentNumber: v.number(),
    documentType: v.string(),
  },
  returns: cancelDocResponseValidator,
  handler: async (_ctx, args) => {
    return await cancelDocumentApi({
      documentNumber: args.documentNumber,
      documentType: args.documentType,
    });
  },
});

const deferredChargeResultValidator = v.union(
  v.object({
    ok: v.literal(true),
    tranzactionId: v.optional(v.number()),
    documentNumber: v.optional(v.number()),
    documentType: v.optional(v.string()),
  }),
  v.object({
    ok: v.literal(false),
    description: v.string(),
  }),
);

export const chargeDeferred = internalAction({
  args: { orderId: v.id("subscriptionOrders") },
  returns: deferredChargeResultValidator,
  handler: async (
    ctx,
    args,
  ): Promise<
    | { ok: true; tranzactionId?: number; documentNumber?: number; documentType?: string }
    | { ok: false; description: string }
  > => {
    const order = await ctx.runQuery(internal.payments.cardcom.orders.getOrderInternal, {
      orderId: args.orderId,
    });
    if (order === null) throw new Error("Order not found");

    const buyerName = order.buyerName?.trim() || "לקוח AnatoMe";
    const response = await chargeToken({
      amountIls: order.amountIls,
      token: order.cardcomToken!,
      cardMonth: order.cardcomTokenCardMonth!,
      cardYear: order.cardcomTokenCardYear!,
      externalUniqTranId: `subscription-order:${order._id}`,
      language: "he",
      buyer: {
        name: buyerName,
        email: order.buyerEmail,
        identityNumber: order.buyerIdentityNumber,
      },
      productDescription: order.productDescription,
    });

    const result: {
      ok: true;
      tranzactionId?: number;
      documentNumber?: number;
      documentType?: string;
    } | { ok: false; description: string } = await ctx.runMutation(
      internal.payments.cardcom.refundsMutations.applyDeferredCharge,
      {
        orderId: order._id,
        responseCode: response.ResponseCode,
        description: response.Description,
        tranzactionId: response.TranzactionId,
        documentNumber: response.DocumentNumber,
        documentType: response.DocumentType,
      },
    );

    return result;
  },
});
