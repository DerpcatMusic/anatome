<script lang="ts">
	import { PUBLIC_CONVEX_CLIENT_URL } from '$env/static/public';
	import { setupConvex, useConvexClient } from 'convex-svelte';
	import { getAccessToken } from '$lib/auth/session.svelte';
	import Navbar from '$components/layout/Navbar.svelte';

	let { children } = $props();

	setupConvex(PUBLIC_CONVEX_CLIENT_URL);

	const client = useConvexClient();
	$effect(() => {
		client.setAuth(async () => getAccessToken());
	});
</script>

<Navbar />
{@render children()}
