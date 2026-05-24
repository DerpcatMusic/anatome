/**
 * SvelteKit adapter-static uses `app.html` as the SPA shell; marketing `/` is prerendered
 * to `index.html`. Workers must not use `/* /app.html 200` in _redirects (breaks /_app/*
 * and html_handling turns `.html` paths into 307s). Serve the shell only on asset 404s.
 */
export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		const response = await env.ASSETS.fetch(request);
		if (response.status !== 404) {
			return response;
		}

		const pathname = new URL(request.url).pathname;
		if (pathname.startsWith('/_app/') || pathname.includes('.')) {
			return response;
		}

		return env.ASSETS.fetch(new Request(new URL('/app.html', request.url), request));
	},
};

interface Env {
	ASSETS: Fetcher;
}
