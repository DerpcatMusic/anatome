import { query } from "../_generated/server";
import { viewerProfileReturns } from "../contracts/profiles";
import { getAppProfile, requireUserId } from "../lib/authz";

export const get = query({
  args: {},
  returns: viewerProfileReturns,
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    const profile = await getAppProfile(ctx, userId);
    if (profile === null) return null;

    const avatarUrl = profile.avatarStorageId
      ? await ctx.storage.getUrl(profile.avatarStorageId)
      : null;

    const base = {
      _id: profile._id,
      userId: profile.userId,
      email: profile.email,
      displayName: profile.displayName,
      role: profile.role,
      avatarUrl,
      credentials: profile.credentials,
    };

    if (profile.role === "instructor" || profile.role === "admin") {
      return {
        ...base,
        certificateDocument: profile.certificateDocument,
        insuranceDocument: profile.insuranceDocument,
      };
    }

    return base;
  },
});
