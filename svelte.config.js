import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter({
			// Not "200.html" — Workers _redirects misparses "/*.html 200" as a 307 to /200.
			fallback: 'app.html',
			precompress: true
		}),
		prerender: {
			entries: [
				'/',
				'/concept',
				'/sitemap.xml',
				'/robots.txt',
				'/legal/terms',
				'/legal/privacy',
				'/legal/cancellations',
				'/legal/accessibility',
				'/legal/health'
			]
		},
		alias: {
			$components: 'src/lib/components',
			$features: 'src/lib/features',
			$convex: 'convex',
		}
	}
};

export default config;
