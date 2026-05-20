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
import type * as credits_consumeLive from "../credits/consumeLive.js";
import type * as credits_consumeOneOnOne from "../credits/consumeOneOnOne.js";
import type * as credits_lib from "../credits/lib.js";
import type * as credits_purchaseVod from "../credits/purchaseVod.js";
import type * as credits_releaseLive from "../credits/releaseLive.js";
import type * as credits_releaseOneOnOne from "../credits/releaseOneOnOne.js";
import type * as credits_reserveLive from "../credits/reserveLive.js";
import type * as credits_reserveOneOnOne from "../credits/reserveOneOnOne.js";
import type * as crons from "../crons.js";
import type * as customerLive from "../customerLive.js";
import type * as customerOneOnOne from "../customerOneOnOne.js";
import type * as http from "../http.js";
import type * as instructorLive from "../instructorLive.js";
import type * as instructorOneOnOne from "../instructorOneOnOne.js";
import type * as lib_authz from "../lib/authz.js";
import type * as lib_credits from "../lib/credits.js";
import type * as lib_equipment from "../lib/equipment.js";
import type * as lib_livekitEnv from "../lib/livekitEnv.js";
import type * as lib_oneOnOne from "../lib/oneOnOne.js";
import type * as lib_validators from "../lib/validators.js";
import type * as liveClasses from "../liveClasses.js";
import type * as liveReminders from "../liveReminders.js";
import type * as livekit from "../livekit.js";
import type * as livekitAttendance from "../livekitAttendance.js";
import type * as livekitWebhook from "../livekitWebhook.js";
import type * as users from "../users.js";
import type * as video_admin from "../video/admin.js";
import type * as video_catalog from "../video/catalog.js";
import type * as video_categories from "../video/categories.js";
import type * as video_entitlements from "../video/entitlements.js";
import type * as video_playback from "../video/playback.js";
import type * as video_playbackToken from "../video/playbackToken.js";
import type * as video_provider_mux from "../video/provider/mux.js";
import type * as video_uploads from "../video/uploads.js";
import type * as videoInternal from "../videoInternal.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  appProfiles: typeof appProfiles;
  auth: typeof auth;
  "credits/consumeLive": typeof credits_consumeLive;
  "credits/consumeOneOnOne": typeof credits_consumeOneOnOne;
  "credits/lib": typeof credits_lib;
  "credits/purchaseVod": typeof credits_purchaseVod;
  "credits/releaseLive": typeof credits_releaseLive;
  "credits/releaseOneOnOne": typeof credits_releaseOneOnOne;
  "credits/reserveLive": typeof credits_reserveLive;
  "credits/reserveOneOnOne": typeof credits_reserveOneOnOne;
  crons: typeof crons;
  customerLive: typeof customerLive;
  customerOneOnOne: typeof customerOneOnOne;
  http: typeof http;
  instructorLive: typeof instructorLive;
  instructorOneOnOne: typeof instructorOneOnOne;
  "lib/authz": typeof lib_authz;
  "lib/credits": typeof lib_credits;
  "lib/equipment": typeof lib_equipment;
  "lib/livekitEnv": typeof lib_livekitEnv;
  "lib/oneOnOne": typeof lib_oneOnOne;
  "lib/validators": typeof lib_validators;
  liveClasses: typeof liveClasses;
  liveReminders: typeof liveReminders;
  livekit: typeof livekit;
  livekitAttendance: typeof livekitAttendance;
  livekitWebhook: typeof livekitWebhook;
  users: typeof users;
  "video/admin": typeof video_admin;
  "video/catalog": typeof video_catalog;
  "video/categories": typeof video_categories;
  "video/entitlements": typeof video_entitlements;
  "video/playback": typeof video_playback;
  "video/playbackToken": typeof video_playbackToken;
  "video/provider/mux": typeof video_provider_mux;
  "video/uploads": typeof video_uploads;
  videoInternal: typeof videoInternal;
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
