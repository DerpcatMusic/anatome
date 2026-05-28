import { getAuthUserId } from "@convex-dev/auth/server";
import { internalQuery } from "../_generated/server";

/**
 * @internal Raw auth user doc — do not expose on the public API.
 * Prefer `users.dashboard.get` or `users.session.resolve` for client use.
 */
export const get = internalQuery({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return null;
    return await ctx.db.get(userId);
  },
});
