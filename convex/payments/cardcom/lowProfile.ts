"use node";

import { v } from "convex/values";
import type { Infer } from "convex/values";
import { createLowProfile } from "./client";
import { requireCardcomEnv } from "./env";
import type { CardcomProductLine } from "./payload";

export const buyerCheckoutError =
  "מצטערים, אירעה שגיאת שרת. אנא המתינו מעט ונסו שוב. אם השגיאה חוזרת אנא צרו קשר.";

export const createLowProfileResultValidator = v.union(
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

export type CreateLowProfileResult = Infer<typeof createLowProfileResultValidator>;

export type LowProfileOrder = {
  _id: string;
  amountIls: number;
  buyerName?: string;
  buyerEmail?: string;
  buyerPhone?: string;
  buyerIdentityNumber?: string;
  productDescription: string;
};

export async function runLowProfileCheckout(input: {
  order: LowProfileOrder;
  checkoutCssPath: string;
  embedQuery: string;
  planSlug: string;
  documentProducts?: CardcomProductLine[];
  markCreateFailed: (args: {
    error: string;
    cardcomDescription?: string;
  }) => Promise<unknown>;
  markRedirectReady: (args: {
    lowProfileId: string;
    redirectUrl: string;
    cardcomOperation: string;
  }) => Promise<unknown>;
}) {
  const env = requireCardcomEnv();
  const language = "he" as const;
  const buyerName = input.order.buyerName?.trim() || "לקוח AnatoMe";
  const checkoutCssUrl = `${env.checkoutCssBase}${input.checkoutCssPath}`;

  let response;
  try {
    response = await createLowProfile({
      amountIls: input.order.amountIls,
      returnValue: input.order._id,
      operation: env.operation,
      successRedirectUrl: `${env.frontendUrl}/billing/success?orderId=${input.order._id}&${input.embedQuery}`,
      failedRedirectUrl: `${env.frontendUrl}/billing/failure?orderId=${input.order._id}&${input.embedQuery}`,
      webhookUrl: env.webhookUrl,
      language,
      embed: true,
      planSlug: input.planSlug,
      checkoutCssUrl,
      buyer: {
        name: buyerName,
        email: input.order.buyerEmail,
        phone: input.order.buyerPhone,
        identityNumber: input.order.buyerIdentityNumber,
      },
      productDescription: input.order.productDescription,
      documentProducts: input.documentProducts,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await input.markCreateFailed({ error: message });
    return { ok: false as const, error: buyerCheckoutError };
  }

  if (response.ResponseCode !== 0 || !response.LowProfileId || !response.Url) {
    await input.markCreateFailed(
      response.Description === undefined
        ? { error: "CardCom Create failed" }
        : {
            error: response.Description,
            cardcomDescription: response.Description,
          },
    );
    return { ok: false as const, error: buyerCheckoutError };
  }

  await input.markRedirectReady({
    lowProfileId: response.LowProfileId,
    redirectUrl: response.Url,
    cardcomOperation: env.operation,
  });

  return {
    ok: true as const,
    redirectUrl: response.Url,
    lowProfileId: response.LowProfileId,
  };
}
