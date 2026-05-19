import "../../../chunks/dev.js";
import { t as OnboardingShell } from "../../../chunks/OnboardingShell.js";
//#region src/routes/onboarding/+page.svelte
function _page($$renderer) {
	$$renderer.push(`<main class="app-page">`);
	OnboardingShell($$renderer, {});
	$$renderer.push(`<!----></main>`);
}
//#endregion
export { _page as default };
