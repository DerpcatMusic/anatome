"use node";

import { v } from "convex/values";
import { internalAction } from "../../_generated/server";
import { internal } from "../../_generated/api";
import { createLowProfile } from "./client";
import { requireCardcomEnv } from "./env";
import { creditPoolLabelHe } from "../../credits/pricing";

const BUYER_CHECKOUT_ERROR =
  "מצטערים, אירעה שגיאת שרת. אנא המתינו מעט ונסו שוב. אם השגיאה חוזרת אנא צרו קשר.";

const createLowProfileResultValidator = v.union(
  v.object({
    ok: v.literal(true),
    redirectUrl: v.string(),
    lowProfileId: v.string(),
  }),
  v.object({
    ok: v.literal(false),
    error: v.string(),
  }),
);

const CSS_BY_POOL: Record<string, string> = {
  vod: "/cardcom/checkout-credits-vod.css",
  live: "/cardcom/checkout-credits-live.css",
  oneOnOne: "/cardcom/checkout-credits-private.css",
};

export const createLowProfileForCreditOrder = internalAction({
  args: {
    orderId: v.id("creditOrders"),
  },
  returns: createLowProfileResultValidator,
  handler: async (ctx, args) => {
    const order = await ctx.runQuery(internal.payments.cardcom.creditOrders.getCreditOrderInternal, {
      orderId: args.orderId,
    });
    if (order === null) {
      return { ok: false as const, error: "Order not found" };
    }

    const env = requireCardcomEnv();
    const language = "he" as const;
    const buyerName = order.buyerName?.trim() || "לקוח AnatoMe";
    const cssPool = order.lines?.[0]?.pool ?? order.pool;
    const cssPath = CSS_BY_POOL[cssPool] ?? CSS_BY_POOL.vod;
    const checkoutCssUrl = `${env.checkoutCssBase}${cssPath}`;
    const embedQuery = "embed=1&orderKind=credit";

    const documentProducts =
      order.lines && order.lines.length > 0
        ? order.lines.map((line) => ({
            description: `${creditPoolLabelHe(line.pool)} · ${line.quantity}`,
            unitCost: line.unitEffectiveIls,
            quantity: line.quantity,
          }))
        : [
            {
              description: order.productDescription,
              unitCost: order.unitEffectiveIls,
              quantity: order.quantity,
            },
          ];

    let response;
    try {
      response = await createLowProfile({
        amountIls: order.amountIls,
        returnValue: order._id,
        operation: env.operation,
        successRedirectUrl: `${env.frontendUrl}/billing/success?orderId=${order._id}&${embedQuery}`,
        failedRedirectUrl: `${env.frontendUrl}/billing/failure?orderId=${order._id}&${embedQuery}`,
        webhookUrl: env.webhookUrl,
        language,
        embed: true,
        planSlug: cssPool,
        checkoutCssUrl,
        buyer: {
          name: buyerName,
          email: order.buyerEmail,
        },
        productDescription: order.productDescription,
        documentProducts,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      await ctx.runMutation(internal.payments.cardcom.creditOrders.markCreditCreateFailed, {
        orderId: order._id,
        error: message,
      });
      return { ok: false as const, error: BUYER_CHECKOUT_ERROR };
    }

    if (response.ResponseCode !== 0 || !response.LowProfileId || !response.Url) {
      await ctx.runMutation(internal.payments.cardcom.creditOrders.markCreditCreateFailed, {
        orderId: order._id,
        error: response.Description ?? "CardCom Create failed",
        cardcomDescription: response.Description,
      });
      return { ok: false as const, error: BUYER_CHECKOUT_ERROR };
    }

    await ctx.runMutation(internal.payments.cardcom.creditOrders.markCreditRedirectReady, {
      orderId: order._id,
      lowProfileId: response.LowProfileId,
      redirectUrl: response.Url,
      cardcomOperation: env.operation,
    });

    return {
      ok: true as const,
      redirectUrl: response.Url,
      lowProfileId: response.LowProfileId,
    };
  },
});
