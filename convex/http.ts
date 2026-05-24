import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { auth } from "./auth";
import { resend } from "./email/resend";
import { registerMuxHttpRoutes } from "./muxHttp";

const http = httpRouter();

auth.addHttpRoutes(http);
registerMuxHttpRoutes(http);

http.route({
  path: "/resend-webhook",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    return await resend.handleResendEventWebhook(ctx, req);
  }),
});

// ─── LiveKit webhook handler ───
http.route({
  path: "/livekit/webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = await request.text();
    const authorization = request.headers.get("Authorization") ?? "";

    try {
      const validated = await ctx.runAction(internal.livekit.webhook.validate, {
        body,
        authorization,
      });

      if (!validated || !validated.event) {
        return new Response("Invalid webhook", { status: 400 });
      }

      const result = await ctx.runMutation(internal.livekitAttendance.events.handleWebhook, {
        roomName: validated.roomName,
        identity: validated.identity,
        event: validated.event,
      });

      if (validated.event === "participant_joined" && result.authorized === false) {
        await ctx.runAction(internal.livekit.webhook.removeParticipant, {
          roomName: validated.roomName,
          identity: validated.identity,
        });
      }

      return new Response("OK", { status: 200 });
    } catch (reason: unknown) {
      const message = reason instanceof Error ? reason.message : String(reason);
      console.error("[LiveKit Webhook] Error:", message);
      return new Response("Internal error", { status: 500 });
    }
  }),
});

export default http;
