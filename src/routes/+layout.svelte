<script lang="ts">
	import '../styles/global.css';
	import { browser } from '$app/environment';
	import { PUBLIC_CONVEX_CLIENT_URL } from '$env/static/public';
	import { useConvexClient } from 'convex-svelte';
	import { Tooltip } from 'bits-ui';
	import { initConvex } from '$lib/convex/setup';
	import { wireConvexAuth } from '$lib/auth/session.svelte';
	import { registerPwaClient } from '$lib/pwa/register-pwa';
	import { useI18n } from '$lib/i18n/runes';

	let { children } = $props();
	const { t } = useI18n();

	let offline = $state(false);

	/** Variable axes so CSS can set thin default + heavier hover/active. */
	const materialSymbolsHref =
		"https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap";

	initConvex(PUBLIC_CONVEX_CLIENT_URL);

	const client = useConvexClient();
	if (browser) {
		wireConvexAuth(client);
	}

	$effect(() => {
		if (!browser) return;
		return registerPwaClient();
	});

	$effect(() => {
		if (!browser) return;
		const sync = () => {
			offline = !navigator.onLine;
		};
		sync();
		window.addEventListener('online', sync);
		window.addEventListener('offline', sync);
		return () => {
			window.removeEventListener('online', sync);
			window.removeEventListener('offline', sync);
		};
	});
</script>

<svelte:head>
	<link rel="stylesheet" href={materialSymbolsHref} />
</svelte:head>

<div id="pwa-offline-banner" hidden={!offline} role="status" aria-live="polite">
	{t.live.room.offlineBanner()}
</div>

<div id="pwa-update-banner" hidden>
	<span>גרסה חדשה זמינה.</span>
	<button type="button" class="hb-button hb-button--ink hb-button--sm" id="pwa-update-reload">
		רענון
	</button>
</div>

<Tooltip.Provider delayDuration={160}>
	{@render children()}
</Tooltip.Provider>
