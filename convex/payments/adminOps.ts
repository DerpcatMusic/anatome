"use node";

/**
 * CardCom refund / deferred charge — internal only.
 * Run from Convex Dashboard or CLI, not from the public website.
 *
 * Example: internal.payments.adminOps.refundOrder({ orderId: "..." })
 */
import { v } from "convex/values";
import { internalAction } from "../_generated/server";
import { internal } from "../_generated/api";
import type { Doc } from "../_generated/dataModel";

const refundResultValidator = v.union(
  v.object({
    ok: v.literal(true),
    newDocumentNumber: v.optional(v.number()),
    newDocumentType: v.optional(v.string()),
  }),
  v.object({
    ok: v.literal(false),
    description: v.string(),
  }),
);

const chargeResultValidator = v.union(
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

export const refundOrder = internalAction({
  args: { orderId: v.id("subscriptionOrders") },
  returns: refundResultValidator,
  handler: async (
    _ctx,
    args,
  ): Promise<
    | { ok: true; newDocumentNumber?: number; newDocumentType?: string }
    | { ok: false; description: string }
  > => {
    const order: Doc<"subscriptionOrders"> | null = await _ctx.runQuery(
      internal.payments.adminInternal.getOrderInternal,
      { orderId: args.orderId },
    );
    if (order === null) throw new Error("Order not found");
    if (order.cardcomDocumentNumber === undefined || !order.cardcomDocumentType) {
      throw new Error("Order has no CardCom document to refund");
    }

    const response: {
      ResponseCode: number;
      Description?: string;
      NewDocumentNumber?: number;
      NewDocumentType?: string;
    } = await _ctx.runAction(internal.payments.cardcom.refunds.runCancelDocument, {
      documentNumber: order.cardcomDocumentNumber,
      documentType: order.cardcomDocumentType,
    });

    if (response.ResponseCode !== 0) {
      return {
        ok: false as const,
        description: response.Description ?? "Refund failed",
      };
    }

    await _ctx.runMutation(internal.payments.adminInternal.applyRefund, {
      orderId: args.orderId,
      newDocumentNumber: response.NewDocumentNumber,
      newDocumentType: response.NewDocumentType,
    });

    return {
      ok: true as const,
      newDocumentNumber: response.NewDocumentNumber,
      newDocumentType: response.NewDocumentType,
    };
  },
});

export const chargeDeferredOrder = internalAction({
  args: { orderId: v.id("subscriptionOrders") },
  returns: chargeResultValidator,
  handler: async (
    _ctx,
    args,
  ): Promise<
    | { ok: true; tranzactionId?: number; documentNumber?: number; documentType?: string }
    | { ok: false; description: string }
  > => {
    const order: Doc<"subscriptionOrders"> | null = await _ctx.runQuery(
      internal.payments.adminInternal.getOrderInternal,
      { orderId: args.orderId },
    );
    if (order === null) throw new Error("Order not found");

    if (order.cardcomOperation !== "CreateTokenOnly") {
      throw new Error("Order is not a deferred token charge");
    }
    if (order.status !== "pending_charge") {
      throw new Error("Order is not pending charge");
    }
    if (order.cardcomTranzactionId !== undefined && order.cardcomTranzactionId > 0) {
      throw new Error("Order already has a transaction");
    }
    if (
      !order.cardcomToken ||
      order.cardcomTokenCardMonth === undefined ||
      order.cardcomTokenCardYear === undefined
    ) {
      throw new Error("Order is missing token details");
    }

    return await _ctx.runAction(internal.payments.cardcom.refunds.chargeDeferred, {
      orderId: order._id,
    });
  },
});
