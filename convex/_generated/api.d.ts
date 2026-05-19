/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as appProfiles from "../appProfiles.js";
import type * as auth from "../auth.js";
import type * as crons from "../crons.js";
import type * as customerLive from "../customerLive.js";
import type * as customerOneOnOne from "../customerOneOnOne.js";
import type * as customerVideos from "../customerVideos.js";
import type * as http from "../http.js";
import type * as instructorLive from "../instructorLive.js";
import type * as instructorOneOnOne from "../instructorOneOnOne.js";
import type * as instructorVideos from "../instructorVideos.js";
import type * as lib_authz from "../lib/authz.js";
import type * as lib_credits from "../lib/credits.js";
import type * as lib_equipment from "../lib/equipment.js";
import type * as lib_oneOnOne from "../lib/oneOnOne.js";
import type * as lib_validators from "../lib/validators.js";
import type * as liveClasses from "../liveClasses.js";
import type * as liveReminders from "../liveReminders.js";
import type * as livekit from "../livekit.js";
import type * as users from "../users.js";
import type * as videos from "../videos.js";
import type * as videosPlayback from "../videosPlayback.js";
import type * as videosUpload from "../videosUpload.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  appProfiles: typeof appProfiles;
  auth: typeof auth;
  crons: typeof crons;
  customerLive: typeof customerLive;
  customerOneOnOne: typeof customerOneOnOne;
  customerVideos: typeof customerVideos;
  http: typeof http;
  instructorLive: typeof instructorLive;
  instructorOneOnOne: typeof instructorOneOnOne;
  instructorVideos: typeof instructorVideos;
  "lib/authz": typeof lib_authz;
  "lib/credits": typeof lib_credits;
  "lib/equipment": typeof lib_equipment;
  "lib/oneOnOne": typeof lib_oneOnOne;
  "lib/validators": typeof lib_validators;
  liveClasses: typeof liveClasses;
  liveReminders: typeof liveReminders;
  livekit: typeof livekit;
  users: typeof users;
  videos: typeof videos;
  videosPlayback: typeof videosPlayback;
  videosUpload: typeof videosUpload;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
