<script lang="ts">
	import type { Snippet } from 'svelte';
	import {
		LayoutContext,
		layoutCtx,
		useCreateLayoutContext,
	} from '../contexts/layout-context.svelte.js';
	import { pinCtx } from '../contexts/pin-context.svelte.js';
	import { widgetCtx } from '../contexts/widget-context.svelte.js';

	let {
		value,
		children,
	}: {
		value?: LayoutContext;
		children: Snippet;
	} = $props();

	// svelte-ignore state_referenced_locally
	const layoutContext = value ?? useCreateLayoutContext();
	layoutCtx.set(layoutContext);
	pinCtx.set(layoutContext.pin);
	widgetCtx.set(layoutContext.widget);
</script>

{@render children()}
