import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { auth } from "./auth";

const http = httpRouter();

auth.addHttpRoutes(http);

// ─── Mux webhook handler ───
http.route({
  path: "/videos/webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const rawBody = await request.text();
    const signature = request.headers.get("mux-signature") ?? "";

    const webhookSecret = process.env.MUX_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error("[Mux Webhook] MUX_WEBHOOK_SECRET is not configured");
      return new Response("Webhook secret not configured", { status: 500 });
    }

    try {
      const { Mux } = await import("@mux/mux-node");
      const mux = new Mux({ webhookSecret });
      await mux.webhooks.verifySignature(rawBody, { "mux-signature": signature });
    } catch (reason: unknown) {
      const message = reason instanceof Error ? reason.message : String(reason);
      console.error("[Mux Webhook] Signature verification failed:", message);
      return new Response("Invalid signature", { status: 401 });
    }

    const body = JSON.parse(rawBody) as Record<string, unknown>;
    const type = body.type as string | undefined;

    if (type === "video.asset.ready" || type === "video.asset.errored") {
      const data = body.data as Record<string, unknown> | undefined;

      if (data !== undefined) {
        const muxAssetId = data.id as string;
        const duration = (data.duration as number) ?? 0;
        const status = type === "video.asset.errored" ? "errored" : "ready";
        const thumbnailUrl = typeof data.thumbnail === "string" ? data.thumbnail : undefined;

        // For direct uploads, Mux includes the upload ID
        const uploadId = (data.upload_id as string) ?? "";

        if (uploadId) {
          await ctx.runAction(internal.video.uploads.handleMuxWebhook, {
            muxUploadId: uploadId,
            muxAssetId,
            duration,
            thumbnailUrl,
            status: status as "ready" | "errored",
          });
        }
      }
    }

    return new Response("OK", { status: 200 });
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
      const validated = await ctx.runAction(internal.livekitWebhook.validate, {
        body,
        authorization,
      });

      if (!validated || !validated.event) {
        return new Response("Invalid webhook", { status: 400 });
      }

      const result = await ctx.runMutation(internal.livekitAttendance.handleWebhookEvent, {
        roomName: validated.roomName,
        identity: validated.identity,
        event: validated.event,
      });

      if (validated.event === "participant_joined" && result.authorized === false) {
        await ctx.runAction(internal.livekitWebhook.removeParticipant, {
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

// Pre-flight CORS for Mux webhooks
http.route({
  path: "/videos/webhook",
  method: "OPTIONS",
  handler: httpAction(async (_ctx, request) => {
    const origin = request.headers.get("Origin") ?? "*";
    return new Response(null, {
      status: 204,
      headers: new Headers({
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Methods": "POST",
        "Access-Control-Allow-Headers": "Content-Type",
      }),
    });
  }),
});

export default http;
