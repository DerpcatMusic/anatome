import { ConvexClient } from "convex/browser";
import { PUBLIC_CONVEX_CLIENT_URL } from "$env/static/public";
import { normalizeConvexDeploymentUrl } from "$lib/convex/deployment-url";

const deploymentUrl = PUBLIC_CONVEX_CLIENT_URL
  ? normalizeConvexDeploymentUrl(PUBLIC_CONVEX_CLIENT_URL)
  : "";

export const convex =
  typeof window !== "undefined" && deploymentUrl
    ? new ConvexClient(deploymentUrl)
    : (null as unknown as ConvexClient);
