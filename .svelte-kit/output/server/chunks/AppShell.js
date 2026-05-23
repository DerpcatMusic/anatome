import { Q as attr, c as ensure_array_like, et as escape_html, n as attr_class, o as derived } from "./dev.js";
import { t as liveRoomHref } from "./context.js";
import { _ as useQuery, a as signOut, g as useConvexClient, r as initAuth, s as api } from "./session.svelte.js";
import { t as Button } from "./button.js";
import { t as Notice } from "./Notice.js";
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
//#region src/lib/features/dashboard/components/SubscriptionManager.svelte
function SubscriptionManager($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { subscription, subscriptionPlan, pendingSubscriptionPlan, creditBucket } = $$props;
		const client = useConvexClient();
		const plansQuery = useQuery(api.subscriptions.customer.listPlans, {});
		let pending = null;
		let error = "";
		const activePlanSlug = derived(() => subscriptionPlan?.slug ?? null);
		const pendingPlanSlug = derived(() => pendingSubscriptionPlan?.slug ?? null);
		const renewalDate = derived(() => subscription ? new Date(subscription.currentPeriodEnd).toLocaleDateString("he-IL") : null);
		const vodAvailable = derived(() => creditBucket ? Math.max(0, creditBucket.vodGranted - creditBucket.vodUsed) : 0);
		const liveAvailable = derived(() => creditBucket ? Math.max(0, creditBucket.liveGranted - creditBucket.liveUsed - (creditBucket.liveReserved ?? 0)) : 0);
		const oneOnOneAvailable = derived(() => creditBucket ? Math.max(0, creditBucket.oneOnOneGranted - creditBucket.oneOnOneUsed - (creditBucket.oneOnOneReserved ?? 0)) : 0);
		function statusLabel(row) {
			if (!row) return "לא פעיל";
			if (row.cancelAtPeriodEnd) return "מבוטל בסוף התקופה";
			if (pendingSubscriptionPlan) return "שינוי מתוזמן";
			if (row.status === "trialing") return "ניסיון";
			if (row.status === "active") return "פעיל";
			if (row.status === "past_due") return "דורש טיפול";
			if (row.status === "cancelled") return "מבוטל";
			return "פג תוקף";
		}
		async function choosePlan(slug) {
			error = "";
			pending = slug;
			try {
				if (subscription) await client.mutation(api.subscriptions.customer.changePlan, { planSlug: slug });
				else await client.mutation(api.subscriptions.customer.activatePlan, { planSlug: slug });
			} catch (reason) {
				error = reason instanceof Error ? reason.message : "לא הצלחנו לעדכן מנוי כרגע.";
			} finally {
				pending = null;
			}
		}
		async function cancelAtPeriodEnd() {
			error = "";
			pending = "cancel";
			try {
				await client.mutation(api.subscriptions.customer.cancelAtPeriodEnd, {});
			} catch (reason) {
				error = reason instanceof Error ? reason.message : "לא הצלחנו לבטל מנוי כרגע.";
			} finally {
				pending = null;
			}
		}
		async function cancelPendingPlanChange() {
			error = "";
			pending = "cancel-change";
			try {
				await client.mutation(api.subscriptions.customer.cancelPendingPlanChange, {});
			} catch (reason) {
				error = reason instanceof Error ? reason.message : "לא הצלחנו לבטל שינוי מסלול כרגע.";
			} finally {
				pending = null;
			}
		}
		async function resume() {
			error = "";
			pending = "resume";
			try {
				await client.mutation(api.subscriptions.customer.resume, {});
			} catch (reason) {
				error = reason instanceof Error ? reason.message : "לא הצלחנו לחדש מנוי כרגע.";
			} finally {
				pending = null;
			}
		}
		$$renderer.push(`<section class="subscription-panel svelte-g11oql" aria-labelledby="subscription-title"><div class="subscription-panel__header svelte-g11oql"><div><p class="subscription-panel__kicker svelte-g11oql">מנוי וקרדיטים</p> <h2 id="subscription-title" class="svelte-g11oql">${escape_html(subscriptionPlan?.nameHe ?? "אין מנוי פעיל")}</h2></div> <span class="subscription-badge svelte-g11oql"${attr("data-tone", subscription?.cancelAtPeriodEnd || pendingSubscriptionPlan ? "warning" : subscription ? "success" : "muted")}>${escape_html(statusLabel(subscription))}</span></div> `);
		if (subscription && renewalDate()) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<p class="subscription-panel__meta svelte-g11oql">`);
			if (pendingSubscriptionPlan) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`המסלול הנוכחי נשאר פעיל עד ${escape_html(renewalDate())}, ואז יתחדש במסלול ${escape_html(pendingSubscriptionPlan.nameHe)}.`);
			} else {
				$$renderer.push("<!--[-1-->");
				$$renderer.push(`${escape_html(subscription.cancelAtPeriodEnd ? "הגישה תישאר פעילה עד" : "התקופה הנוכחית מסתיימת ב")} ${escape_html(renewalDate())}`);
			}
			$$renderer.push(`<!--]--></p>`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<p class="subscription-panel__meta svelte-g11oql">אפשר להפעיל מסלול עכשיו. חיוב יחובר בהמשך דרך ספק ישראלי.</p>`);
		}
		$$renderer.push(`<!--]--> <div class="credit-strip svelte-g11oql" aria-label="קרדיטים זמינים"><div class="credit-tile svelte-g11oql"><span class="credit-tile__value svelte-g11oql">${escape_html(vodAvailable())}</span> <span class="credit-tile__label svelte-g11oql">Macroflow</span></div> <div class="credit-tile svelte-g11oql"><span class="credit-tile__value svelte-g11oql">${escape_html(liveAvailable())}</span> <span class="credit-tile__label svelte-g11oql">לייב קבוצתי</span></div> <div class="credit-tile svelte-g11oql"><span class="credit-tile__value svelte-g11oql">${escape_html(oneOnOneAvailable())}</span> <span class="credit-tile__label svelte-g11oql">1:1 אישי</span></div></div> `);
		if (plansQuery.error) {
			$$renderer.push("<!--[0-->");
			Notice($$renderer, {
				tone: "danger",
				children: ($$renderer) => {
					$$renderer.push(`<!---->לא הצלחנו לטעון מסלולים. נסו שוב בעוד רגע.`);
				},
				$$slots: { default: true }
			});
		} else if (plansQuery.isLoading) {
			$$renderer.push("<!--[1-->");
			Notice($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->טוענים מסלולים...`);
				},
				$$slots: { default: true }
			});
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<div class="plan-grid svelte-g11oql"><!--[-->`);
			const each_array = ensure_array_like(plansQuery.data ?? []);
			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let plan = each_array[$$index];
				const isScheduled = plan.slug === pendingPlanSlug();
				const isActive = plan.slug === activePlanSlug();
				const isDowngrade = Boolean(subscriptionPlan && plan.monthlyPriceIls < subscriptionPlan.monthlyPriceIls);
				$$renderer.push(`<article${attr_class("plan-option svelte-g11oql", void 0, {
					"plan-option--active": isActive,
					"plan-option--scheduled": isScheduled
				})}><div class="plan-option__head svelte-g11oql"><span class="plan-option__name svelte-g11oql">${escape_html(plan.nameHe)}</span> <span class="plan-option__price svelte-g11oql">${escape_html(plan.monthlyPriceIls)} ₪</span></div> <div class="plan-option__credits svelte-g11oql"><span>${escape_html(plan.vodCreditsPerMonth)} Macroflow</span> <span>${escape_html(plan.liveCreditsPerMonth)} לייב</span> <span>${escape_html(plan.oneOnOneCreditsPerMonth)} פרטי</span></div> `);
				if (Button) {
					$$renderer.push("<!--[-->");
					Button($$renderer, {
						class: "hb-button hb-button--paper hb-button--sm",
						type: "button",
						disabled: pending !== null || isActive || isScheduled,
						onclick: () => choosePlan(plan.slug),
						children: ($$renderer) => {
							if (isActive) {
								$$renderer.push("<!--[0-->");
								$$renderer.push(`המסלול הנוכחי`);
							} else if (isScheduled) {
								$$renderer.push("<!--[1-->");
								$$renderer.push(`מתוזמן לחידוש`);
							} else if (pending === plan.slug) {
								$$renderer.push("<!--[2-->");
								$$renderer.push(`מעדכנים...`);
							} else if (subscription && isDowngrade) {
								$$renderer.push("<!--[3-->");
								$$renderer.push(`שינוי בסוף החודש`);
							} else if (subscription) {
								$$renderer.push("<!--[4-->");
								$$renderer.push(`שדרוג עכשיו`);
							} else {
								$$renderer.push("<!--[-1-->");
								$$renderer.push(`הפעלת מסלול`);
							}
							$$renderer.push(`<!--]-->`);
						},
						$$slots: { default: true }
					});
					$$renderer.push("<!--]-->");
				} else {
					$$renderer.push("<!--[!-->");
					$$renderer.push("<!--]-->");
				}
				$$renderer.push(`</article>`);
			}
			$$renderer.push(`<!--]--></div>`);
		}
		$$renderer.push(`<!--]--> `);
		if (error) {
			$$renderer.push("<!--[0-->");
			Notice($$renderer, {
				tone: "danger",
				children: ($$renderer) => {
					$$renderer.push(`<!---->${escape_html(error)}`);
				},
				$$slots: { default: true }
			});
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> `);
		if (subscription) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="subscription-actions svelte-g11oql">`);
			if (pendingSubscriptionPlan) {
				$$renderer.push("<!--[0-->");
				if (Button) {
					$$renderer.push("<!--[-->");
					Button($$renderer, {
						class: "hb-button hb-button--paper hb-button--sm",
						type: "button",
						disabled: pending !== null,
						onclick: cancelPendingPlanChange,
						children: ($$renderer) => {
							$$renderer.push(`<!---->${escape_html(pending === "cancel-change" ? "מבטלים..." : "ביטול שינוי מתוזמן")}`);
						},
						$$slots: { default: true }
					});
					$$renderer.push("<!--]-->");
				} else {
					$$renderer.push("<!--[!-->");
					$$renderer.push("<!--]-->");
				}
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--> `);
			if (subscription.cancelAtPeriodEnd) {
				$$renderer.push("<!--[0-->");
				if (Button) {
					$$renderer.push("<!--[-->");
					Button($$renderer, {
						class: "hb-button hb-button--ink hb-button--sm",
						type: "button",
						disabled: pending !== null,
						onclick: resume,
						children: ($$renderer) => {
							$$renderer.push(`<!---->${escape_html(pending === "resume" ? "מחדשים..." : "להשאיר מנוי פעיל")}`);
						},
						$$slots: { default: true }
					});
					$$renderer.push("<!--]-->");
				} else {
					$$renderer.push("<!--[!-->");
					$$renderer.push("<!--]-->");
				}
			} else {
				$$renderer.push("<!--[-1-->");
				if (Button) {
					$$renderer.push("<!--[-->");
					Button($$renderer, {
						class: "hb-button hb-button--ghost hb-button--sm",
						type: "button",
						disabled: pending !== null,
						onclick: cancelAtPeriodEnd,
						children: ($$renderer) => {
							$$renderer.push(`<!---->${escape_html(pending === "cancel" ? "מבטלים..." : "ביטול בסוף התקופה")}`);
						},
						$$slots: { default: true }
					});
					$$renderer.push("<!--]-->");
				} else {
					$$renderer.push("<!--[!-->");
					$$renderer.push("<!--]-->");
				}
			}
			$$renderer.push(`<!--]--></div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></section>`);
	});
}
//#endregion
//#region src/lib/features/dashboard/components/Dashboard.svelte
function Dashboard($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { profile, liveAlert, role, appProfile, subscription, subscriptionPlan, pendingSubscriptionPlan, creditBucket } = $$props;
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
					SubscriptionManager($$renderer, {
						subscription: subscription ?? null,
						subscriptionPlan: subscriptionPlan ?? null,
						pendingSubscriptionPlan: pendingSubscriptionPlan ?? null,
						creditBucket: creditBucket ?? null
					});
					$$renderer.push(`<!----> `);
					ProfileSummary($$renderer, {
						isStaff: isStaff(),
						profile
					});
					$$renderer.push(`<!---->`);
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
			Button($$renderer, {
				class: "hb-button hb-button--ink hb-button--md",
				type: "button",
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
			Button($$renderer, {
				class: "hb-button hb-button--ink hb-button--md",
				type: "button",
				onclick: () => window.location.assign("/onboarding"),
				children: ($$renderer) => {
					$$renderer.push(`<!---->להמשיך בהתאמה`);
				},
				$$slots: { default: true }
			});
			$$renderer.push(`<!----> `);
			Button($$renderer, {
				class: "hb-button hb-button--paper hb-button--sm",
				type: "button",
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
				appProfile: query.data.appProfile,
				subscription: query.data.subscription,
				subscriptionPlan: query.data.subscriptionPlan,
				pendingSubscriptionPlan: query.data.pendingSubscriptionPlan,
				creditBucket: query.data.creditBucket
			});
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]-->`);
	});
}
//#endregion
export { AppShell as t };
