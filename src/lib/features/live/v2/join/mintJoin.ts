import type { ConvexClient } from "convex/browser";
import type { Id } from "$convex/_generated/dataModel";
import { issueJoinCredentials } from "../../join-token";
import type { JoinInfo } from "./types";

/**
 * Mint LiveKit JWT — call only on explicit user connect (Phase 1+).
 * Server re-validates via `prepareJoin`.
 */
export async function mintJoinCredentials(
  client: ConvexClient,
  liveClassId: Id<"liveClasses">,
): Promise<JoinInfo> {
  return issueJoinCredentials(client, liveClassId);
}
