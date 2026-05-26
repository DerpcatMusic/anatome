import { setupConvex } from 'convex-svelte';
import { normalizeConvexDeploymentUrl } from './deployment-url';

/**
 * Registers ConvexClient in Svelte context for this layout subtree.
 * Must run again when entering a layout that resets the tree (e.g. live-room `@` breakout),
 * so this is not a process-wide singleton — each mounting layout may call it.
 */
export function initConvex(deploymentUrl: string): void {
	setupConvex(normalizeConvexDeploymentUrl(deploymentUrl));
}
