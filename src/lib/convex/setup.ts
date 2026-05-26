import { setupConvex } from 'convex-svelte';
import { normalizeConvexDeploymentUrl } from './deployment-url';

let convexInitialized = false;

/** Idempotent — breakout layouts (live room) also call this outside (app)/+layout. */
export function initConvex(deploymentUrl: string): void {
	if (convexInitialized) return;
	convexInitialized = true;
	setupConvex(normalizeConvexDeploymentUrl(deploymentUrl));
}
