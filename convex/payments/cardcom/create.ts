"use node";

import { internalAction } from "../../_generated/server";
import { internal } from "../../_generated/api";
import { v } from "convex/values";
import type { Doc } from "../../_generated/dataModel";
import {
  type CreateLowProfileResult,
  createLowProfileResultValidator,
  runLowProfileCheckout,
} from "./lowProfile";
import { subscriptionCheckoutCssPath } from "./checkoutPresentation";

export const createLowProfileForOrder = internalAction({
  args: {
    orderId: v.id("subscriptionOrders"),
  },
  returns: createLowProfileResultValidator,
  handler: async (ctx, args): Promise<CreateLowProfileResult> => {
    const order: Doc<"subscriptionOrders"> | null = await ctx.runQuery(internal.payments.cardcom.orders.getOrderInternal, {
      orderId: args.orderId,
    });
    if (order === null) {
      return { ok: false as const, error: "Order not found" };
    }

    const planSlug: string =
      (await ctx.runQuery(internal.subscriptions.plansInternal.getPlanSlugById, {
        planId: order.planId,
      })) ?? "guided";
    return await runLowProfileCheckout({
      order,
      planSlug,
      checkoutCssPath: subscriptionCheckoutCssPath(planSlug),
      embedQuery: "embed=1",
      markCreateFailed: async (failure): Promise<null> => {
        return await ctx.runMutation(internal.payments.cardcom.orders.markCreateFailed, {
          orderId: order._id,
          ...failure,
        });
      },
      markRedirectReady: async (ready): Promise<null> => {
        return await ctx.runMutation(internal.payments.cardcom.orders.markRedirectReady, {
          orderId: order._id,
          ...ready,
        });
      },
    });
  },
});
