import { setupConvex } from 'convex-svelte';
import { normalizeConvexDeploymentUrl } from './deployment-url';

export function initConvex(deploymentUrl: string): void {
	setupConvex(normalizeConvexDeploymentUrl(deploymentUrl));
}
