import { Context } from "runed";
import { PinContext } from "./pin-context.svelte.js";
import { WidgetContext } from "./widget-context.svelte.js";

export const layoutCtx = new Context<LayoutContext>("livekit-layout");

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
 * Creates a new LayoutContext with fresh PinContext and WidgetContext instances.
 * @public
 */
export function useCreateLayoutContext(): LayoutContext {
	return new LayoutContext();
}
