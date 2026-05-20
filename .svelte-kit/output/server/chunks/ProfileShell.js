import { et as attr, nt as escape_html, o as derived } from "./dev.js";
import { c as TextareaAutosize, g as useConvexClient, r as initAuth, s as api, t as authQuery, u as resource } from "./session.svelte.js";
import { t as Button_1 } from "./Button.js";
import { t as Notice } from "./Notice.js";
import { t as PageShell } from "./PageShell.js";
import { n as AppLocked, r as AppSkeleton, t as OnboardingForm } from "./OnboardingForm.js";
//#region src/lib/features/profile/components/ProfileShell.svelte
function ProfileShell($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const auth = initAuth();
		const dashboardResource = resource(() => auth.isAuthenticated, async (isAuthenticated) => {
			if (!isAuthenticated) return null;
			return await authQuery(api.users.dashboard.get, {});
		});
		const appProfileResource = resource(() => auth.isAuthenticated, async (isAuthenticated) => {
			if (!isAuthenticated) return null;
			return await authQuery(api.profiles.viewer.get, {});
		});
		const role = derived(() => dashboardResource.current?.role ?? null);
		const isStaff = derived(() => role() === "instructor" || role() === "admin");
		const displayName = derived(() => appProfileResource.current?.displayName ?? "");
		derived(() => displayName().split(" "));
		let instructorName = "";
		let instructorSurname = "";
		let instructorCredentials = "";
		let credentialsEl = null;
		new TextareaAutosize({
			element: () => credentialsEl ?? void 0,
			input: () => instructorCredentials
		});
		let certificateFile = null;
		let certificateDataUrl = "";
		let insuranceFile = null;
		let insuranceDataUrl = "";
		let saving = false;
		let saveError = "";
		let saveSuccess = false;
		const client = useConvexClient();
		const profile = derived(() => dashboardResource.current?.profile ? {
			equipment: dashboardResource.current.profile.equipment,
			experience: dashboardResource.current.profile.experience,
			goals: dashboardResource.current.profile.goals,
			notes: dashboardResource.current.profile.notes ?? ""
		} : null);
		function isImageDataUrl(url) {
			return url.startsWith("data:image/");
		}
		function isPdfDataUrl(url) {
			return url.startsWith("data:application/pdf");
		}
		async function saveInstructorProfile() {
			saving = true;
			saveError = "";
			saveSuccess = false;
			try {
				await client.mutation(api.profiles.update.instructorProfile, {
					displayName: `${instructorName.trim()} ${instructorSurname.trim()}`.trim(),
					credentials: instructorCredentials.trim(),
					certificateDocument: certificateDataUrl || void 0,
					insuranceDocument: insuranceDataUrl || void 0
				});
				saveSuccess = true;
				certificateFile = null;
				insuranceFile = null;
				setTimeout(() => {
					saveSuccess = false;
				}, 3e3);
			} catch (reason) {
				saveError = reason instanceof Error ? reason.message : "לא הצלחנו לשמור.";
			} finally {
				saving = false;
			}
		}
		async function retryDashboard() {
			await dashboardResource.refetch();
		}
		if (auth.isLoading || dashboardResource.loading || isStaff() && appProfileResource.loading) {
			$$renderer.push("<!--[0-->");
			AppSkeleton($$renderer, {});
		} else if (!auth.isAuthenticated) {
			$$renderer.push("<!--[1-->");
			{
				function actions($$renderer) {
					$$renderer.push(`<a href="/" class="locked__action">לעמוד הראשי</a>`);
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
					Button_1($$renderer, {
						tone: "ghost",
						type: "button",
						onclick: retryDashboard,
						children: ($$renderer) => {
							$$renderer.push(`<!---->לנסות שוב`);
						},
						$$slots: { default: true }
					});
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
					if (saveError) {
						$$renderer.push("<!--[0-->");
						Notice($$renderer, {
							tone: "danger",
							children: ($$renderer) => {
								$$renderer.push(`<!---->${escape_html(saveError)}`);
							},
							$$slots: { default: true }
						});
					} else $$renderer.push("<!--[-1-->");
					$$renderer.push(`<!--]--> `);
					if (saveSuccess) {
						$$renderer.push("<!--[0-->");
						Notice($$renderer, {
							tone: "success",
							children: ($$renderer) => {
								$$renderer.push(`<!---->הפרטים נשמרו בהצלחה.`);
							},
							$$slots: { default: true }
						});
					} else $$renderer.push("<!--[-1-->");
					$$renderer.push(`<!--]--> <div class="instructor-form svelte-aafcxl"><section class="form-section svelte-aafcxl"><h3 class="svelte-aafcxl">פרטים אישיים</h3> <label class="field svelte-aafcxl"><span class="field__label svelte-aafcxl">שם פרטי</span> <input${attr("value", instructorName)} placeholder="שם" class="svelte-aafcxl"/></label> <label class="field svelte-aafcxl"><span class="field__label svelte-aafcxl">שם משפחה</span> <input${attr("value", instructorSurname)} placeholder="שם משפחה" class="svelte-aafcxl"/></label></section> <section class="form-section svelte-aafcxl"><h3 class="svelte-aafcxl">הכשרות וביטוח</h3> <label class="field svelte-aafcxl"><span class="field__label svelte-aafcxl">תיאור הכשרות</span> <textarea placeholder="היכן למדת, תעודות הכשרה, שנות ניסיון..." class="svelte-aafcxl">`);
					const $$body = escape_html(instructorCredentials);
					if ($$body) $$renderer.push(`${$$body}`);
					$$renderer.push(`</textarea></label></section> <section class="form-section svelte-aafcxl"><h3 class="svelte-aafcxl">מסמכים משפטיים</h3> <div class="doc-upload svelte-aafcxl"><span class="field__label svelte-aafcxl">תעודת הכשרה</span> `);
					if (certificateDataUrl) {
						$$renderer.push("<!--[0-->");
						$$renderer.push(`<div class="doc-preview svelte-aafcxl">`);
						if (isImageDataUrl(certificateDataUrl)) {
							$$renderer.push("<!--[0-->");
							$$renderer.push(`<img${attr("src", certificateDataUrl)} alt="תעודת הכשרה" class="svelte-aafcxl"/>`);
						} else if (isPdfDataUrl(certificateDataUrl)) {
							$$renderer.push("<!--[1-->");
							$$renderer.push(`<span class="doc-icon svelte-aafcxl">PDF</span>`);
						} else {
							$$renderer.push("<!--[-1-->");
							$$renderer.push(`<span class="doc-icon svelte-aafcxl">קובץ</span>`);
						}
						$$renderer.push(`<!--]--> <span class="doc-name svelte-aafcxl">${escape_html(certificateFile?.name || "תעודה")}</span> `);
						Button_1($$renderer, {
							tone: "ghost",
							type: "button",
							onclick: () => {
								certificateFile = null;
								certificateDataUrl = "";
							},
							children: ($$renderer) => {
								$$renderer.push(`<!---->מחק`);
							},
							$$slots: { default: true }
						});
						$$renderer.push(`<!----></div>`);
					} else {
						$$renderer.push("<!--[-1-->");
						$$renderer.push(`<label class="file-drop svelte-aafcxl"><input type="file" accept="image/*,.pdf" class="svelte-aafcxl"/> <span class="drop-text svelte-aafcxl">גררי תמונה או PDF<br/><small>עד 2MB</small></span></label>`);
					}
					$$renderer.push(`<!--]--></div> <div class="doc-upload svelte-aafcxl"><span class="field__label svelte-aafcxl">ביטוח אחריות מקצועית</span> `);
					if (insuranceDataUrl) {
						$$renderer.push("<!--[0-->");
						$$renderer.push(`<div class="doc-preview svelte-aafcxl">`);
						if (isImageDataUrl(insuranceDataUrl)) {
							$$renderer.push("<!--[0-->");
							$$renderer.push(`<img${attr("src", insuranceDataUrl)} alt="ביטוח" class="svelte-aafcxl"/>`);
						} else if (isPdfDataUrl(insuranceDataUrl)) {
							$$renderer.push("<!--[1-->");
							$$renderer.push(`<span class="doc-icon svelte-aafcxl">PDF</span>`);
						} else {
							$$renderer.push("<!--[-1-->");
							$$renderer.push(`<span class="doc-icon svelte-aafcxl">קובץ</span>`);
						}
						$$renderer.push(`<!--]--> <span class="doc-name svelte-aafcxl">${escape_html(insuranceFile?.name || "ביטוח")}</span> `);
						Button_1($$renderer, {
							tone: "ghost",
							type: "button",
							onclick: () => {
								insuranceFile = null;
								insuranceDataUrl = "";
							},
							children: ($$renderer) => {
								$$renderer.push(`<!---->מחק`);
							},
							$$slots: { default: true }
						});
						$$renderer.push(`<!----></div>`);
					} else {
						$$renderer.push("<!--[-1-->");
						$$renderer.push(`<label class="file-drop svelte-aafcxl"><input type="file" accept="image/*,.pdf" class="svelte-aafcxl"/> <span class="drop-text svelte-aafcxl">גררי תמונה או PDF<br/><small>עד 2MB</small></span></label>`);
					}
					$$renderer.push(`<!--]--></div></section> `);
					Button_1($$renderer, {
						tone: "ink",
						onclick: saveInstructorProfile,
						disabled: saving,
						children: ($$renderer) => {
							$$renderer.push(`<!---->${escape_html(saving ? "שומר..." : "שמור פרופיל")}`);
						},
						$$slots: { default: true }
					});
					$$renderer.push(`<!----></div>`);
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
