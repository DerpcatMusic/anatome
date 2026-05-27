<script lang="ts">
	import '../styles/global.css';
	import { browser } from '$app/environment';
	import { PUBLIC_CONVEX_CLIENT_URL } from '$env/static/public';
	import { useConvexClient } from 'convex-svelte';
	import { Tooltip } from 'bits-ui';
	import { initConvex } from '$lib/convex/setup';
	import { wireConvexAuth } from '$lib/auth/session.svelte';

	let { children } = $props();

	/** Variable axes so CSS can set thin default + heavier hover/active. */
	const materialSymbolsHref =
		"https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap";

	initConvex(PUBLIC_CONVEX_CLIENT_URL);

	const client = useConvexClient();
	if (browser) {
		wireConvexAuth(client);
	}
</script>

<svelte:head>
	<link rel="stylesheet" href={materialSymbolsHref} />
</svelte:head>

<Tooltip.Provider delayDuration={160}>
	{@render children()}
</Tooltip.Provider>
