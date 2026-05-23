import "./dev.js";
import { _ as useQuery, r as initAuth, s as api } from "./session.svelte.js";
import "./Notice.js";
import { t as useI18n } from "./runes.svelte.js";
import { r as AppSkeleton } from "./OnboardingForm.js";
//#region src/lib/features/onboarding/components/OnboardingShell.svelte
function OnboardingShell($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const auth = initAuth();
		const { t } = useI18n();
		useQuery(api.users.dashboard.get, () => auth.isAuthenticated ? {} : "skip");
		$$renderer.push(`<section class="onboarding-page svelte-jqmm53">`);
		$$renderer.push("<!--[0-->");
		$$renderer.push(`<div class="onboarding-page__child svelte-jqmm53">`);
		AppSkeleton($$renderer, { width: "70%" });
		$$renderer.push(`<!----></div>`);
		$$renderer.push(`<!--]--></section>`);
	});
}
//#endregion
export { OnboardingShell as t };
