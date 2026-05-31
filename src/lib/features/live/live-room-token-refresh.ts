import type { ConvexClient } from "convex/browser";
import { fetchJoinToken, type FetchJoinTokenInput } from "./join-token";

/** Refresh join credentials for an active live session (token rotation / expiry). */
export async function refreshLiveSessionRoomToken(
  client: ConvexClient,
  input: FetchJoinTokenInput,
) {
  return fetchJoinToken(input);
}
