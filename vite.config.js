import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, loadEnv } from 'vite';

/** @param {string} url */
function normalizeConvexDeploymentUrl(url) {
	const trimmed = String(url).trim();
	if (!trimmed) return trimmed;
	return trimmed.replace(/\/+$/, '');
}

/** @param {Record<string, string>} env */
function resolvePublicConvexUrl(env) {
	const raw =
		process.env.PUBLIC_CONVEX_CLIENT_URL ||
		env.PUBLIC_CONVEX_CLIENT_URL ||
		env.CONVEX_URL ||
		env.VITE_CONVEX_URL ||
		'';
	return normalizeConvexDeploymentUrl(raw);
}

/** @type {import('vite').UserConfigFnObject} */
export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), '');
	const convexUrl = resolvePublicConvexUrl(env);

	if (!convexUrl) {
		throw new Error(
			[
				'Missing PUBLIC_CONVEX_CLIENT_URL for production build.',
				'',
				'Cloudflare Pages: Settings → Environment variables → Production → add:',
				'  PUBLIC_CONVEX_CLIENT_URL = https://<your-deployment>.convex.cloud',
				'',
				'Local: run `bunx convex dev` once, then copy CONVEX_URL from .env.local to',
				'PUBLIC_CONVEX_CLIENT_URL (or set it in .env.production).',
			].join('\n'),
		);
	}

	process.env.PUBLIC_CONVEX_CLIENT_URL = convexUrl;

	// Optional public env vars must exist at build time for $env/static/public imports.
	if (process.env.PUBLIC_MUX_ENV_KEY === undefined) {
		process.env.PUBLIC_MUX_ENV_KEY = env.PUBLIC_MUX_ENV_KEY || '';
	}

	return {
		plugins: [sveltekit()],
		build: {
			// The app has intentionally lazy media SDK chunks for Mux playback and LiveKit rooms.
			chunkSizeWarningLimit: 1100,
			rolldownOptions: {
				checks: {
					pluginTimings: false,
				},
			},
		},
	};
});
