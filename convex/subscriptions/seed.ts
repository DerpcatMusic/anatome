import { internalMutation } from "../_generated/server";
import { DEFAULT_PLANS, planPayload } from "./plans";

export const defaultPlans = internalMutation({
  args: {},
  handler: async (ctx) => {
    const ids = [];

    for (const plan of DEFAULT_PLANS) {
      const payload = planPayload(plan);
      const existing = await ctx.db
        .query("plans")
        .withIndex("by_slug", (q) => q.eq("slug", payload.slug))
        .take(1);

      if (existing[0] !== undefined) {
        await ctx.db.patch(existing[0]._id, payload);
        ids.push(existing[0]._id);
      } else {
        ids.push(await ctx.db.insert("plans", payload));
      }
    }

    return ids;
  },
});
