<script lang="ts">
	import { browser } from '$app/environment';
	import { useEventListener } from 'runed';

	let authMounted = $state(false);
	let authOpen = $state(false);

	if (browser) {
		useEventListener(window, 'anatome:auth-open', () => {
			authMounted = true;
			authOpen = true;
		});
		useEventListener(window, 'anatome:auth-close', () => {
			authOpen = false;
		});
	}
</script>

{#if authMounted}
	{#await import('./LandingAuthOverlay.svelte') then { default: LandingAuthOverlay }}
		<LandingAuthOverlay bind:open={authOpen} />
	{/await}
{/if}
