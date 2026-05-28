"use node";

import { v } from "convex/values";
import { internalAction } from "../../_generated/server";
import { internal } from "../../_generated/api";
import { getLpResult } from "./client";

const webhookResultValidator = v.union(
  v.object({
    ok: v.literal(true),
    httpStatus: v.number(),
    result: v.any(),
  }),
  v.object({
    ok: v.literal(false),
    httpStatus: v.number(),
    error: v.string(),
  }),
);

export const handleWebhook = internalAction({
  args: {
    lowProfileId: v.string(),
    webhookResponseCode: v.optional(v.number()),
    webhookDescription: v.optional(v.string()),
  },
  returns: webhookResultValidator,
  handler: async (ctx, args): Promise<
    | { ok: true; httpStatus: number; result: { ok: boolean; reason: string } }
    | { ok: false; httpStatus: number; error: string }
  > => {
    let lpResult;
    try {
      lpResult = await getLpResult(args.lowProfileId);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { ok: false as const, httpStatus: 500, error: message };
    }

    const result: { ok: boolean; reason: string } = await ctx.runMutation(
      internal.payments.cardcom.fulfill.applyWebhookResult,
      {
      lowProfileId: args.lowProfileId,
      lpResult: {
        responseCode: lpResult.ResponseCode,
        description: lpResult.Description,
        tranzactionId: lpResult.TranzactionId,
        operation: lpResult.Operation,
        documentType: lpResult.DocumentInfo?.DocumentType,
        documentNumber: lpResult.DocumentInfo?.DocumentNumber,
        token: lpResult.TokenInfo?.Token,
        cardYear: lpResult.TokenInfo?.CardYear,
        cardMonth: lpResult.TokenInfo?.CardMonth,
        tokenApprovalNumber: lpResult.TokenInfo?.TokenApprovalNumber,
        cardOwnerIdentityNumber: lpResult.TokenInfo?.CardOwnerIdentityNumber,
      },
      },
    );

    return { ok: true as const, httpStatus: 200, result };
  },
});
