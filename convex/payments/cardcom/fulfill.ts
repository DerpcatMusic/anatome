import { v } from "convex/values";
import { internalMutation } from "../../_generated/server";
import { fulfillPaidCreditOrder } from "../../credits/fulfill";
import { fulfillPaidOrder } from "../../subscriptions/lib";
import { logCardcomAudit } from "./audit";

const lpResultValidator = v.object({
  responseCode: v.number(),
  description: v.optional(v.string()),
  tranzactionId: v.optional(v.number()),
  operation: v.optional(v.string()),
  documentType: v.optional(v.string()),
  documentNumber: v.optional(v.number()),
  token: v.optional(v.string()),
  cardYear: v.optional(v.number()),
  cardMonth: v.optional(v.number()),
  tokenApprovalNumber: v.optional(v.string()),
  cardOwnerIdentityNumber: v.optional(v.string()),
});

const webhookApplyResultValidator = v.object({
  ok: v.boolean(),
  reason: v.string(),
});

export const applyWebhookResult = internalMutation({
  args: {
    lowProfileId: v.string(),
    lpResult: lpResultValidator,
  },
  returns: webhookApplyResultValidator,
  handler: async (ctx, args) => {
    const subscriptionOrders = await ctx.db
      .query("subscriptionOrders")
      .withIndex("by_cardcomLowProfileId", (q) =>
        q.eq("cardcomLowProfileId", args.lowProfileId),
      )
      .take(1);
    const subscriptionOrder = subscriptionOrders[0] ?? null;

    const creditOrders = await ctx.db
      .query("creditOrders")
      .withIndex("by_cardcomLowProfileId", (q) =>
        q.eq("cardcomLowProfileId", args.lowProfileId),
      )
      .take(1);
    const creditOrder = creditOrders[0] ?? null;

    const orderKind = subscriptionOrder ? ("subscription" as const) : creditOrder ? ("credit" as const) : null;
    const order = subscriptionOrder ?? creditOrder;

    if (order === null || orderKind === null) {
      await logCardcomAudit(ctx, "cardcom.webhook.order_not_found", {
        lowProfileId: args.lowProfileId,
        importance: "high",
      });
      return { ok: false as const, reason: "order_not_found" as const };
    }

    if (
      order.status === "fulfilled" ||
      (order.cardcomTranzactionId !== undefined && order.cardcomTranzactionId > 0)
    ) {
      return { ok: true as const, reason: "idempotent" as const };
    }

    const now = Date.now();
    const { lpResult } = args;
    const responseCodeStr = String(lpResult.responseCode);
    const operation = lpResult.operation ?? order.cardcomOperation ?? "ChargeOnly";

    let nextStatus = order.status;
    if (lpResult.responseCode !== 0) {
      nextStatus = "failed_payment";
    } else if (operation === "CreateTokenOnly") {
      nextStatus = "pending_charge";
    } else {
      nextStatus = "paid";
    }

    await ctx.db.patch(order._id, {
      cardcomResponseCode: responseCodeStr,
      cardcomDescription: lpResult.description,
      cardcomDocumentType: lpResult.documentType,
      cardcomDocumentNumber: lpResult.documentNumber,
      cardcomToken: lpResult.token,
      cardcomTokenCardYear: lpResult.cardYear,
      cardcomTokenCardMonth: lpResult.cardMonth,
      cardcomTokenApprovalNumber: lpResult.tokenApprovalNumber,
      cardcomTokenCardOwnerIdentityNumber: lpResult.cardOwnerIdentityNumber,
      cardcomTranzactionId:
        lpResult.responseCode === 0 && operation === "ChargeOnly"
          ? lpResult.tranzactionId ?? 0
          : operation === "CreateTokenOnly"
            ? 0
            : order.cardcomTranzactionId,
      status: nextStatus,
      failedAt: lpResult.responseCode !== 0 ? now : order.failedAt,
      updatedAt: now,
    });

    if (lpResult.responseCode !== 0) {
      await logCardcomAudit(
        ctx,
        "cardcom.webhook.payment_failed",
        {
          orderId: order._id,
          lowProfileId: args.lowProfileId,
          responseCode: lpResult.responseCode,
          description: lpResult.description,
          importance: "high",
        },
        order.userId,
      );
      return { ok: true as const, reason: "failed_payment" as const };
    }

    if (operation === "ChargeOnly") {
      if (orderKind === "subscription" && subscriptionOrder) {
        await fulfillPaidOrder(ctx, subscriptionOrder._id);
      } else if (orderKind === "credit" && creditOrder) {
        await fulfillPaidCreditOrder(ctx, creditOrder._id);
      }
    }

    return { ok: true as const, reason: "processed" as const };
  },
});
