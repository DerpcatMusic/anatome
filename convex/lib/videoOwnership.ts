import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";

type Ctx = QueryCtx | MutationCtx;

export async function requireInstructorOwnedVideo(
  ctx: Ctx,
  userId: Id<"users">,
  videoId: Id<"videos">,
): Promise<Doc<"videos">> {
  const video = await ctx.db.get(videoId);
  if (video === null) {
    throw new Error("הסרטון לא נמצא");
  }
  if (video.instructorUserId !== userId) {
    throw new Error("Unauthorized");
  }
  return video;
}
