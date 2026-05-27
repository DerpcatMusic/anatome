import { v } from "convex/values";
import { query } from "../_generated/server";
import { joinContextValidator } from "./joinContract";
import { resolveJoinAccess } from "./joinAccess";

/**
 * Reactive pre-join context: `getJoinAccess` fields plus `classTitle` for PreJoin chrome.
 * Use with `useQueryNowMs()`; call `api.livekit.token.issueJoin` only when connecting.
 */
export const getJoinContext = query({
  args: {
    liveClassId: v.id("liveClasses"),
    now: v.number(),
  },
  returns: joinContextValidator,
  handler: async (ctx, args) => {
    const resolved = await resolveJoinAccess(ctx, args.liveClassId, args.now);
    if (resolved === null) return null;
    return {
      ...resolved.snapshot,
      classTitle: resolved.classTitle,
    };
  },
});
