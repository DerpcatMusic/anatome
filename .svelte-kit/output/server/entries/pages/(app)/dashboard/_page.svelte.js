import { H as attr, U as escape_html, a as derived, n as attr_class } from "../../../../chunks/dev.js";
import { o as api } from "../../../../chunks/session.svelte.js";
import { t as Notice } from "../../../../chunks/Notice.js";
import { t as useAuthQuery } from "../../../../chunks/useAuthQuery.svelte.js";
import { a as equipmentLabelMap, c as experienceLabelMap, d as goalLabelMap } from "../../../../chunks/labels.js";
import { t as AppLayout } from "../../../../chunks/AppLayout.js";
import { n as AppSkeleton, t as AppLocked } from "../../../../chunks/AppLocked.js";
import { t as AuthGuard } from "../../../../chunks/AuthGuard.js";
import { t as PageShell } from "../../../../chunks/PageShell.js";
//#region src/components/app/Dashboard.svelte
function Dashboard($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { profile, liveAlert, role, appProfile } = $$props;
		const isStaff = derived(() => role === "instructor" || role === "admin");
		function fmtList(arr, labels) {
			return arr.map((v) => labels[v] ?? v).filter(Boolean).join(", ") || "—";
		}
		AppLayout($$renderer, {
			role,
			children: ($$renderer) => {
				PageShell($$renderer, {
					title: isStaff() ? "סטודיו" : "האזור האישי",
					kicker: "HomeBody",
					description: isStaff() ? "אזור הניהול שלך. כאן מופיעים הלייבים, הוידאו והסטטיסטיקות." : "האזור האישי שלך מוכן. כאן יופיעו השיעורים, הלייבים והקרדיטים שלך.",
					children: ($$renderer) => {
						if (liveAlert) {
							$$renderer.push("<!--[0-->");
							$$renderer.push(`<a class="live-alert svelte-1o1fako"${attr("href", `/live-room?classId=${liveAlert.liveClassId}`)}><span class="live-alert__pulse svelte-1o1fako"></span> <span class="svelte-1o1fako"><strong class="svelte-1o1fako">לייב פתוח עכשיו</strong> <small class="svelte-1o1fako">${escape_html(liveAlert.title)}</small></span></a>`);
						} else $$renderer.push("<!--[-1-->");
						$$renderer.push(`<!--]--> `);
						if (isStaff()) {
							$$renderer.push("<!--[0-->");
							if (appProfile) {
								$$renderer.push("<!--[0-->");
								$$renderer.push(`<div class="profile-summary svelte-1o1fako"><div class="profile-summary__header svelte-1o1fako"><p class="profile-summary__kicker svelte-1o1fako">פרופיל מדריכה</p> <a href="/profile" class="profile-summary__edit svelte-1o1fako">ערוך</a></div> <div class="profile-summary__grid svelte-1o1fako"><div class="profile-summary__cell svelte-1o1fako"><span class="profile-summary__label svelte-1o1fako">שם</span> <span class="profile-summary__value svelte-1o1fako">${escape_html(appProfile.displayName || "—")}</span></div> `);
								if (appProfile.credentials) {
									$$renderer.push("<!--[0-->");
									$$renderer.push(`<div class="profile-summary__cell profile-summary__cell--wide svelte-1o1fako"><span class="profile-summary__label svelte-1o1fako">הכשרות וביטוח</span> <span class="profile-summary__value svelte-1o1fako">${escape_html(appProfile.credentials)}</span></div>`);
								} else $$renderer.push("<!--[-1-->");
								$$renderer.push(`<!--]--></div> <div class="compliance-bar svelte-1o1fako"><div${attr_class("compliance-item svelte-1o1fako", void 0, { "compliance--ok": appProfile.certificateDocument })}><span class="compliance-dot svelte-1o1fako">${escape_html(appProfile.certificateDocument ? "●" : "○")}</span> <span class="svelte-1o1fako">תעודת הכשרה</span></div> <div${attr_class("compliance-item svelte-1o1fako", void 0, { "compliance--ok": appProfile.insuranceDocument })}><span class="compliance-dot svelte-1o1fako">${escape_html(appProfile.insuranceDocument ? "●" : "○")}</span> <span class="svelte-1o1fako">ביטוח אחריות</span></div></div></div>`);
							} else $$renderer.push("<!--[-1-->");
							$$renderer.push(`<!--]--> <div class="instructor-actions svelte-1o1fako"><a class="action-card svelte-1o1fako" href="/live"><span class="action-card__num svelte-1o1fako">01</span> <h3 class="svelte-1o1fako">סטודיו לייב</h3> <p class="svelte-1o1fako">תזמון שיעורים, פתיחת חדר, ניהול משתתפות</p></a> <a class="action-card svelte-1o1fako" href="/videos"><span class="action-card__num svelte-1o1fako">02</span> <h3 class="svelte-1o1fako">ניהול וידאו</h3> <p class="svelte-1o1fako">העלאת שיעורים, פרסום, ארכיון</p></a> <a class="action-card svelte-1o1fako" href="/calendar"><span class="action-card__num svelte-1o1fako">03</span> <h3 class="svelte-1o1fako">לוח לייבים</h3> <p class="svelte-1o1fako">צפייה בכל השיעורים הקרובים</p></a></div>`);
						} else if (profile) {
							$$renderer.push("<!--[1-->");
							$$renderer.push(`<div class="profile-summary svelte-1o1fako"><div class="profile-summary__header svelte-1o1fako"><p class="profile-summary__kicker svelte-1o1fako">פרופיל פילאטיס</p> <a href="/profile" class="profile-summary__edit svelte-1o1fako">ערוך</a></div> <div class="profile-summary__grid svelte-1o1fako"><div class="profile-summary__cell svelte-1o1fako"><span class="profile-summary__label svelte-1o1fako">ניסיון</span> <span class="profile-summary__value svelte-1o1fako">${escape_html(experienceLabelMap[profile.experience] ?? profile.experience)}</span></div> <div class="profile-summary__cell svelte-1o1fako"><span class="profile-summary__label svelte-1o1fako">ציוד</span> <span class="profile-summary__value svelte-1o1fako">${escape_html(fmtList(profile.equipment, equipmentLabelMap))}</span></div> <div class="profile-summary__cell svelte-1o1fako"><span class="profile-summary__label svelte-1o1fako">מטרות</span> <span class="profile-summary__value svelte-1o1fako">${escape_html(fmtList(profile.goals, goalLabelMap))}</span></div> `);
							if (profile.notes && profile.notes.trim().length > 0) {
								$$renderer.push("<!--[0-->");
								$$renderer.push(`<div class="profile-summary__cell profile-summary__cell--wide svelte-1o1fako"><span class="profile-summary__label svelte-1o1fako">הערות</span> <span class="profile-summary__value svelte-1o1fako">${escape_html(profile.notes)}</span></div>`);
							} else $$renderer.push("<!--[-1-->");
							$$renderer.push(`<!--]--></div></div>`);
						} else $$renderer.push("<!--[-1-->");
						$$renderer.push(`<!--]--> <div class="empty-state svelte-1o1fako"><p class="empty-state__kicker svelte-1o1fako">התוכן שלך</p> <p class="empty-state__text svelte-1o1fako">`);
						if (isStaff()) {
							$$renderer.push("<!--[0-->");
							$$renderer.push(`אין עדיין שיעורים פעילים. השתמשי בסטודיו כדי ליצור את הלייב הראשון.`);
						} else {
							$$renderer.push("<!--[-1-->");
							$$renderer.push(`אין עדיין שיעורים פעילים. ברגע שתרשמי למנוי או תשתמשי בקרדיט, הכל יופיע כאן.`);
						}
						$$renderer.push(`<!--]--></p></div>`);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});
	});
}
//#endregion
//#region src/components/app/AppShell.svelte
function AppShell($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const dashboardResource = useAuthQuery(api.users.dashboard, {}, { initialValue: null });
		const current = derived(() => dashboardResource.current);
		const loading = derived(() => dashboardResource.loading);
		const error = derived(() => dashboardResource.error);
		AuthGuard($$renderer, {
			children: ($$renderer) => {
				if (loading()) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<div class="app-frame svelte-1qpubqh">`);
					AppSkeleton($$renderer, {});
					$$renderer.push(`<!----></div>`);
				} else if (error()) {
					$$renderer.push("<!--[1-->");
					$$renderer.push(`<div class="app-frame svelte-1qpubqh">`);
					{
						function actions($$renderer) {
							Notice($$renderer, {
								tone: "danger",
								children: ($$renderer) => {
									$$renderer.push(`<!---->${escape_html(error().message)}`);
								},
								$$slots: { default: true }
							});
							$$renderer.push(`<!----> <button class="svelte-1qpubqh">לנסות שוב</button>`);
						}
						AppLocked($$renderer, {
							title: "לא הצלחנו לטעון",
							subtitle: "",
							actions,
							$$slots: { actions: true }
						});
					}
					$$renderer.push(`<!----></div>`);
				} else if (current() === null) {
					$$renderer.push("<!--[2-->");
					$$renderer.push(`<div class="app-frame svelte-1qpubqh">`);
					{
						function actions($$renderer) {
							$$renderer.push(`<a href="/" class="svelte-1qpubqh">כניסה</a>`);
						}
						AppLocked($$renderer, {
							title: "צריך להתחבר",
							subtitle: "החשבון נעול. נכנסים מחדש דרך העמוד הראשי.",
							actions,
							$$slots: { actions: true }
						});
					}
					$$renderer.push(`<!----></div>`);
				} else if (current().needsOnboarding) {
					$$renderer.push("<!--[3-->");
					$$renderer.push(`<div class="app-frame svelte-1qpubqh">`);
					{
						function actions($$renderer) {
							$$renderer.push(`<a href="/onboarding" class="svelte-1qpubqh">להמשיך בהתאמה</a> <button class="svelte-1qpubqh">יציאה</button>`);
						}
						AppLocked($$renderer, {
							kicker: "כמעט שם",
							title: "צריך לסיים התאמה אישית",
							subtitle: "קצר, פשוט, ויעזור לנו להתאים לך שיעורים.",
							actions,
							$$slots: { actions: true }
						});
					}
					$$renderer.push(`<!----></div>`);
				} else {
					$$renderer.push("<!--[-1-->");
					Dashboard($$renderer, {
						profile: current().profile,
						liveAlert: current().liveAlert,
						role: current().role,
						appProfile: current().appProfile
					});
				}
				$$renderer.push(`<!--]-->`);
			},
			$$slots: { default: true }
		});
	});
}
//#endregion
//#region src/routes/(app)/dashboard/+page.svelte
function _page($$renderer) {
	AppShell($$renderer, {});
}
//#endregion
export { _page as default };
