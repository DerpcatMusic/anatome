"use node";

import { internalAction } from "../../_generated/server";
import { internal } from "../../_generated/api";
import { v } from "convex/values";
import { creditPoolLabelHe } from "../../credits/pricing";
import type { Doc } from "../../_generated/dataModel";
import {
  type CreateLowProfileResult,
  createLowProfileResultValidator,
  runLowProfileCheckout,
} from "./lowProfile";
import { creditCheckoutCssPath } from "./checkoutPresentation";

export const createLowProfileForCreditOrder = internalAction({
  args: {
    orderId: v.id("creditOrders"),
  },
  returns: createLowProfileResultValidator,
  handler: async (ctx, args): Promise<CreateLowProfileResult> => {
    const order: Doc<"creditOrders"> | null = await ctx.runQuery(internal.payments.cardcom.creditOrders.getCreditOrderInternal, {
      orderId: args.orderId,
    });
    if (order === null) {
      return { ok: false as const, error: "Order not found" };
    }

    const cssPool = order.lines?.[0]?.pool ?? order.pool;

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

    return await runLowProfileCheckout({
      order,
      planSlug: cssPool,
      checkoutCssPath: creditCheckoutCssPath(cssPool),
      embedQuery: "embed=1&orderKind=credit",
      documentProducts,
      markCreateFailed: async (failure): Promise<null> => {
        return await ctx.runMutation(internal.payments.cardcom.creditOrders.markCreditCreateFailed, {
          orderId: order._id,
          ...failure,
        });
      },
      markRedirectReady: async (ready): Promise<null> => {
        return await ctx.runMutation(internal.payments.cardcom.creditOrders.markCreditRedirectReady, {
          orderId: order._id,
          ...ready,
        });
      },
    });
  },
});
