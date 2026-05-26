<script lang="ts">
	import { browser } from '$app/environment';
	import { PUBLIC_CONVEX_CLIENT_URL } from '$env/static/public';
	import { api } from "$convex/_generated/api";
	import { useQuery, useConvexClient } from "convex-svelte";
	import { initConvex } from "$lib/convex/setup";
	import {
		initAuth,
		wireConvexAuth,
		canRunAuthenticatedQuery,
		getCachedRole,
		setCachedRole,
	} from "$lib/auth/session.svelte";
	import { setAppContext } from "$features/app/context/appContext";
	import AppLayout from "$features/app/components/AppLayout.svelte";
	import { untrack } from 'svelte';
	import { useThemeMedia } from '$features/app/themeMedia.svelte';

	let { children } = $props();

	initConvex(PUBLIC_CONVEX_CLIENT_URL);

	const client = useConvexClient();
	if (browser) {
		wireConvexAuth(client);
		useThemeMedia();
	}

	const auth = initAuth();
	const profileQuery = useQuery(api.profiles.viewer.get, () =>
		canRunAuthenticatedQuery() ? {} : "skip"
	);

	// Create a reactive state object and pass it via context.
	// Children reading this via getContext() will see reactive updates.
	const appContext = $state({
		role: null as "customer" | "instructor" | "admin" | null,
		isLoading: true,
	});
	setAppContext(appContext);

	// Sync app shell context from Convex profile — untrack cache reads/writes so
	// setCachedRole does not re-subscribe this effect to PersistedState (infinite loop).
	$effect(() => {
		const role = profileQuery.data?.role;
		const profileLoading = profileQuery.isLoading;
		const authed = auth.isAuthenticated;
		const authReady = canRunAuthenticatedQuery();

		untrack(() => {
			if (role) setCachedRole(role);
			const cachedRole = getCachedRole();
			const nextRole = (role ?? cachedRole) as typeof appContext.role;
			if (appContext.role !== nextRole) appContext.role = nextRole;
			const nextLoading =
				(authed && !authReady) || (profileLoading && cachedRole === null);
			if (appContext.isLoading !== nextLoading) appContext.isLoading = nextLoading;
		});
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
