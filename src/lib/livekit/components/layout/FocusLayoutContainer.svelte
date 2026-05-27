<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		children,
		class: className = '',
		...rest
	}: {
		children: Snippet;
		class?: string;
	} & Record<string, unknown> = $props();
</script>

<div class="lk-focus-layout {className}" {...rest}>
	{@render children()}
</div>
