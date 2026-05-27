<script lang="ts">
	import type { Snippet } from 'svelte';
	import {
		LayoutContext,
		setLayoutContext,
		useCreateLayoutContext,
	} from '../contexts/layout-context.svelte.js';
	import { setPinContext } from '../contexts/pin-context.svelte.js';
	import { setWidgetContext } from '../contexts/widget-context.svelte.js';

	let {
		value,
		children,
	}: {
		value?: LayoutContext;
		children: Snippet;
	} = $props();

	const layoutContext = value ?? useCreateLayoutContext();
	setLayoutContext(layoutContext);
	setPinContext(layoutContext.pin);
	setWidgetContext(layoutContext.widget);
</script>

{@render children()}
