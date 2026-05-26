import { browser } from '$app/environment';
import { ConvexClient } from 'convex/browser';
import { setConvexClientContext } from 'convex-svelte';
import { normalizeConvexDeploymentUrl } from './deployment-url';

let browserClient: ConvexClient | null = null;
let browserClientUrl: string | null = null;

function getBrowserClient(url: string): ConvexClient {
	if (browserClient !== null && browserClientUrl === url) {
		return browserClient;
	}

	if (browserClient !== null) {
		browserClient.close();
	}

	browserClient = new ConvexClient(url);
	browserClientUrl = url;
	return browserClient;
}

/**
 * Registers ConvexClient in Svelte context for this layout subtree.
 * Must run again when entering a layout that resets the tree (e.g. live-room `@` breakout),
 * but browser routes must share one client so auth state and subscriptions stay aligned.
 */
export function initConvex(deploymentUrl: string): void {
	const normalizedUrl = normalizeConvexDeploymentUrl(deploymentUrl);
	const client = browser
		? getBrowserClient(normalizedUrl)
		: new ConvexClient(normalizedUrl, { disabled: true });

	setConvexClientContext(client);
}
