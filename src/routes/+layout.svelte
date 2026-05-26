<script lang="ts">
	import '../styles/global.css';
	import { browser } from '$app/environment';
	import { PUBLIC_CONVEX_CLIENT_URL } from '$env/static/public';
	import { useConvexClient } from 'convex-svelte';
	import { initConvex } from '$lib/convex/setup';
	import { wireConvexAuth } from '$lib/auth/session.svelte';

	let { children } = $props();

	initConvex(PUBLIC_CONVEX_CLIENT_URL);

	const client = useConvexClient();
	if (browser) {
		wireConvexAuth(client);
	}
</script>

{@render children()}
