<script lang="ts">
	import { browser } from '$app/environment';
	import { useEventListener } from 'runed';
	import {
		AUTH_CLOSE_EVENT,
		AUTH_OPEN_EVENT,
		readAuthOpenDetail,
	} from '$lib/auth/open-overlay';

	let authMounted = $state(false);
	let authOpen = $state(false);
	let authSessionKey = $state(0);
	let authEmail = $state<string | undefined>();
	let authAutoSend = $state(false);

	if (browser) {
		useEventListener(window, AUTH_OPEN_EVENT, (event) => {
			const detail = readAuthOpenDetail(event);
			authEmail = detail?.email;
			authAutoSend = detail?.autoSendCode ?? false;
			authSessionKey += 1;
			authMounted = true;
			authOpen = true;
		});
		useEventListener(window, AUTH_CLOSE_EVENT, () => {
			authOpen = false;
			authEmail = undefined;
			authAutoSend = false;
		});
	}
</script>

{#if authMounted}
	{#await import('./LandingAuthOverlay.svelte') then { default: LandingAuthOverlay }}
		{#key authSessionKey}
			<LandingAuthOverlay bind:open={authOpen} initialEmail={authEmail} autoSendCode={authAutoSend} />
		{/key}
	{/await}
{/if}
