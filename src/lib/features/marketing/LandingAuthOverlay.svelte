<script lang="ts">
	import { browser } from '$app/environment';
	import { Dialog } from 'bits-ui';
	import { PUBLIC_CONVEX_CLIENT_URL } from '$env/static/public';
	import { useConvexClient } from 'convex-svelte';
	import { initConvex } from '$lib/convex/setup';
	import AuthPanel from '$features/auth/components/AuthPanel.svelte';
	import { wireConvexAuth } from '$lib/auth/session.svelte';

	interface Props {
		open: boolean;
	}

	let { open = $bindable() }: Props = $props();

		initConvex(PUBLIC_CONVEX_CLIENT_URL);

	const client = useConvexClient();
	if (browser) {
		wireConvexAuth(client);
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Portal>
		<Dialog.Overlay class="auth-overlay" />
		<Dialog.Content class="auth-card" aria-label="כניסה והרשמה">
			<AuthPanel />
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>
