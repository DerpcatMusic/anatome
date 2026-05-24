<script lang="ts">
	import '../styles/global.css';
	import { browser } from '$app/environment';
	import { page } from '$app/state';
	import { PUBLIC_CONVEX_CLIENT_URL } from '$env/static/public';
	import { setupConvex, useConvexClient } from 'convex-svelte';
	import { wireConvexAuth } from '$lib/auth/session.svelte';
	import Navbar from '$components/layout/Navbar.svelte';
	import { useThemeMedia } from '$features/app/themeMedia.svelte';

	let { children } = $props();

	/** Full-screen live room uses its own chrome; site navbar must not stack on top. */
	const hideSiteNavbar = $derived.by(() => {
		const path = decodeURIComponent(page.url.pathname);
		return (
			path.includes('חדר-לייב') ||
			path.startsWith('/live-room')
		);
	});

	useThemeMedia();

	setupConvex(PUBLIC_CONVEX_CLIENT_URL);

	const client = useConvexClient();
	if (browser) {
		wireConvexAuth(client);
	}
</script>

{#if !hideSiteNavbar}
	<Navbar />
{/if}
{@render children()}
