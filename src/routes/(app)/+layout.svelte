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
		hasPersistedSession,
		getCachedRole,
		setCachedRole,
		getAccessTokenForConvex,
		shouldForceRefreshAccessToken,
		AUTH_QUERY_READY_CAP_MS,
	} from "$lib/auth/session.svelte";
	import {
		setAppContext,
		type ViewerProfileSnapshot,
	} from "$features/app/context/appContext";
	import AppLayout from "$features/app/components/AppLayout.svelte";
	import LiveDockProvider from "$lib/features/live/dock/LiveDockProvider.svelte";
	import { setupAppShellViewTransitions } from "$lib/navigation/app-shell-transition";
	import { untrack } from 'svelte';

	import { useThemeMedia } from '$features/app/themeMedia.svelte';
	import '@fontsource/secular-one/hebrew-400.css';

	let { children } = $props();

	initConvex(PUBLIC_CONVEX_CLIENT_URL);

	const client = useConvexClient();
	if (browser) {
		wireConvexAuth(client);
		useThemeMedia();
	}

	$effect(() => {
		setupAppShellViewTransitions();
	});

	const auth = initAuth();
	const profileQuery = useQuery(api.profiles.viewer.get, () =>
		canRunAuthenticatedQuery() ? {} : "skip"
	);

	// Create a reactive state object and pass it via context.
	// Children reading this via getContext() will see reactive updates.
	const appContext = $state({
		role: null as "customer" | "instructor" | "admin" | null,
		isLoading: true,
		viewer: null as ViewerProfileSnapshot | null,
	});
	setAppContext(appContext);

	// Sync app shell context from Convex profile — untrack cache reads/writes so
	// setCachedRole does not re-subscribe this effect to PersistedState (infinite loop).
	$effect(() => {
		const profile = profileQuery.data;
		const role = profile?.role;
		const profileLoading = profileQuery.isLoading;
		const authed = auth.isAuthenticated;
		const authReady = canRunAuthenticatedQuery();

		untrack(() => {
			if (role) setCachedRole(role);
			const cachedRole = getCachedRole();
			const nextRole = (role ?? cachedRole) as typeof appContext.role;
			if (appContext.role !== nextRole) appContext.role = nextRole;
			if (profile) {
				const nextViewer = {
					displayName: profile.displayName ?? null,
					email: profile.email ?? null,
					avatarUrl: profile.avatarUrl ?? null,
				};
				const v = appContext.viewer;
				if (
					!v ||
					v.displayName !== nextViewer.displayName ||
					v.email !== nextViewer.email ||
					v.avatarUrl !== nextViewer.avatarUrl
				) {
					appContext.viewer = nextViewer;
				}
			}
			const nextLoading =
				(authed && !authReady) || (profileLoading && cachedRole === null);
			if (appContext.isLoading !== nextLoading) appContext.isLoading = nextLoading;
		});
	});

	// P2: cap skeleton when persisted tokens exist but WS auth never becomes query-ready.
	$effect(() => {
		if (!browser) return;
		const waiting =
			hasPersistedSession() && auth.isAuthenticated && !canRunAuthenticatedQuery();
		if (!waiting) return;

		const timer = setTimeout(() => {
			if (!canRunAuthenticatedQuery() && hasPersistedSession()) {
				untrack(() => {
					appContext.isLoading = false;
				});
				void getAccessTokenForConvex({
					forceRefreshToken: shouldForceRefreshAccessToken(),
				});
			}
		}, AUTH_QUERY_READY_CAP_MS);

		return () => clearTimeout(timer);
	});
</script>

<AppLayout>
	<LiveDockProvider>
		{@render children()}
	</LiveDockProvider>
</AppLayout>
