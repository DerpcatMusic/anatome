import { getContext, setContext } from 'svelte';
import { PinContext } from './pin-context.svelte.js';
import { WidgetContext } from './widget-context.svelte.js';

const LAYOUT_CONTEXT_KEY = Symbol('livekit-layout');

/**
 * Composes PinContext and WidgetContext for layout management.
 * @public
 */
export class LayoutContext {
	/** Pin state management. */
	readonly pin: PinContext;
	/** Widget state management. */
	readonly widget: WidgetContext;

	constructor() {
		this.pin = new PinContext();
		this.widget = new WidgetContext();
	}
}

/**
 * Set the LayoutContext in the current Svelte component tree.
 * @public
 */
export function setLayoutContext(ctx: LayoutContext): void {
	setContext(LAYOUT_CONTEXT_KEY, ctx);
}

/**
 * Get the LayoutContext from the current Svelte component tree.
 * Throws if not found.
 * @public
 */
export function getLayoutContext(): LayoutContext {
	const ctx = getContext<LayoutContext | undefined>(LAYOUT_CONTEXT_KEY);
	if (!ctx) {
		throw Error('Tried to access LayoutContext context outside a LayoutContextProvider provider.');
	}
	return ctx;
}

/**
 * Get the LayoutContext from the current Svelte component tree.
 * Returns `undefined` if not found.
 * @public
 */
export function getMaybeLayoutContext(): LayoutContext | undefined {
	return getContext<LayoutContext | undefined>(LAYOUT_CONTEXT_KEY);
}

/**
 * Creates a new LayoutContext with fresh PinContext and WidgetContext instances.
 * @public
 */
export function useCreateLayoutContext(): LayoutContext {
	return new LayoutContext();
}
