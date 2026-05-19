import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { api } from "./_generated/api";
import { equipmentListValidator } from "./lib/validators";
import type { Doc, Id } from "./_generated/dataModel";

type InstructorVideoList = {
  published: Doc<"videos">[];
  drafts: Doc<"videos">[];
  archived: Doc<"videos">[];
};

export const listAll = query({
  args: {},
  handler: async (ctx): Promise<InstructorVideoList> => {
    const library: InstructorVideoList = await ctx.runQuery(api.videos.listAll, {});
    return library;
  },
});

export const updateMetadata = mutation({
  args: {
    videoId: v.id("videos"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    requiredEquipment: v.optional(equipmentListValidator),
    availableFrom: v.optional(v.number()),
    availableUntil: v.optional(v.number()),
    status: v.optional(v.union(v.literal("draft"), v.literal("published"), v.literal("archived"))),
  },
  handler: async (ctx, args): Promise<Id<"videos">> => {
    return await ctx.runMutation(api.videos.updateMetadata, args);
  },
});

export const deleteVideo = mutation({
  args: {
    videoId: v.id("videos"),
  },
  handler: async (ctx, args): Promise<Id<"videos">> => {
    return await ctx.runMutation(api.videos.deleteVideo, args);
  },
});
