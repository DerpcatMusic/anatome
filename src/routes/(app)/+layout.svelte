<script lang="ts">
	import { api } from "$convex/_generated/api";
	import { useQuery } from "convex-svelte";
	import { initAuth } from "$lib/auth/session.svelte";
	import { setAppContext } from "$features/app/context/appContext";
	import AppLayout from "$features/app/components/AppLayout.svelte";

	let { children } = $props();

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

<AppLayout>
	{@render children()}
</AppLayout>
