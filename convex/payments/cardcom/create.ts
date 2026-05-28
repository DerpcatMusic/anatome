"use node";

import { v } from "convex/values";
import { internalAction } from "../../_generated/server";
import { internal } from "../../_generated/api";
import { createLowProfile } from "./client";
import { requireCardcomEnv } from "./env";

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

export const createLowProfileForOrder = internalAction({
  args: {
    orderId: v.id("subscriptionOrders"),
  },
  returns: createLowProfileResultValidator,
  handler: async (ctx, args) => {
    const order = await ctx.runQuery(internal.payments.cardcom.orders.getOrderInternal, {
      orderId: args.orderId,
    });
    if (order === null) {
      return { ok: false as const, error: "Order not found" };
    }

    const env = requireCardcomEnv();
    const language = "he" as const;
    const buyerName = order.buyerName?.trim() || "לקוח AnatoMe";
    const planSlug =
      (await ctx.runQuery(internal.subscriptions.plansInternal.getPlanSlugById, {
        planId: order.planId,
      })) ?? "guided";
    const cssPathBySlug: Record<string, string> = {
      starter: "/cardcom/checkout-starter.css",
      steady: "/cardcom/checkout-steady.css",
      guided: "/cardcom/checkout-guided.css",
      intensive: "/cardcom/checkout-intensive.css",
    };
    const cssPath = cssPathBySlug[planSlug] ?? cssPathBySlug.guided;
    const checkoutCssUrl = `${env.checkoutCssBase}${cssPath}`;
    const embedQuery = "embed=1";

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
        planSlug,
        checkoutCssUrl,
        buyer: {
          name: buyerName,
          email: order.buyerEmail,
          phone: order.buyerPhone,
          identityNumber: order.buyerIdentityNumber,
        },
        productDescription: order.productDescription,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      await ctx.runMutation(internal.payments.cardcom.orders.markCreateFailed, {
        orderId: order._id,
        error: message,
      });
      return { ok: false as const, error: BUYER_CHECKOUT_ERROR };
    }

    if (response.ResponseCode !== 0 || !response.LowProfileId || !response.Url) {
      await ctx.runMutation(internal.payments.cardcom.orders.markCreateFailed, {
        orderId: order._id,
        error: response.Description ?? "CardCom Create failed",
        cardcomDescription: response.Description,
      });
      return { ok: false as const, error: BUYER_CHECKOUT_ERROR };
    }

    await ctx.runMutation(internal.payments.cardcom.orders.markRedirectReady, {
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
