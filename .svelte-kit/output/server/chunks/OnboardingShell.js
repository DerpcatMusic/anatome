import { nt as escape_html } from "./dev.js";
import { p as useQuery, r as initAuth, s as api } from "./session.svelte.js";
import { t as Notice } from "./Notice.js";
import { t as useI18n } from "./runes.svelte.js";
import { n as AppLocked, r as AppSkeleton, t as OnboardingForm } from "./OnboardingForm.js";
//#region src/lib/features/onboarding/components/OnboardingShell.svelte
function OnboardingShell($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const auth = initAuth();
		const { t } = useI18n();
		useQuery(api.users.dashboard.get, () => auth.isAuthenticated ? {} : "skip");
		let status = "checking";
		let error = "";
		$$renderer.push(`<section class="onboarding-page svelte-jqmm53">`);
		if (status === "checking" || status === "done") {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="onboarding-page__child svelte-jqmm53">`);
			AppSkeleton($$renderer, { width: "70%" });
			$$renderer.push(`<!----></div>`);
		} else if (status === "locked") {
			$$renderer.push("<!--[1-->");
			$$renderer.push(`<div class="onboarding-page__child svelte-jqmm53">`);
			{
				function actions($$renderer) {
					$$renderer.push(`<a href="/">${escape_html(t.nav.backHome())}</a>`);
				}
				AppLocked($$renderer, {
					title: t.onboarding.locked.title(),
					subtitle: t.onboarding.locked.subtitle(),
					actions,
					$$slots: { actions: true }
				});
			}
			$$renderer.push(`<!----></div>`);
		} else if (status === "error") {
			$$renderer.push("<!--[2-->");
			$$renderer.push(`<div class="onboarding-page__child svelte-jqmm53"><div class="max-w-md mx-auto mt-20">`);
			Notice($$renderer, {
				tone: "danger",
				children: ($$renderer) => {
					$$renderer.push(`<!---->${escape_html(error)}`);
				},
				$$slots: { default: true }
			});
			$$renderer.push(`<!----></div></div>`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<div class="onboarding-page__child svelte-jqmm53">`);
			OnboardingForm($$renderer, { redirectTo: "/u/dashboard" });
			$$renderer.push(`<!----></div>`);
		}
		$$renderer.push(`<!--]--></section>`);
	});
}
//#endregion
export { OnboardingShell as t };
