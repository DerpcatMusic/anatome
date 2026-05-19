import { W as escape_html } from "./dev.js";
import { n as routePath } from "./context.js";
import { r as useQuery } from "./client.svelte.js";
import { r as initAuth, s as api } from "./session.svelte.js";
import { t as Notice } from "./Notice.js";
import { t as useI18n } from "./runes.svelte.js";
import { n as AppLocked, r as AppSkeleton, t as OnboardingForm } from "./OnboardingForm.js";
//#region src/lib/features/onboarding/components/OnboardingShell.svelte
function OnboardingShell($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const auth = initAuth();
		const { t } = useI18n();
		useQuery(api.users.dashboard, () => auth.isAuthenticated ? {} : "skip");
		let status = "checking";
		let error = "";
		$$renderer.push(`<section class="onboarding-page svelte-jqmm53">`);
		if (status === "checking" || status === "done") {
			$$renderer.push("<!--[0-->");
			AppSkeleton($$renderer, { width: "70%" });
		} else if (status === "locked") {
			$$renderer.push("<!--[1-->");
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
		} else if (status === "error") {
			$$renderer.push("<!--[2-->");
			$$renderer.push(`<div class="max-w-md mx-auto mt-20">`);
			Notice($$renderer, {
				tone: "danger",
				children: ($$renderer) => {
					$$renderer.push(`<!---->${escape_html(error)}`);
				},
				$$slots: { default: true }
			});
			$$renderer.push(`<!----></div>`);
		} else {
			$$renderer.push("<!--[-1-->");
			OnboardingForm($$renderer, { redirectTo: routePath("dashboard") });
		}
		$$renderer.push(`<!--]--></section>`);
	});
}
//#endregion
export { OnboardingShell as t };
