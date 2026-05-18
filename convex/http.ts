import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";
import { auth } from "./auth";

const http = httpRouter();

auth.addHttpRoutes(http);

// ─── Mux webhook handler ───
http.route({
  path: "/videos/webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = (await request.json()) as Record<string, unknown>;
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
          await ctx.runAction(api.videosUpload.handleMuxWebhook, {
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
