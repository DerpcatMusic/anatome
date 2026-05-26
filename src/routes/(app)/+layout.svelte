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
		isConvexWsAuthEstablished,
	} from "$lib/auth/session.svelte";
	import { setAppContext } from "$features/app/context/appContext";
	import AppLayout from "$features/app/components/AppLayout.svelte";
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

	// #region agent log
	$effect(() => {
		const willSubscribe = auth.isAuthenticated;
		const wsReady = isConvexWsAuthEstablished();
		fetch("http://127.0.0.1:7635/ingest/0058f30b-7dc0-4748-98aa-19722c5574a5", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"X-Debug-Session-Id": "3a81d3",
			},
			body: JSON.stringify({
				sessionId: "3a81d3",
				hypothesisId: "A",
				location: "(app)/+layout.svelte:profileQuery",
				message: "profile query gate state",
				data: {
					willSubscribe,
					wsReady,
					queryAuthReady: canRunAuthenticatedQuery(),
					cachedRole: getCachedRole(),
					raceSuspected: willSubscribe && !wsReady,
					profileLoading: profileQuery.isLoading,
					profileError:
						profileQuery.error instanceof Error
							? profileQuery.error.message
							: profileQuery.error
								? String(profileQuery.error)
								: null,
				},
				timestamp: Date.now(),
			}),
		}).catch(() => {});
	});
	// #endregion

	// Create a reactive state object and pass it via context.
	// Children reading this via getContext() will see reactive updates.
	const appContext = $state({
		role: null as "customer" | "instructor" | "admin" | null,
		isLoading: true,
	});
	setAppContext(appContext);

	$effect(() => {
		const role = profileQuery.data?.role;
		if (role) setCachedRole(role);
		appContext.role = (role ?? getCachedRole()) as typeof appContext.role;
		appContext.isLoading =
			(auth.isAuthenticated && !canRunAuthenticatedQuery()) || profileQuery.isLoading;
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
