import { Q as styleToString } from "./arrays.js";
//#region node_modules/svelte-toolbelt/dist/utils/sr-only-styles.js
var srOnlyStyles = {
	position: "absolute",
	width: "1px",
	height: "1px",
	padding: "0",
	margin: "-1px",
	overflow: "hidden",
	clip: "rect(0, 0, 0, 0)",
	whiteSpace: "nowrap",
	borderWidth: "0",
	transform: "translateX(-100%)"
};
var srOnlyStylesString = styleToString(srOnlyStyles);
//#endregion
export { srOnlyStylesString as n, srOnlyStyles as t };
