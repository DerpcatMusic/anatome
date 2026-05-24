<script lang="ts">
	import '../styles/global.css';
	import { onMount } from 'svelte';
	import { PUBLIC_CONVEX_CLIENT_URL } from '$env/static/public';
	import { setupConvex, useConvexClient } from 'convex-svelte';
	import { wireConvexAuth } from '$lib/auth/session.svelte';
	import Navbar from '$components/layout/Navbar.svelte';
	import { useThemeMedia } from '$features/app/themeMedia.svelte';

	let { children } = $props();

	useThemeMedia();

	setupConvex(PUBLIC_CONVEX_CLIENT_URL);

	const client = useConvexClient();
	onMount(() => {
		wireConvexAuth(client);
	});
</script>

<Navbar />
{@render children()}
