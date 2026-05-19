import { U as attr, W as escape_html, a as derived } from "./dev.js";
import { c as resource, r as initAuth, s as api, t as authQuery } from "./session.svelte.js";
import "./Notice.js";
import { t as PageShell } from "./PageShell.js";
import { n as AppLocked, r as AppSkeleton, t as OnboardingForm } from "./OnboardingForm.js";
//#region src/lib/features/profile/components/ProfileShell.svelte
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
					$$renderer.push(`<!--]--> <div class="instructor-form svelte-aafcxl"><section class="form-section svelte-aafcxl"><h3 class="svelte-aafcxl">פרטים אישיים</h3> <label class="field svelte-aafcxl"><span class="field__label svelte-aafcxl">שם פרטי</span> <input${attr("value", instructorName)} placeholder="שם" class="svelte-aafcxl"/></label> <label class="field svelte-aafcxl"><span class="field__label svelte-aafcxl">שם משפחה</span> <input${attr("value", instructorSurname)} placeholder="שם משפחה" class="svelte-aafcxl"/></label></section> <section class="form-section svelte-aafcxl"><h3 class="svelte-aafcxl">הכשרות וביטוח</h3> <label class="field svelte-aafcxl"><span class="field__label svelte-aafcxl">תיאור הכשרות</span> <textarea rows="3" placeholder="היכן למדת, תעודות הכשרה, שנות ניסיון..." class="svelte-aafcxl">`);
					const $$body = escape_html(instructorCredentials);
					if ($$body) $$renderer.push(`${$$body}`);
					$$renderer.push(`</textarea></label></section> <section class="form-section svelte-aafcxl"><h3 class="svelte-aafcxl">מסמכים משפטיים</h3> <div class="doc-upload svelte-aafcxl"><span class="field__label svelte-aafcxl">תעודת הכשרה</span> `);
					$$renderer.push("<!--[-1-->");
					$$renderer.push(`<label class="file-drop svelte-aafcxl"><input type="file" accept="image/*,.pdf" class="svelte-aafcxl"/> <span class="drop-text svelte-aafcxl">גררי תמונה או PDF<br/><small>עד 2MB</small></span></label>`);
					$$renderer.push(`<!--]--></div> <div class="doc-upload svelte-aafcxl"><span class="field__label svelte-aafcxl">ביטוח אחריות מקצועית</span> `);
					$$renderer.push("<!--[-1-->");
					$$renderer.push(`<label class="file-drop svelte-aafcxl"><input type="file" accept="image/*,.pdf" class="svelte-aafcxl"/> <span class="drop-text svelte-aafcxl">גררי תמונה או PDF<br/><small>עד 2MB</small></span></label>`);
					$$renderer.push(`<!--]--></div></section> <button class="btn-save svelte-aafcxl"${attr("disabled", saving, true)}>${escape_html("שמור פרופיל")}</button></div>`);
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
		$$renderer.push(`<!--]-->`);
	});
}
//#endregion
export { ProfileShell as t };
