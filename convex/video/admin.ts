import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { paginationOptsValidator } from "convex/server";
import {
  adminVideoListReturns,
  adminVideoPaginatedReturns,
} from "../contracts/video";
import { requireUserId, requireAppProfile, requireRole } from "../lib/authz";
import { toAdminVideoRow } from "../lib/adminVideoRow";
import { normalizeEquipmentList } from "../lib/equipmentCatalog";
import { equipmentListValidator } from "../lib/validators";
import { requireInstructorOwnedVideo } from "../lib/videoOwnership";
import { videoStatusPatchValidator, videoStatusValidator } from "../lib/videoStatus";
import { LIMITS } from "../lib/constants";
import type { Doc, Id } from "../_generated/dataModel";
import type { QueryCtx } from "../_generated/server";
import type { VideoStatus } from "../lib/videoStatus";

const accessKindValidator = v.union(v.literal("macroflow"), v.literal("microflow"));

async function listOwnedByStatus(
  ctx: QueryCtx,
  instructorUserId: Id<"users">,
  status: VideoStatus,
) {
  const rows = await ctx.db
    .query("videos")
    .withIndex("by_instructorUserId_and_createdAt", (q) => q.eq("instructorUserId", instructorUserId))
    .order("desc")
    .take(LIMITS.ADMIN_VIDEO_PAGE * 3);
  return rows.filter((video) => video.status === status).map(toAdminVideoRow);
}

export const listAll = query({
  args: {},
  returns: adminVideoListReturns,
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    const profile = await requireAppProfile(ctx, userId);
    requireRole(profile, ["instructor", "admin"]);

    const [published, processing, drafts, failed, archived] = await Promise.all([
      listOwnedByStatus(ctx, userId, "published"),
      listOwnedByStatus(ctx, userId, "processing"),
      listOwnedByStatus(ctx, userId, "draft"),
      listOwnedByStatus(ctx, userId, "failed"),
      listOwnedByStatus(ctx, userId, "archived"),
    ]);

    return { published, processing, drafts, failed, archived };
  },
});

export const listByStatusPaginated = query({
  args: {
    status: videoStatusValidator,
    paginationOpts: paginationOptsValidator,
  },
  returns: adminVideoPaginatedReturns,
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const profile = await requireAppProfile(ctx, userId);
    requireRole(profile, ["instructor", "admin"]);

    const page = await ctx.db
      .query("videos")
      .withIndex("by_instructorUserId_and_createdAt", (q) => q.eq("instructorUserId", userId))
      .order("desc")
      .paginate(args.paginationOpts);

    const filtered = page.page.filter((video) => video.status === args.status);

    return {
      page: filtered.map(toAdminVideoRow),
      isDone: page.isDone,
      continueCursor: page.continueCursor,
    };
  },
});

export const markUploadStarted = mutation({
  args: { videoId: v.id("videos") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const profile = await requireAppProfile(ctx, userId);
    requireRole(profile, ["instructor", "admin"]);
    const video = await requireInstructorOwnedVideo(ctx, userId, args.videoId);
    if (video.status !== "draft" && video.status !== "failed") {
      throw new Error("לא ניתן להתחיל העלאה במצב הנוכחי");
    }
    await ctx.db.patch(args.videoId, {
      status: "processing",
      processingError: undefined,
      updatedAt: Date.now(),
    });
    return null;
  },
});

export const updateMetadata = mutation({
  args: {
    videoId: v.id("videos"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    requiredEquipment: v.optional(equipmentListValidator),
    accessKind: v.optional(accessKindValidator),
    status: videoStatusPatchValidator,
  },
  returns: v.id("videos"),
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const profile = await requireAppProfile(ctx, userId);
    requireRole(profile, ["instructor", "admin"]);
    const video = await requireInstructorOwnedVideo(ctx, userId, args.videoId);

    const patch: Partial<Doc<"videos">> = { updatedAt: Date.now() };
    if (args.title !== undefined) patch.title = args.title.trim();
    if (args.description !== undefined) patch.description = args.description.trim();
    if (args.requiredEquipment !== undefined) {
      patch.requiredEquipment = normalizeEquipmentList(args.requiredEquipment);
    }
    if (args.accessKind !== undefined) patch.accessKind = args.accessKind;

    if (args.status !== undefined) {
      if (args.status === "published") {
        throw new Error("פרסום מתבצע אוטומטית אחרי עיבוד Mux");
      }
      if (args.status === "archived" && video.status === "processing") {
        throw new Error("לא ניתן להעביר לארכיון בזמן עיבוד");
      }
      patch.status = args.status;
      if (args.status !== "failed") {
        patch.processingError = undefined;
      }
    }

    await ctx.db.patch(args.videoId, patch);
    return args.videoId;
  },
});
