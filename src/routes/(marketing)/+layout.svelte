<script lang="ts">
	import { browser } from '$app/environment';
	import MarketingNavbar from '$components/layout/MarketingNavbar.svelte';
	import LandingAuthHost from '$lib/features/marketing/LandingAuthHost.svelte';
	import { useThemeMedia } from '$features/app/themeMedia.svelte';
	import '@fontsource/secular-one/hebrew-400.css';

	let { children } = $props();

	if (browser) {
		useThemeMedia();
	}
</script>

<MarketingNavbar />
{@render children()}
<LandingAuthHost />
