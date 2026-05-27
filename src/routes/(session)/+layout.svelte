<script lang="ts">
	import { browser } from '$app/environment';
	import { PUBLIC_CONVEX_CLIENT_URL } from '$env/static/public';
	import { useConvexClient } from 'convex-svelte';
	import { initConvex } from '$lib/convex/setup';
	import { wireConvexAuth } from '$lib/auth/session.svelte';
	import { useThemeMedia } from '$features/app/themeMedia.svelte';

	let { children } = $props();

	initConvex(PUBLIC_CONVEX_CLIENT_URL);

	const client = useConvexClient();
	if (browser) {
		wireConvexAuth(client);
		useThemeMedia();
	}
</script>

{@render children()}
