import "../../../chunks/dev.js";
import { t as OnboardingShell } from "../../../chunks/OnboardingShell.js";
//#region src/routes/התאמה/+page.svelte
function _page($$renderer) {
	OnboardingShell($$renderer, {});
}
//#endregion
export { _page as default };
