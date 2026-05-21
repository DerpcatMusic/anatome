import { et as attr, n as attr_class, nt as escape_html, o as derived } from "./dev.js";
import { t as liveRoomHref } from "./context.js";
import { _ as useQuery, a as signOut, r as initAuth, s as api } from "./session.svelte.js";
import { t as Button_1 } from "./Button.js";
import { t as useI18n } from "./runes.svelte.js";
import { t as PageShell } from "./PageShell.js";
import { a as equipmentLabelMap, c as experienceLabelMap, f as goalLabelMap, u as fmtList } from "./labels.js";
//#region src/lib/features/dashboard/components/LiveAlert.svelte
function LiveAlert($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { liveAlert } = $$props;
		const { t } = useI18n();
		if (liveAlert) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<a class="live-alert flex items-center gap-3 svelte-ng537h"${attr("href", liveRoomHref(liveAlert.liveClassId))}><span class="live-alert__pulse svelte-ng537h"></span> <span class="svelte-ng537h"><strong class="svelte-ng537h">${escape_html(t.dashboard.liveAlert.title())}</strong> <small class="svelte-ng537h">${escape_html(liveAlert.title)}</small></span></a>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]-->`);
	});
}
//#endregion
//#region src/lib/features/dashboard/components/InstructorActions.svelte
function InstructorActions($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { t } = useI18n();
		$$renderer.push(`<div class="instructor-actions svelte-wafgwn"><a class="action-card svelte-wafgwn" href="/i/live"><span class="action-card__num svelte-wafgwn">01</span> <h3 class="svelte-wafgwn">${escape_html(t.dashboard.actions.studioLive.title())}</h3> <p class="svelte-wafgwn">${escape_html(t.dashboard.actions.studioLive.desc())}</p></a> <a class="action-card svelte-wafgwn" href="/i/videos"><span class="action-card__num svelte-wafgwn">02</span> <h3 class="svelte-wafgwn">${escape_html(t.dashboard.actions.videos.title())}</h3> <p class="svelte-wafgwn">${escape_html(t.dashboard.actions.videos.desc())}</p></a> <a class="action-card svelte-wafgwn" href="/u/calendar"><span class="action-card__num svelte-wafgwn">03</span> <h3 class="svelte-wafgwn">${escape_html(t.dashboard.actions.calendar.title())}</h3> <p class="svelte-wafgwn">${escape_html(t.dashboard.actions.calendar.desc())}</p></a></div>`);
	});
}
//#endregion
//#region src/lib/features/dashboard/components/ProfileSummary.svelte
function ProfileSummary($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { isStaff, appProfile, profile } = $$props;
		const { t } = useI18n();
		if (isStaff && appProfile) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="profile-summary svelte-1iynl6q"><div class="profile-summary__header svelte-1iynl6q"><p class="profile-summary__kicker svelte-1iynl6q">${escape_html(t.dashboard.staffProfile.title())}</p> <a href="/u/profile" class="profile-summary__edit svelte-1iynl6q">${escape_html(t.dashboard.profile.edit())}</a></div> <div class="profile-summary__grid svelte-1iynl6q"><div class="profile-summary__cell svelte-1iynl6q"><span class="profile-summary__label svelte-1iynl6q">${escape_html(t.dashboard.staffProfile.name())}</span> <span class="profile-summary__value svelte-1iynl6q">${escape_html(appProfile.displayName || "—")}</span></div> `);
			if (appProfile.credentials) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<div class="profile-summary__cell profile-summary__cell--wide svelte-1iynl6q"><span class="profile-summary__label svelte-1iynl6q">${escape_html(t.dashboard.staffProfile.credentials())}</span> <span class="profile-summary__value svelte-1iynl6q">${escape_html(appProfile.credentials)}</span></div>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--></div> <div class="compliance-bar svelte-1iynl6q"><div${attr_class("compliance-item svelte-1iynl6q", void 0, { "compliance--ok": appProfile.certificateDocument })}><span class="compliance-dot svelte-1iynl6q">${escape_html(appProfile.certificateDocument ? "●" : "○")}</span> <span>${escape_html(t.dashboard.staffProfile.certificate())}</span></div> <div${attr_class("compliance-item svelte-1iynl6q", void 0, { "compliance--ok": appProfile.insuranceDocument })}><span class="compliance-dot svelte-1iynl6q">${escape_html(appProfile.insuranceDocument ? "●" : "○")}</span> <span>${escape_html(t.dashboard.staffProfile.insurance())}</span></div></div></div>`);
		} else if (!isStaff && profile) {
			$$renderer.push("<!--[1-->");
			$$renderer.push(`<div class="profile-summary svelte-1iynl6q"><div class="profile-summary__header svelte-1iynl6q"><p class="profile-summary__kicker svelte-1iynl6q">${escape_html(t.dashboard.customerProfile.title())}</p> <a href="/u/profile" class="profile-summary__edit svelte-1iynl6q">${escape_html(t.dashboard.profile.edit())}</a></div> <div class="profile-summary__grid svelte-1iynl6q"><div class="profile-summary__cell svelte-1iynl6q"><span class="profile-summary__label svelte-1iynl6q">${escape_html(t.dashboard.profile.experience())}</span> <span class="profile-summary__value svelte-1iynl6q">${escape_html(experienceLabelMap[profile.experience] ?? profile.experience)}</span></div> <div class="profile-summary__cell svelte-1iynl6q"><span class="profile-summary__label svelte-1iynl6q">${escape_html(t.dashboard.profile.equipment())}</span> <span class="profile-summary__value svelte-1iynl6q">${escape_html(fmtList(profile.equipment, equipmentLabelMap))}</span></div> <div class="profile-summary__cell svelte-1iynl6q"><span class="profile-summary__label svelte-1iynl6q">${escape_html(t.dashboard.profile.goals())}</span> <span class="profile-summary__value svelte-1iynl6q">${escape_html(fmtList(profile.goals, goalLabelMap))}</span></div> `);
			if (profile.notes && profile.notes.trim().length > 0) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<div class="profile-summary__cell profile-summary__cell--wide svelte-1iynl6q"><span class="profile-summary__label svelte-1iynl6q">${escape_html(t.dashboard.profile.notes())}</span> <span class="profile-summary__value svelte-1iynl6q">${escape_html(profile.notes)}</span></div>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--></div></div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]-->`);
	});
}
//#endregion
//#region src/lib/features/dashboard/components/Dashboard.svelte
function Dashboard($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { profile, liveAlert, role, appProfile } = $$props;
		const isStaff = derived(() => role === "instructor" || role === "admin");
		const { t } = useI18n();
		PageShell($$renderer, {
			title: isStaff() ? t.dashboard.titleStaff() : t.dashboard.title(),
			kicker: t.dashboard.kicker(),
			description: isStaff() ? t.dashboard.description.staff() : t.dashboard.description.customer(),
			children: ($$renderer) => {
				LiveAlert($$renderer, { liveAlert });
				$$renderer.push(`<!----> `);
				if (isStaff()) {
					$$renderer.push("<!--[0-->");
					ProfileSummary($$renderer, {
						isStaff: isStaff(),
						appProfile
					});
					$$renderer.push(`<!----> `);
					InstructorActions($$renderer, {});
					$$renderer.push(`<!---->`);
				} else if (profile) {
					$$renderer.push("<!--[1-->");
					ProfileSummary($$renderer, {
						isStaff: isStaff(),
						profile
					});
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--> <div class="empty-state svelte-z4fr09"><p class="empty-state__kicker svelte-z4fr09">${escape_html(t.dashboard.empty.title())}</p> <p class="empty-state__text svelte-z4fr09">`);
				if (isStaff()) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`${escape_html(t.dashboard.empty.staff())}`);
				} else {
					$$renderer.push("<!--[-1-->");
					$$renderer.push(`${escape_html(t.dashboard.empty.customer())}`);
				}
				$$renderer.push(`<!--]--></p></div>`);
			},
			$$slots: { default: true }
		});
	});
}
//#endregion
//#region src/lib/features/app/components/AppShell.svelte
function AppShell($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const auth = initAuth();
		const query = useQuery(api.users.dashboard.get, () => auth.isAuthenticated ? {} : "skip");
		if (query.isLoading) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="app-frame svelte-5rkayd"><p class="svelte-5rkayd">טוען...</p></div>`);
		} else if (!auth.isAuthenticated) {
			$$renderer.push("<!--[1-->");
			$$renderer.push(`<div class="app-frame svelte-5rkayd"><div class="locked svelte-5rkayd"><p class="locked__kicker svelte-5rkayd">HomeBody</p> <h1 class="svelte-5rkayd">צריך להתחבר</h1> <p class="svelte-5rkayd">כדי לפתוח את האזור האישי, נכנסים עם כתובת אימייל.</p> <div class="locked__actions svelte-5rkayd">`);
			Button_1($$renderer, {
				tone: "ink",
				size: "md",
				onclick: () => window.location.assign("/"),
				children: ($$renderer) => {
					$$renderer.push(`<!---->כניסה`);
				},
				$$slots: { default: true }
			});
			$$renderer.push(`<!----></div></div></div>`);
		} else if (query.error) {
			$$renderer.push("<!--[2-->");
			$$renderer.push(`<div class="app-frame svelte-5rkayd"><p class="svelte-5rkayd">שגיאה: ${escape_html(query.error.message)}</p></div>`);
		} else if (query.data?.needsOnboarding) {
			$$renderer.push("<!--[3-->");
			$$renderer.push(`<div class="app-frame svelte-5rkayd"><div class="locked svelte-5rkayd"><p class="locked__kicker svelte-5rkayd">כמעט שם</p> <h1 class="svelte-5rkayd">צריך לסיים התאמה אישית</h1> <p class="svelte-5rkayd">קצר, פשוט, ויעזור לנו להתאים לך שיעורים.</p> <div class="locked__actions svelte-5rkayd">`);
			Button_1($$renderer, {
				tone: "ink",
				size: "md",
				onclick: () => window.location.assign("/onboarding"),
				children: ($$renderer) => {
					$$renderer.push(`<!---->להמשיך בהתאמה`);
				},
				$$slots: { default: true }
			});
			$$renderer.push(`<!----> `);
			Button_1($$renderer, {
				tone: "paper",
				size: "sm",
				onclick: signOut,
				children: ($$renderer) => {
					$$renderer.push(`<!---->יציאה`);
				},
				$$slots: { default: true }
			});
			$$renderer.push(`<!----></div></div></div>`);
		} else if (query.data) {
			$$renderer.push("<!--[4-->");
			Dashboard($$renderer, {
				profile: query.data.profile,
				liveAlert: query.data.liveAlert,
				role: query.data.role,
				appProfile: query.data.appProfile
			});
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]-->`);
	});
}
//#endregion
export { AppShell as t };
