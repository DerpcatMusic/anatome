<script lang="ts">
	import { browser } from '$app/environment';
	import { PUBLIC_CONVEX_CLIENT_URL } from '$env/static/public';
	import { api } from "$convex/_generated/api";
	import { useQuery, setupConvex, useConvexClient } from "convex-svelte";
	import { initAuth, wireConvexAuth } from "$lib/auth/session.svelte";
	import { setAppContext } from "$features/app/context/appContext";
	import AppLayout from "$features/app/components/AppLayout.svelte";
	import { useThemeMedia } from '$features/app/themeMedia.svelte';

	let { children } = $props();

	setupConvex(PUBLIC_CONVEX_CLIENT_URL);

	const client = useConvexClient();
	if (browser) {
		wireConvexAuth(client);
		useThemeMedia();
	}

	const auth = initAuth();
	const profileQuery = useQuery(api.profiles.viewer.get, () =>
		auth.isAuthenticated ? {} : "skip"
	);

	// Create a reactive state object and pass it via context.
	// Children reading this via getContext() will see reactive updates.
	const appContext = $state({
		role: null as "customer" | "instructor" | "admin" | null,
		isLoading: true,
	});
	setAppContext(appContext);

	$effect(() => {
		appContext.role = profileQuery.data?.role ?? null;
		appContext.isLoading = profileQuery.isLoading;
	});
</script>

<svelte:head>
	<link
		rel="stylesheet"
		href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,500,0,0&display=swap"
	/>
</svelte:head>

<AppLayout>
	{@render children()}
</AppLayout>
