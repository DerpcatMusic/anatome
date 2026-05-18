import "../../../chunks/index-server.js";
import { U as escape_html } from "../../../chunks/dev.js";
import { r as initAuth } from "../../../chunks/session.svelte.js";
import { t as Notice } from "../../../chunks/Notice.js";
import { n as AppSkeleton, t as AppLocked } from "../../../chunks/AppLocked.js";
import { t as OnboardingForm } from "../../../chunks/OnboardingForm.js";
//#region src/components/app/OnboardingShell.svelte
function OnboardingShell($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		initAuth();
		let status = "checking";
		let error = "";
		$$renderer.push(`<section class="onboarding-page svelte-1uyhthl">`);
		if (status === "checking" || status === "done") {
			$$renderer.push("<!--[0-->");
			AppSkeleton($$renderer, { width: "70%" });
		} else if (status === "locked") {
			$$renderer.push("<!--[1-->");
			{
				function actions($$renderer) {
					$$renderer.push(`<a href="/">לעמוד הראשי</a>`);
				}
				AppLocked($$renderer, {
					title: "צריך להתחבר קודם",
					subtitle: "כדי להתחיל את ההתאמה האישית, נכנסים עם כתובת אימייל.",
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
			OnboardingForm($$renderer, { redirectTo: "/dashboard" });
		}
		$$renderer.push(`<!--]--></section>`);
	});
}
//#endregion
//#region src/routes/onboarding/+page.svelte
function _page($$renderer) {
	$$renderer.push(`<main class="app-page">`);
	OnboardingShell($$renderer, {});
	$$renderer.push(`<!----></main>`);
}
//#endregion
export { _page as default };
