import "../../../../chunks/dev.js";
//#region src/routes/(app)/חדר-לייב/+layout@.svelte
function _layout_($$renderer, $$props) {
	let { children } = $$props;
	children($$renderer);
	$$renderer.push(`<!---->`);
}
//#endregion
export { _layout_ as default };
