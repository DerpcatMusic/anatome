import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
export default defineConfig({
	plugins: [sveltekit()],
	build: {
		// The app has intentionally lazy media SDK chunks for Mux playback and LiveKit rooms.
		chunkSizeWarningLimit: 1100,
		rolldownOptions: {
			checks: {
				pluginTimings: false
			}
		}
	}
});
