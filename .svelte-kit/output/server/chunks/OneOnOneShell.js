import { U as attr, W as escape_html, a as derived, o as ensure_array_like } from "./dev.js";
import { c as resource, n as getCachedRole, r as initAuth, s as api, t as authQuery } from "./session.svelte.js";
import { t as Notice } from "./Notice.js";
import { t as PageShell } from "./PageShell.js";
//#region src/lib/features/studio/components/OneOnOneShell.svelte
function OneOnOneShell($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const auth = initAuth();
		const role = derived(() => getCachedRole() ?? "customer");
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
			return await authQuery(api.customerOneOnOne.listAvailableSlots, range());
		});
		const mineResource = resource(() => auth.isAuthenticated && !isStaff(), async (enabled) => {
			if (!enabled) return [];
			return await authQuery(api.customerOneOnOne.listMine, {});
		});
		const requestsResource = resource(() => auth.isAuthenticated && isStaff(), async (enabled) => {
			if (!enabled) return [];
			return await authQuery(api.instructorOneOnOne.listRequests, {});
		});
		const availabilityResource = resource(() => auth.isAuthenticated && isStaff(), async (enabled) => {
			if (!enabled) return [];
			return await authQuery(api.instructorOneOnOne.listAvailability, {});
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
		let note = "";
		let weekday = 0;
		let startHour = 9;
		let endHour = 12;
		let slotMinutes = 50;
		let bufferMinutes = 10;
		PageShell($$renderer, {
			kicker: isStaff() ? "HomeBody Studio" : "HomeBody 1:1",
			title: isStaff() ? "ניהול 1:1 אישי" : "בקשת שיעור 1:1",
			description: isStaff() ? "קביעת זמינות ואישור בקשות לשיעורים אישיים." : "בחרי חלון פנוי, שלחי בקשה, והמדריכה תאשר ותפתח חדר לייב אישי.",
			loading: isStaff() ? requestsResource.loading : slotsResource.loading,
			error: null,
			children: ($$renderer) => {
				if (!auth.isAuthenticated) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<div class="state-card svelte-yn17ts"><p class="svelte-yn17ts">צריך להתחבר כדי להשתמש ב-1:1.</p> <a class="button-link svelte-yn17ts" href="/">כניסה</a></div>`);
				} else if (isStaff()) {
					$$renderer.push("<!--[1-->");
					$$renderer.push(`<div class="one-grid svelte-yn17ts"><section class="panel svelte-yn17ts"><h2 class="svelte-yn17ts">זמינות</h2> <div class="form-grid svelte-yn17ts"><label class="svelte-yn17ts"><span>יום</span> `);
					$$renderer.select({
						value: weekday,
						class: ""
					}, ($$renderer) => {
						$$renderer.option({ value: 0 }, ($$renderer) => {
							$$renderer.push(`ראשון`);
						});
						$$renderer.option({ value: 1 }, ($$renderer) => {
							$$renderer.push(`שני`);
						});
						$$renderer.option({ value: 2 }, ($$renderer) => {
							$$renderer.push(`שלישי`);
						});
						$$renderer.option({ value: 3 }, ($$renderer) => {
							$$renderer.push(`רביעי`);
						});
						$$renderer.option({ value: 4 }, ($$renderer) => {
							$$renderer.push(`חמישי`);
						});
						$$renderer.option({ value: 5 }, ($$renderer) => {
							$$renderer.push(`שישי`);
						});
						$$renderer.option({ value: 6 }, ($$renderer) => {
							$$renderer.push(`שבת`);
						});
					}, "svelte-yn17ts");
					$$renderer.push(`</label> <label class="svelte-yn17ts"><span>התחלה</span><input type="number" min="0" max="23"${attr("value", startHour)} class="svelte-yn17ts"/></label> <label class="svelte-yn17ts"><span>סיום</span><input type="number" min="1" max="24"${attr("value", endHour)} class="svelte-yn17ts"/></label> <label class="svelte-yn17ts"><span>משך</span><input type="number" min="20" max="120"${attr("value", slotMinutes)} class="svelte-yn17ts"/></label> <label class="svelte-yn17ts"><span>מרווח</span><input type="number" min="0" max="60"${attr("value", bufferMinutes)} class="svelte-yn17ts"/></label></div> <button class="primary-action svelte-yn17ts"${attr("disabled", actionId === "availability", true)}>שמירת זמינות</button> <div class="compact-list svelte-yn17ts"><!--[-->`);
					const each_array = ensure_array_like(availabilityResource.current ?? []);
					for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
						let rule = each_array[$$index];
						$$renderer.push(`<div class="compact-row svelte-yn17ts"><span>יום ${escape_html(rule.weekday)}</span> <span>${escape_html(Math.floor(rule.startMinute / 60))}:00-${escape_html(Math.floor(rule.endMinute / 60))}:00</span></div>`);
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
							$$renderer.push(`<article class="request-card svelte-yn17ts"><h3 class="svelte-yn17ts">${escape_html(dateFormatter.format(new Date(request.requestedStartsAt)))}</h3> <p class="svelte-yn17ts">${escape_html(request.note || "ללא הערה")}</p> <div class="actions svelte-yn17ts"><button${attr("disabled", actionId === request._id, true)} class="svelte-yn17ts">אישור</button> <button class="danger svelte-yn17ts"${attr("disabled", actionId === request._id, true)}>דחייה</button></div></article>`);
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
					$$renderer.push(`<!--]--> <label class="note-field svelte-yn17ts"><span>הערה למדריכה</span> <textarea maxlength="500" rows="3" placeholder="מטרות, מגבלות, או משהו שכדאי לדעת" class="svelte-yn17ts">`);
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
							$$renderer.push(`<article class="request-card svelte-yn17ts"><h3 class="svelte-yn17ts">${escape_html(dateFormatter.format(new Date(slot.startsAt)))}</h3> <p class="svelte-yn17ts">${escape_html(slot.availableCredits > 0 ? "יש קרדיט 1:1 זמין" : "אין קרדיט 1:1 זמין")}</p> <button${attr("disabled", slot.availableCredits <= 0 || actionId === String(slot.startsAt), true)} class="svelte-yn17ts">לשלוח בקשה</button></article>`);
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
								$$renderer.push(`<button class="danger svelte-yn17ts"${attr("disabled", actionId === request._id, true)}>ביטול</button>`);
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
	});
}
//#endregion
export { OneOnOneShell as t };
