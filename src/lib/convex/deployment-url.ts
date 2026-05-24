/** Strip trailing slashes so Convex clients don't build `//api/...` WebSocket URLs. */
export function normalizeConvexDeploymentUrl(url: string): string {
	const trimmed = url.trim();
	if (!trimmed) return trimmed;
	return trimmed.replace(/\/+$/, '');
}
