"use node";

import { RoomServiceClient } from "livekit-server-sdk";
import { v } from "convex/values";
import { internalAction } from "../_generated/server";
import { internal } from "../_generated/api";
import { requireLiveKitEnv, httpUrlForLiveKit } from "../lib/livekitEnv";

const expireDueResultValidator = v.object({
  expiredClasses: v.number(),
  deletedRooms: v.number(),
});

export const expireDue = internalAction({
  args: {},
  returns: expireDueResultValidator,
  handler: async (ctx) => {
    const result: { expiredRoomNames: string[] } = await ctx.runMutation(
      internal.live.cron.expire,
      { now: Date.now() },
    );

    if (result.expiredRoomNames.length === 0) {
      return { expiredClasses: 0, deletedRooms: 0 };
    }

    let env: ReturnType<typeof requireLiveKitEnv>;
    try {
      env = requireLiveKitEnv();
    } catch {
      return { expiredClasses: result.expiredRoomNames.length, deletedRooms: 0 };
    }

    const roomClient = new RoomServiceClient(httpUrlForLiveKit(env.wsUrl), env.apiKey, env.apiSecret);
    let deletedRooms = 0;

    for (const roomName of result.expiredRoomNames) {
      try {
        await roomClient.deleteRoom(roomName);
        deletedRooms += 1;
      } catch {
        /* ignore */
      }
    }

    return { expiredClasses: result.expiredRoomNames.length, deletedRooms };
  },
});

export const deleteRoomByName = internalAction({
  args: {
    roomName: v.string(),
  },
  returns: v.object({ deleted: v.boolean() }),
  handler: async (_ctx, args) => {
    let env: ReturnType<typeof requireLiveKitEnv>;
    try {
      env = requireLiveKitEnv();
    } catch {
      return { deleted: false };
    }

    const roomClient = new RoomServiceClient(httpUrlForLiveKit(env.wsUrl), env.apiKey, env.apiSecret);
    try {
      await roomClient.deleteRoom(args.roomName);
      return { deleted: true };
    } catch {
      return { deleted: false };
    }
  },
});
