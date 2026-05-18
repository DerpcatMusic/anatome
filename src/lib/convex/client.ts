import { ConvexClient } from "convex/browser";

const convexUrl = import.meta.env.PUBLIC_CONVEX_CLIENT_URL;

export const convex =
  typeof window !== "undefined" && convexUrl
    ? new ConvexClient(convexUrl)
    : (null as unknown as ConvexClient);
