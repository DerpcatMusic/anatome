import { ConvexClient } from "convex/browser";
import { PUBLIC_CONVEX_CLIENT_URL } from "$env/static/public";

export const convex =
  typeof window !== "undefined" && PUBLIC_CONVEX_CLIENT_URL
    ? new ConvexClient(PUBLIC_CONVEX_CLIENT_URL)
    : (null as unknown as ConvexClient);
