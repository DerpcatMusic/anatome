import { v } from "convex/values";
import type { Infer } from "convex/values";

export const profileRoleValidator = v.union(
  v.literal("customer"),
  v.literal("instructor"),
  v.literal("admin"),
);

export type ProfileRole = Infer<typeof profileRoleValidator>;

export const liveClassTypeValidator = v.union(
  v.literal("group_live"),
  v.literal("one_on_one"),
);

export type LiveClassType = Infer<typeof liveClassTypeValidator>;

export const liveCreditKindValidator = v.union(
  v.literal("live"),
  v.literal("oneOnOne"),
);

export const liveClassStatusValidator = v.union(
  v.literal("draft"),
  v.literal("scheduled"),
  v.literal("live"),
  v.literal("ended"),
  v.literal("cancelled"),
);

export const subscriberReceivePresetValidator = v.union(
  v.literal("low"),
  v.literal("medium"),
  v.literal("high"),
);

export const liveRoomStatusValidator = v.union(
  v.literal("pending"),
  v.literal("active"),
  v.literal("ended"),
);

export const liveReservationStatusValidator = v.union(
  v.literal("reserved"),
  v.literal("joined"),
  v.literal("cancelled"),
  v.literal("refunded"),
  v.literal("no_show"),
);

export const liveLobbyPhaseValidator = v.union(
  v.literal("waiting_broadcast"),
  v.literal("device_setup"),
);

export const liveJoinResultValidator = v.union(
  v.literal("allowed"),
  v.literal("denied"),
);

export const videoProviderValidator = v.union(
  v.literal("cloudflare_stream"),
  v.literal("bunny_stream"),
  v.literal("mux"),
);

export const videoAccessKindValidator = v.union(
  v.literal("macroflow"),
  v.literal("microflow"),
);

export const muxVideoQualityValidator = v.union(
  v.literal("basic"),
  v.literal("plus"),
  v.literal("premium"),
);

export const muxMaxResolutionTierValidator = v.union(
  v.literal("1080p"),
  v.literal("1440p"),
  v.literal("2160p"),
);

export const staticRenditionValidator = v.union(
  v.literal("none"),
  v.literal("audio-only"),
  v.literal("720p"),
  v.literal("1080p"),
);

/** Lifecycle: draft -> processing -> published | failed; archived = manual takedown. */
export const videoStatusValidator = v.union(
  v.literal("draft"),
  v.literal("processing"),
  v.literal("published"),
  v.literal("failed"),
  v.literal("archived"),
);

export type VideoStatus = Infer<typeof videoStatusValidator>;
