import { c as ensure_array_like, et as attr, nt as escape_html, o as derived } from "./dev.js";
import { _ as useQuery, c as TextareaAutosize, g as useConvexClient, r as initAuth, s as api, t as authQuery, u as resource } from "./session.svelte.js";
import { t as Button_1 } from "./Button.js";
import { t as Select_1 } from "./Select.js";
import { t as Notice } from "./Notice.js";
import { t as PageShell } from "./PageShell.js";
//#region src/lib/features/studio/components/OneOnOneShell.svelte
function OneOnOneShell($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const auth = initAuth();
		const profileQuery = useQuery(api.profiles.viewer.get, () => auth.isAuthenticated ? {} : "skip");
		const role = derived(() => profileQuery.data?.role ?? "customer");
		const isStaff = derived(() => role() === "instructor" || role() === "admin");
		const range = derived(() => {
			const from = Date.now();
			return {
				from,
				to: from + 336 * 60 * 60 * 1e3
			};
		});
		const slotsResource = resource(() => auth.isAuthenticated && !isStaff(), async (enabled) => {
			if (!enabled) return [];
			return await authQuery(api.oneOnOne.customer.listAvailableSlots, range());
		});
		const mineResource = resource(() => auth.isAuthenticated && !isStaff(), async (enabled) => {
			if (!enabled) return [];
			return await authQuery(api.oneOnOne.customer.listMine, {});
		});
		const requestsResource = resource(() => auth.isAuthenticated && isStaff(), async (enabled) => {
			if (!enabled) return [];
			return await authQuery(api.oneOnOne.instructor.listRequests, {});
		});
		const availabilityResource = resource(() => auth.isAuthenticated && isStaff(), async (enabled) => {
			if (!enabled) return [];
			return await authQuery(api.oneOnOne.instructor.listAvailability, {});
		});
		const dateFormatter = new Intl.DateTimeFormat("he-IL", {
			weekday: "short",
			day: "numeric",
			month: "short",
			hour: "2-digit",
			minute: "2-digit",
			timeZone: "Asia/Jerusalem"
		});
		let actionId = null;
		let actionError = "";
		let note = "";
		let noteEl = null;
		new TextareaAutosize({
			element: () => noteEl ?? void 0,
			input: () => note
		});
		let weekday = 0;
		let startHour = 9;
		let endHour = 12;
		let slotMinutes = 50;
		let bufferMinutes = 10;
		const weekdayOptions = [
			{
				value: 0,
				label: "ראשון"
			},
			{
				value: 1,
				label: "שני"
			},
			{
				value: 2,
				label: "שלישי"
			},
			{
				value: 3,
				label: "רביעי"
			},
			{
				value: 4,
				label: "חמישי"
			},
			{
				value: 5,
				label: "שישי"
			},
			{
				value: 6,
				label: "שבת"
			}
		];
		const client = useConvexClient();
		async function requestSlot(slot) {
			actionId = String(slot.startsAt);
			actionError = "";
			try {
				await client.mutation(api.oneOnOne.customer.requestSlot, {
					...slot,
					note
				});
				note = "";
				await Promise.all([slotsResource.refetch(), mineResource.refetch()]);
			} catch (reason) {
				actionError = reason instanceof Error ? reason.message : "לא הצלחנו לשלוח בקשה.";
			} finally {
				actionId = null;
			}
		}
		async function cancelRequest(requestId) {
			actionId = requestId;
			actionError = "";
			try {
				await client.mutation(api.oneOnOne.customer.cancelRequest, { requestId });
				await mineResource.refetch();
			} catch (reason) {
				actionError = reason instanceof Error ? reason.message : "לא הצלחנו לבטל.";
			} finally {
				actionId = null;
			}
		}
		async function approveRequest(requestId) {
			actionId = requestId;
			actionError = "";
			try {
				await client.mutation(api.oneOnOne.instructor.approveRequest, { requestId });
				await requestsResource.refetch();
			} catch (reason) {
				actionError = reason instanceof Error ? reason.message : "לא הצלחנו לאשר.";
			} finally {
				actionId = null;
			}
		}
		async function rejectRequest(requestId) {
			actionId = requestId;
			actionError = "";
			try {
				await client.mutation(api.oneOnOne.instructor.rejectRequest, { requestId });
				await requestsResource.refetch();
			} catch (reason) {
				actionError = reason instanceof Error ? reason.message : "לא הצלחנו לדחות.";
			} finally {
				actionId = null;
			}
		}
		async function saveAvailability() {
			actionId = "availability";
			actionError = "";
			try {
				await client.mutation(api.oneOnOne.instructor.setAvailabilityRule, {
					weekday,
					startMinute: startHour * 60,
					endMinute: endHour * 60,
					slotMinutes,
					bufferMinutes,
					isActive: true
				});
				await availabilityResource.refetch();
			} catch (reason) {
				actionError = reason instanceof Error ? reason.message : "לא הצלחנו לשמור זמינות.";
			} finally {
				actionId = null;
			}
		}
		function formatHour(value) {
			return `${String(value).padStart(2, "0")}:00`;
		}
		let $$settled = true;
		let $$inner_renderer;
		function $$render_inner($$renderer) {
			PageShell($$renderer, {
				kicker: isStaff() ? "HomeBody Studio" : "HomeBody 1:1",
				title: isStaff() ? "ניהול 1:1 אישי" : "בקשת שיעור 1:1",
				description: isStaff() ? "קביעת זמינות ואישור בקשות לשיעורים אישיים." : "בחרי חלון פנוי, שלחי בקשה, והמדריכה תאשר ותפתח חדר לייב אישי.",
				loading: isStaff() ? requestsResource.loading : slotsResource.loading,
				error: actionError || null,
				children: ($$renderer) => {
					if (!auth.isAuthenticated) {
						$$renderer.push("<!--[0-->");
						$$renderer.push(`<div class="state-card svelte-yn17ts"><p class="svelte-yn17ts">צריך להתחבר כדי להשתמש ב-1:1.</p> <a class="button-link svelte-yn17ts" href="/">כניסה</a></div>`);
					} else if (isStaff()) {
						$$renderer.push("<!--[1-->");
						$$renderer.push(`<div class="one-grid svelte-yn17ts"><section class="panel svelte-yn17ts"><h2 class="svelte-yn17ts">זמינות</h2> <div class="form-grid svelte-yn17ts">`);
						Select_1($$renderer, {
							label: "יום",
							options: weekdayOptions,
							compact: true,
							get value() {
								return weekday;
							},
							set value($$value) {
								weekday = $$value;
								$$settled = false;
							}
						});
						$$renderer.push(`<!----> <label class="svelte-yn17ts"><span>התחלה</span><input type="number" min="0" max="23"${attr("value", startHour)} class="svelte-yn17ts"/></label> <label class="svelte-yn17ts"><span>סיום</span><input type="number" min="1" max="24"${attr("value", endHour)} class="svelte-yn17ts"/></label> <label class="svelte-yn17ts"><span>משך</span><input type="number" min="20" max="120"${attr("value", slotMinutes)} class="svelte-yn17ts"/></label> <label class="svelte-yn17ts"><span>מרווח</span><input type="number" min="0" max="60"${attr("value", bufferMinutes)} class="svelte-yn17ts"/></label></div> `);
						Button_1($$renderer, {
							tone: "ink",
							onclick: saveAvailability,
							disabled: actionId === "availability",
							children: ($$renderer) => {
								$$renderer.push(`<!---->שמירת זמינות`);
							},
							$$slots: { default: true }
						});
						$$renderer.push(`<!----> <div class="compact-list svelte-yn17ts"><!--[-->`);
						const each_array = ensure_array_like(availabilityResource.current ?? []);
						for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
							let rule = each_array[$$index];
							$$renderer.push(`<div class="compact-row svelte-yn17ts"><span>יום ${escape_html(rule.weekday)}</span> <span>${escape_html(formatHour(Math.floor(rule.startMinute / 60)))}-${escape_html(formatHour(Math.floor(rule.endMinute / 60)))}</span></div>`);
						}
						$$renderer.push(`<!--]--></div></section> <section class="panel svelte-yn17ts"><h2 class="svelte-yn17ts">בקשות ממתינות</h2> `);
						if ((requestsResource.current ?? []).length === 0) {
							$$renderer.push("<!--[0-->");
							$$renderer.push(`<p class="muted svelte-yn17ts">אין בקשות ממתינות.</p>`);
						} else {
							$$renderer.push("<!--[-1-->");
							$$renderer.push(`<div class="card-list svelte-yn17ts"><!--[-->`);
							const each_array_1 = ensure_array_like(requestsResource.current ?? []);
							for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
								let request = each_array_1[$$index_1];
								$$renderer.push(`<article class="request-card svelte-yn17ts"><h3 class="svelte-yn17ts">${escape_html(dateFormatter.format(new Date(request.requestedStartsAt)))}</h3> <p class="svelte-yn17ts">${escape_html(request.note || "ללא הערה")}</p> <div class="actions svelte-yn17ts">`);
								Button_1($$renderer, {
									tone: "paper",
									onclick: () => approveRequest(request._id),
									disabled: actionId === request._id,
									children: ($$renderer) => {
										$$renderer.push(`<!---->אישור`);
									},
									$$slots: { default: true }
								});
								$$renderer.push(`<!----> `);
								Button_1($$renderer, {
									tone: "danger",
									onclick: () => rejectRequest(request._id),
									disabled: actionId === request._id,
									children: ($$renderer) => {
										$$renderer.push(`<!---->דחייה`);
									},
									$$slots: { default: true }
								});
								$$renderer.push(`<!----></div></article>`);
							}
							$$renderer.push(`<!--]--></div>`);
						}
						$$renderer.push(`<!--]--></section></div>`);
					} else {
						$$renderer.push("<!--[-1-->");
						if (slotsResource.error) {
							$$renderer.push("<!--[0-->");
							Notice($$renderer, {
								tone: "danger",
								children: ($$renderer) => {
									$$renderer.push(`<!---->${escape_html(slotsResource.error.message)}`);
								},
								$$slots: { default: true }
							});
						} else $$renderer.push("<!--[-1-->");
						$$renderer.push(`<!--]--> <label class="note-field svelte-yn17ts"><span>הערה למדריכה</span> <textarea maxlength="500" placeholder="מטרות, מגבלות, או משהו שכדאי לדעת" class="svelte-yn17ts">`);
						const $$body = escape_html(note);
						if ($$body) $$renderer.push(`${$$body}`);
						$$renderer.push(`</textarea></label> <div class="one-grid svelte-yn17ts"><section class="panel svelte-yn17ts"><h2 class="svelte-yn17ts">חלונות פנויים</h2> `);
						if ((slotsResource.current ?? []).length === 0) {
							$$renderer.push("<!--[0-->");
							$$renderer.push(`<p class="muted svelte-yn17ts">אין חלונות פנויים בשבועיים הקרובים.</p>`);
						} else {
							$$renderer.push("<!--[-1-->");
							$$renderer.push(`<div class="card-list svelte-yn17ts"><!--[-->`);
							const each_array_2 = ensure_array_like(slotsResource.current ?? []);
							for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
								let slot = each_array_2[$$index_2];
								$$renderer.push(`<article class="request-card svelte-yn17ts"><h3 class="svelte-yn17ts">${escape_html(dateFormatter.format(new Date(slot.startsAt)))}</h3> <p class="svelte-yn17ts">${escape_html(slot.availableCredits > 0 ? "יש קרדיט 1:1 זמין" : "אין קרדיט 1:1 זמין")}</p> `);
								Button_1($$renderer, {
									tone: "ink",
									onclick: () => requestSlot(slot),
									disabled: slot.availableCredits <= 0 || actionId === String(slot.startsAt),
									children: ($$renderer) => {
										$$renderer.push(`<!---->לשלוח בקשה`);
									},
									$$slots: { default: true }
								});
								$$renderer.push(`<!----></article>`);
							}
							$$renderer.push(`<!--]--></div>`);
						}
						$$renderer.push(`<!--]--></section> <section class="panel svelte-yn17ts"><h2 class="svelte-yn17ts">הבקשות שלי</h2> `);
						if ((mineResource.current ?? []).length === 0) {
							$$renderer.push("<!--[0-->");
							$$renderer.push(`<p class="muted svelte-yn17ts">אין עדיין בקשות.</p>`);
						} else {
							$$renderer.push("<!--[-1-->");
							$$renderer.push(`<div class="card-list svelte-yn17ts"><!--[-->`);
							const each_array_3 = ensure_array_like(mineResource.current ?? []);
							for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
								let request = each_array_3[$$index_3];
								$$renderer.push(`<article class="request-card svelte-yn17ts"><h3 class="svelte-yn17ts">${escape_html(dateFormatter.format(new Date(request.requestedStartsAt)))}</h3> <p class="svelte-yn17ts">${escape_html(request.status)}</p> `);
								if (request.status === "pending") {
									$$renderer.push("<!--[0-->");
									Button_1($$renderer, {
										tone: "danger",
										onclick: () => cancelRequest(request._id),
										disabled: actionId === request._id,
										children: ($$renderer) => {
											$$renderer.push(`<!---->ביטול`);
										},
										$$slots: { default: true }
									});
								} else $$renderer.push("<!--[-1-->");
								$$renderer.push(`<!--]--></article>`);
							}
							$$renderer.push(`<!--]--></div>`);
						}
						$$renderer.push(`<!--]--></section></div>`);
					}
					$$renderer.push(`<!--]-->`);
				},
				$$slots: { default: true }
			});
		}
		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);
		$$renderer.subsume($$inner_renderer);
	});
}
//#endregion
export { OneOnOneShell as t };
