"use node";

import webpush from "web-push";
import { v } from "convex/values";
import { internalAction } from "../_generated/server";
import { internal } from "../_generated/api";

function configureWebPush() {
  const publicKey = process.env.VAPID_PUBLIC_KEY?.trim();
  const privateKey = process.env.VAPID_PRIVATE_KEY?.trim();
  const subject = process.env.VAPID_SUBJECT?.trim() || process.env.FRONTEND_URL?.trim() || "mailto:noreply@anatome.co.il";

  if (!publicKey || !privateKey) {
    return null;
  }

  webpush.setVapidDetails(subject, publicKey, privateKey);
  return { publicKey, privateKey };
}

type PushSendResult = {
  attempted: number;
  sent: number;
  removed: number;
};

type PushSubscriptionRow = {
  endpoint: string;
  keys: { p256dh: string; auth: string };
};

export const sendToUser = internalAction({
  args: {
    userId: v.id("users"),
    payload: v.object({
      title: v.string(),
      body: v.string(),
      url: v.string(),
      tag: v.optional(v.string()),
    }),
  },
  returns: v.object({
    attempted: v.number(),
    sent: v.number(),
    removed: v.number(),
  }),
  handler: async (ctx, args): Promise<PushSendResult> => {
    const vapid = configureWebPush();
    if (vapid === null) {
      return { attempted: 0, sent: 0, removed: 0 };
    }

    const subscriptions: PushSubscriptionRow[] = await ctx.runQuery(
      internal.push.queries.subscriptionsForUser,
      {
        userId: args.userId,
      },
    );

    let sent = 0;
    let removed = 0;

    for (const sub of subscriptions) {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: sub.keys,
          },
          JSON.stringify({
            title: args.payload.title,
            body: args.payload.body,
            url: args.payload.url,
            tag: args.payload.tag,
            icon: "/icons/icon-192.png",
          }),
        );
        sent += 1;
      } catch (error) {
        const statusCode =
          error && typeof error === "object" && "statusCode" in error
            ? Number((error as { statusCode: number }).statusCode)
            : 0;
        if (statusCode === 404 || statusCode === 410) {
          await ctx.runMutation(internal.push.subscribeInternal.removeByEndpoint, {
            endpoint: sub.endpoint,
          });
          removed += 1;
        }
      }
    }

    return { attempted: subscriptions.length, sent, removed };
  },
});
