import { H as attr, U as escape_html, a as derived } from "../../../../chunks/dev.js";
import { o as api, r as initAuth, s as resource, t as authQuery } from "../../../../chunks/session.svelte.js";
import "../../../../chunks/Notice.js";
import { n as AppSkeleton, t as AppLocked } from "../../../../chunks/AppLocked.js";
import { t as PageShell } from "../../../../chunks/PageShell.js";
import { t as OnboardingForm } from "../../../../chunks/OnboardingForm.js";
//#region src/components/app/ProfileShell.svelte
function ProfileShell($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const auth = initAuth();
		const dashboardResource = resource(() => auth.isAuthenticated, async (isAuthenticated) => {
			if (!isAuthenticated) return null;
			return await authQuery(api.users.dashboard, {});
		});
		const appProfileResource = resource(() => auth.isAuthenticated, async (isAuthenticated) => {
			if (!isAuthenticated) return null;
			return await authQuery(api.appProfiles.viewer, {});
		});
		const role = derived(() => dashboardResource.current?.role ?? null);
		const isStaff = derived(() => role() === "instructor" || role() === "admin");
		const displayName = derived(() => appProfileResource.current?.displayName ?? "");
		derived(() => displayName().split(" "));
		let instructorName = "";
		let instructorSurname = "";
		let instructorCredentials = "";
		let saving = false;
		const profile = derived(() => dashboardResource.current?.profile ? {
			equipment: dashboardResource.current.profile.equipment,
			experience: dashboardResource.current.profile.experience,
			goals: dashboardResource.current.profile.goals,
			notes: dashboardResource.current.profile.notes ?? ""
		} : null);
		$$renderer.push(`<section class="profile-page svelte-6rcpp3">`);
		if (auth.isLoading || dashboardResource.loading || isStaff() && appProfileResource.loading) {
			$$renderer.push("<!--[0-->");
			AppSkeleton($$renderer, {});
		} else if (!auth.isAuthenticated) {
			$$renderer.push("<!--[1-->");
			{
				function actions($$renderer) {
					$$renderer.push(`<a href="/">לעמוד הראשי</a>`);
				}
				AppLocked($$renderer, {
					title: "צריך להתחבר קודם",
					subtitle: "כדי לערוך את הפרופיל, נכנסים עם כתובת אימייל.",
					actions,
					$$slots: { actions: true }
				});
			}
		} else if (dashboardResource.error) {
			$$renderer.push("<!--[2-->");
			{
				function actions($$renderer) {
					$$renderer.push(`<button>לנסות שוב</button>`);
				}
				AppLocked($$renderer, {
					title: "לא הצלחנו לטעון",
					subtitle: "נסי לרענן את הדף.",
					actions,
					$$slots: { actions: true }
				});
			}
		} else if (isStaff()) {
			$$renderer.push("<!--[3-->");
			PageShell($$renderer, {
				kicker: "HomeBody Studio",
				title: "פרופיל מדריכה",
				description: "פרטים אישיים, הכשרות, ומסמכים משפטיים נדרשים.",
				children: ($$renderer) => {
					$$renderer.push("<!--[-1-->");
					$$renderer.push(`<!--]--> `);
					$$renderer.push("<!--[-1-->");
					$$renderer.push(`<!--]--> <div class="instructor-form svelte-6rcpp3"><div class="form-section svelte-6rcpp3"><h3 class="svelte-6rcpp3">פרטים אישיים</h3> <label class="field svelte-6rcpp3"><span class="field__label svelte-6rcpp3">שם פרטי</span> <input${attr("value", instructorName)} placeholder="שם" class="svelte-6rcpp3"/></label> <label class="field svelte-6rcpp3"><span class="field__label svelte-6rcpp3">שם משפחה</span> <input${attr("value", instructorSurname)} placeholder="שם משפחה" class="svelte-6rcpp3"/></label></div> <div class="form-section svelte-6rcpp3"><h3 class="svelte-6rcpp3">הכשרות וביטוח</h3> <label class="field svelte-6rcpp3"><span class="field__label svelte-6rcpp3">תיאור הכשרות</span> <textarea rows="3" placeholder="היכן למדת, תעודות הכשרה, שנות ניסיון..." class="svelte-6rcpp3">`);
					const $$body = escape_html(instructorCredentials);
					if ($$body) $$renderer.push(`${$$body}`);
					$$renderer.push(`</textarea></label></div> <div class="form-section svelte-6rcpp3"><h3 class="svelte-6rcpp3">מסמכים משפטיים</h3> <div class="doc-upload svelte-6rcpp3"><span class="field__label svelte-6rcpp3">תעודת הכשרה</span> `);
					$$renderer.push("<!--[-1-->");
					$$renderer.push(`<label class="file-drop svelte-6rcpp3"><input type="file" accept="image/*,.pdf" class="svelte-6rcpp3"/> <span class="drop-text svelte-6rcpp3">גררי תמונה או PDF<br/><small class="svelte-6rcpp3">עד 2MB</small></span></label>`);
					$$renderer.push(`<!--]--></div> <div class="doc-upload svelte-6rcpp3"><span class="field__label svelte-6rcpp3">ביטוח אחריות מקצועית</span> `);
					$$renderer.push("<!--[-1-->");
					$$renderer.push(`<label class="file-drop svelte-6rcpp3"><input type="file" accept="image/*,.pdf" class="svelte-6rcpp3"/> <span class="drop-text svelte-6rcpp3">גררי תמונה או PDF<br/><small class="svelte-6rcpp3">עד 2MB</small></span></label>`);
					$$renderer.push(`<!--]--></div></div> <button class="btn btn--ink svelte-6rcpp3"${attr("disabled", saving, true)}>${escape_html("שמור פרופיל")}</button></div>`);
				},
				$$slots: { default: true }
			});
		} else if (profile()) {
			$$renderer.push("<!--[4-->");
			OnboardingForm($$renderer, {
				mode: "edit",
				initialProfile: profile()
			});
		} else {
			$$renderer.push("<!--[-1-->");
			AppSkeleton($$renderer, {});
		}
		$$renderer.push(`<!--]--></section>`);
	});
}
//#endregion
//#region src/routes/(app)/profile/+page.svelte
function _page($$renderer) {
	ProfileShell($$renderer, {});
}
//#endregion
export { _page as default };
