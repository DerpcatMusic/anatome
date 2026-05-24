import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter({
			fallback: '200.html',
			precompress: true
		}),
		prerender: {
			entries: [
				'/',
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
