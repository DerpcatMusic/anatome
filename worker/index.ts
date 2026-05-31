/**
 * SvelteKit adapter-static uses `app.html` as the SPA shell; marketing routes are prerendered
 * to `index.html`. With html_handling = "auto-trailing-slash", Cloudflare Pages resolves
 * / → /index.html automatically. This worker is a safety net for true 404s.
 */
export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		const url = new URL(request.url);

		// Try to serve the exact asset first (Cloudflare Pages handles / → /index.html)
		const response = await env.ASSETS.fetch(request);
		if (response.status !== 404) {
			return response;
		}

		// Safety net: if html_handling missed something, try explicit index.html
		const pathname = url.pathname;
		if (!pathname.includes('.') && !pathname.startsWith('/_app/')) {
			const indexPath = pathname === '/' ? '/index.html' : pathname + '/index.html';
			const indexResponse = await env.ASSETS.fetch(
				new Request(new URL(indexPath, request.url), request)
			);
			if (indexResponse.status === 200) {
				return indexResponse;
			}
		}

		// Don't fallback for asset files
		if (pathname.startsWith('/_app/') || pathname.includes('.')) {
			return response;
		}

		// SPA fallback for app routes (dashboard, etc.)
		return env.ASSETS.fetch(new Request(new URL('/app.html', request.url), request));
	},
};

interface Env {
	ASSETS: Fetcher;
}
