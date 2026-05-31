import { httpRouter } from "convex/server";
import { httpAction } from "../_generated/server";
import { internal } from "../_generated/api";

export function registerCardcomHttpRoutes(http: ReturnType<typeof httpRouter>) {
  http.route({
    path: "/api/cardcom/webhook",
    method: "POST",
    handler: httpAction(async (ctx, request) => {
      let body: {
        LowProfileId?: string;
        ResponseCode?: number;
        Description?: string;
      };
      try {
        body = (await request.json()) as typeof body;
      } catch {
        return new Response("Invalid JSON", { status: 400 });
      }

      const lowProfileId = body.LowProfileId?.trim();
      if (!lowProfileId) {
        return new Response("Missing LowProfileId", { status: 400 });
      }

      try {
        const result = await ctx.runAction(internal.payments.cardcom.webhook.handleWebhook, {
          lowProfileId,
          webhookResponseCode: body.ResponseCode,
          webhookDescription: body.Description,
        });

        if (!result.ok) {
          return new Response(result.error ?? "CardCom validation failed", {
            status: result.httpStatus,
          });
        }

        return new Response("OK", { status: result.httpStatus });
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        void message;
        return new Response(message, { status: 500 });
      }
    }),
  });
}
