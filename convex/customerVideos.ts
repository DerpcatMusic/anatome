import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { api } from "./_generated/api";
import type { Id } from "./_generated/dataModel";

export const getViewerPlayback = query({
  args: {
    videoId: v.id("videos"),
  },
  handler: async (ctx, args): Promise<unknown> => {
    return await ctx.runQuery(api.videos.getViewerPlayback, args);
  },
});

export const listWeekly = query({
  args: {},
  handler: async (ctx): Promise<unknown> => {
    return await ctx.runQuery(api.videos.listWeekly, {});
  },
});

export const selectForWeek = mutation({
  args: {
    videoId: v.id("videos"),
  },
  handler: async (ctx, args): Promise<Id<"videoSelections">> => {
    return await ctx.runMutation(api.videos.selectForWeek, args);
  },
});

export const updateProgress = mutation({
  args: {
    videoId: v.id("videos"),
    currentTimeSeconds: v.number(),
    durationSeconds: v.number(),
  },
  handler: async (ctx, args): Promise<Id<"videoProgress"> | null> => {
    return await ctx.runMutation(api.videos.updateProgress, args);
  },
});
