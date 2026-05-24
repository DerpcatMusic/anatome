"use node";

import { AccessToken } from "livekit-server-sdk";
import { v } from "convex/values";
import { action } from "../_generated/server";
import { internal } from "../_generated/api";
import { requireLiveKitEnv } from "../lib/livekitEnv";
import { TTL } from "../lib/constants";
import {
  issueJoinResultValidator,
  type IssueJoinResult,
  type PrepareJoinResult,
} from "../live/joinContract";
import { liveKitParticipantIdentity } from "../live/joinPolicy";
import { buildLiveKitVideoGrant } from "./grants";
import { ensureLiveKitRoom } from "./ensureRoom";

export const issueJoin = action({
  args: {
    liveClassId: v.id("liveClasses"),
  },
  returns: issueJoinResultValidator,
  handler: async (ctx, args): Promise<IssueJoinResult> => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error("Authentication required");
    }

    const { apiKey, apiSecret, wsUrl } = requireLiveKitEnv();
    const join: PrepareJoinResult = await ctx.runMutation(internal.live.room.prepareJoin, {
      liveClassId: args.liveClassId,
    });

    await ensureLiveKitRoom(apiKey, apiSecret, wsUrl, join);

    const token = new AccessToken(apiKey, apiSecret, {
      identity: liveKitParticipantIdentity(join.participantRole, join.userId),
      name: join.displayName,
      ttl: TTL.JOIN_TOKEN,
    });
    token.addGrant(buildLiveKitVideoGrant(join.roomName, join.participantRole));

    return {
      wsUrl,
      token: await token.toJwt(),
      roomName: join.roomName,
      participantRole: join.participantRole,
      joinClosesAt: join.joinClosesAt,
      classTitle: join.classTitle,
      instructorName: join.instructorName,
      liveClassType: join.liveClassType,
    };
  },
});
