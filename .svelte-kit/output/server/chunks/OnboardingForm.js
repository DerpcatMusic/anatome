import { H as attr, U as escape_html, a as derived, n as attr_class, o as ensure_array_like, u as html } from "./dev.js";
import { o as api } from "./session.svelte.js";
import { t as Button } from "./Button.js";
import { t as Notice } from "./Notice.js";
import { f as goalOptions, i as equipmentLabel, l as experienceOptions, o as equipmentOptions, s as experienceLabel, u as goalLabel } from "./labels.js";
//#region src/components/icons/EquipmentIcon.svelte
function EquipmentIcon($$renderer, $$props) {
	let { name } = $$props;
	const icons = {
		mat: `<rect x="4" y="14" width="56" height="28" rx="2" fill="none" stroke="currentColor" stroke-width="2.5"/><line x1="12" y1="22" x2="52" y2="22" stroke="currentColor" stroke-width="1.5" opacity="0.4"/><line x1="12" y1="28" x2="44" y2="28" stroke="currentColor" stroke-width="1.5" opacity="0.4"/><line x1="12" y1="34" x2="48" y2="34" stroke="currentColor" stroke-width="1.5" opacity="0.4"/>`,
		reformer: `<rect x="6" y="20" width="48" height="16" rx="2" fill="none" stroke="currentColor" stroke-width="2.5"/><rect x="14" y="16" width="20" height="8" rx="1" fill="none" stroke="currentColor" stroke-width="2"/><line x1="10" y1="36" x2="10" y2="42" stroke="currentColor" stroke-width="2.5"/><line x1="50" y1="36" x2="50" y2="42" stroke="currentColor" stroke-width="2.5"/><line x1="6" y1="42" x2="54" y2="42" stroke="currentColor" stroke-width="2"/>`,
		cadillac: `<rect x="8" y="12" width="44" height="36" rx="2" fill="none" stroke="currentColor" stroke-width="2.5"/><line x1="8" y1="20" x2="52" y2="20" stroke="currentColor" stroke-width="1.5" opacity="0.4"/><line x1="8" y1="40" x2="52" y2="40" stroke="currentColor" stroke-width="1.5" opacity="0.4"/><circle cx="18" cy="30" r="3" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="42" cy="30" r="3" fill="none" stroke="currentColor" stroke-width="2"/><line x1="8" y1="12" x2="8" y2="6" stroke="currentColor" stroke-width="2"/><line x1="52" y1="12" x2="52" y2="6" stroke="currentColor" stroke-width="2"/>`,
		chair: `<rect x="20" y="12" width="20" height="28" rx="2" fill="none" stroke="currentColor" stroke-width="2.5"/><line x1="20" y1="22" x2="40" y2="22" stroke="currentColor" stroke-width="1.5" opacity="0.4"/><line x1="24" y1="40" x2="24" y2="48" stroke="currentColor" stroke-width="2.5"/><line x1="36" y1="40" x2="36" y2="48" stroke="currentColor" stroke-width="2.5"/><line x1="22" y1="48" x2="38" y2="48" stroke="currentColor" stroke-width="2"/>`,
		barrel: `<path d="M16 12 C12 12, 8 24, 8 30 C8 36, 12 48, 16 48 L48 48 C52 48, 56 36, 56 30 C56 24, 52 12, 48 12 Z" fill="none" stroke="currentColor" stroke-width="2.5"/><line x1="12" y1="22" x2="52" y2="22" stroke="currentColor" stroke-width="1.5" opacity="0.4"/><line x1="10" y1="30" x2="54" y2="30" stroke="currentColor" stroke-width="1.5" opacity="0.4"/><line x1="12" y1="38" x2="52" y2="38" stroke="currentColor" stroke-width="1.5" opacity="0.4"/>`,
		magic_circle: `<circle cx="32" cy="32" r="22" fill="none" stroke="currentColor" stroke-width="2.5"/><circle cx="32" cy="32" r="14" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.5"/><circle cx="32" cy="10" r="3" fill="currentColor"/><circle cx="32" cy="54" r="3" fill="currentColor"/><circle cx="10" cy="32" r="3" fill="currentColor"/><circle cx="54" cy="32" r="3" fill="currentColor"/>`,
		small_ball: `<circle cx="32" cy="32" r="20" fill="none" stroke="currentColor" stroke-width="2.5"/><path d="M18 24 Q32 18, 46 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.4"/><path d="M16 34 Q32 28, 48 34" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.4"/>`,
		resistance_band: `<path d="M12 16 Q32 8, 52 16" fill="none" stroke="currentColor" stroke-width="2.5"/><path d="M12 32 Q32 24, 52 32" fill="none" stroke="currentColor" stroke-width="2.5"/><path d="M12 48 Q32 40, 52 48" fill="none" stroke="currentColor" stroke-width="2.5"/><line x1="12" y1="16" x2="12" y2="48" stroke="currentColor" stroke-width="2"/><line x1="52" y1="16" x2="52" y2="48" stroke="currentColor" stroke-width="2"/>`,
		light_weights: `<rect x="12" y="20" width="8" height="24" rx="2" fill="none" stroke="currentColor" stroke-width="2.5"/><rect x="40" y="20" width="8" height="24" rx="2" fill="none" stroke="currentColor" stroke-width="2.5"/><line x1="20" y1="30" x2="40" y2="30" stroke="currentColor" stroke-width="2.5"/><rect x="24" y="12" width="12" height="8" rx="1" fill="none" stroke="currentColor" stroke-width="2" opacity="0.5"/>`
	};
	const svgContent = derived(() => icons[name] ?? icons.mat);
	$$renderer.push(`<svg viewBox="0 0 64 64" width="48" height="48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${html(svgContent())}</svg>`);
}
//#endregion
//#region src/components/app/OnboardingForm.svelte
function OnboardingForm($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { redirectTo, initialProfile, mode = "onboarding" } = $$props;
		const steps = [
			{
				id: "experience",
				label: "ניסיון"
			},
			{
				id: "equipment",
				label: "ציוד"
			},
			{
				id: "goals",
				label: "מטרות"
			},
			{
				id: "notes",
				label: "סיום"
			}
		];
		let stepIndex = 0;
		let equipment = ["mat"];
		let goals = ["strength"];
		let experience = "some";
		let notes = "";
		let pending = false;
		let error = "";
		let submitted = false;
		const currentStep = derived(() => steps[stepIndex]);
		const isFirst = derived(() => stepIndex === 0);
		const isLast = derived(() => stepIndex === steps.length - 1);
		const stepTitle = derived(() => currentStep().id === "experience" ? "כמה ניסיון יש לך?" : currentStep().id === "equipment" ? "מה יש לך בבית?" : currentStep().id === "goals" ? "מה המטרות שלך?" : "משהו שחשוב שנדע?");
		const stepSubtitle = derived(() => currentStep().id === "experience" ? "אין תשובה לא נכונה. נתחיל ממשהו פשוט." : currentStep().id === "equipment" ? "נתאים שיעורים לפי מה שיש לך זמין." : currentStep().id === "goals" ? "אפשר לבחור כמה — זו לא התחייבות." : "אופציונלי. המדריכה תראה את זה לפני השיעור הראשון.");
		const canProceed = derived(() => currentStep().id === "equipment" ? equipment.length > 0 : currentStep().id === "goals" ? goals.length > 0 : true);
		function next() {
			if (!canProceed()) return;
			error = "";
			if (!isLast()) stepIndex++;
		}
		async function submit() {
			pending = true;
			error = "";
			try {
				await null.mutation(api.users.completeOnboarding, {
					equipment,
					experience,
					goals,
					notes
				});
				submitted = true;
				const target = redirectTo ?? "/dashboard";
				setTimeout(() => window.location.assign(target), 800);
			} catch (reason) {
				error = reason instanceof Error ? reason.message : "לא הצלחנו לשמור כרגע. נסי שוב.";
				pending = false;
			}
		}
		if (submitted) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="success svelte-5w81rd"><div class="success-mark svelte-5w81rd">✦</div> <h2 class="svelte-5w81rd">${escape_html(mode === "edit" ? "הפרופיל עודכן" : "ההתאמה נשמרה")}</h2> <p class="svelte-5w81rd">${escape_html(mode === "edit" ? "מעבירים אותך חזרה..." : "מעבירים אותך לאזור האישי...")}</p></div>`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<div class="onboarding svelte-5w81rd"><div class="panel panel--question svelte-5w81rd"><div class="panel__inner svelte-5w81rd">`);
			if (mode === "onboarding") {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<div class="progress-dots svelte-5w81rd"><!--[-->`);
				const each_array = ensure_array_like(steps);
				for (let i = 0, $$length = each_array.length; i < $$length; i++) {
					let step = each_array[i];
					$$renderer.push(`<button${attr_class("dot svelte-5w81rd", void 0, {
						"active": i === stepIndex,
						"done": i < stepIndex
					})}${attr("disabled", i > stepIndex, true)} type="button"${attr("aria-label", step.label)}></button>`);
				}
				$$renderer.push(`<!--]--></div>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--> <div class="question svelte-5w81rd"><span class="question__num svelte-5w81rd">${escape_html(String(stepIndex + 1).padStart(2, "0"))}</span> <h1 class="svelte-5w81rd">${escape_html(stepTitle())}</h1> <p class="svelte-5w81rd">${escape_html(stepSubtitle())}</p></div></div></div> <div class="panel panel--form svelte-5w81rd"><div class="panel__inner svelte-5w81rd"><div class="form-body svelte-5w81rd">`);
			if (currentStep().id === "experience") {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<div class="options svelte-5w81rd"><!--[-->`);
				const each_array_1 = ensure_array_like(experienceOptions);
				for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
					let [val, title] = each_array_1[$$index_1];
					const desc = val === "new" ? "מעולם לא עשיתי פילאטיס, או שזה נשמע לי כמו שפה זרה" : val === "some" ? "עשיתי כמה שיעורים פה ושם, אני מכירה את הבסיס" : "פילאטיס הוא חלק משגרת השבוע שלי";
					$$renderer.push(`<label${attr_class("option svelte-5w81rd", void 0, { "selected": experience === val })}><input type="radio"${attr("checked", experience === val, true)}${attr("value", val)} class="svelte-5w81rd"/> <span class="option__title svelte-5w81rd">${escape_html(title)}</span> <span class="option__desc svelte-5w81rd">${escape_html(desc)}</span></label>`);
				}
				$$renderer.push(`<!--]--></div>`);
			} else if (currentStep().id === "equipment") {
				$$renderer.push("<!--[1-->");
				$$renderer.push(`<div class="equip-grid svelte-5w81rd"><!--[-->`);
				const each_array_2 = ensure_array_like(equipmentOptions);
				for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
					let [value, label] = each_array_2[$$index_2];
					$$renderer.push(`<label${attr_class("equip-card svelte-5w81rd", void 0, { "selected": equipment.includes(value) })}><input type="checkbox"${attr("checked", equipment.includes(value), true)} class="svelte-5w81rd"/> `);
					EquipmentIcon($$renderer, { name: value });
					$$renderer.push(`<!----> <span class="svelte-5w81rd">${escape_html(label)}</span></label>`);
				}
				$$renderer.push(`<!--]--></div> `);
				if (equipment.length === 0) {
					$$renderer.push("<!--[0-->");
					Notice($$renderer, {
						tone: "neutral",
						children: ($$renderer) => {
							$$renderer.push(`<!---->בחרי לפחות פריט אחד כדי שנוכל להתאים שיעורים.`);
						},
						$$slots: { default: true }
					});
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]-->`);
			} else if (currentStep().id === "goals") {
				$$renderer.push("<!--[2-->");
				$$renderer.push(`<div class="chips svelte-5w81rd"><!--[-->`);
				const each_array_3 = ensure_array_like(goalOptions);
				for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
					let [value, label] = each_array_3[$$index_3];
					$$renderer.push(`<label${attr_class("chip svelte-5w81rd", void 0, { "selected": goals.includes(value) })}><input type="checkbox"${attr("checked", goals.includes(value), true)} class="svelte-5w81rd"/> <span class="svelte-5w81rd">${escape_html(label)}</span></label>`);
				}
				$$renderer.push(`<!--]--></div> `);
				if (goals.length === 0) {
					$$renderer.push("<!--[0-->");
					Notice($$renderer, {
						tone: "neutral",
						children: ($$renderer) => {
							$$renderer.push(`<!---->בחרי לפחות מטרה אחת כדי שנוכל להתאים שיעורים.`);
						},
						$$slots: { default: true }
					});
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]-->`);
			} else if (currentStep().id === "notes") {
				$$renderer.push("<!--[3-->");
				$$renderer.push(`<label class="notes-wrap svelte-5w81rd"><textarea maxlength="600" placeholder="למשל: כאב גב תחתון, אחרי ניתוח קיסרי, מגבלות ברך..." rows="5" class="svelte-5w81rd">`);
				const $$body = escape_html(notes);
				if ($$body) $$renderer.push(`${$$body}`);
				$$renderer.push(`</textarea> <span class="char-count svelte-5w81rd">${escape_html(0)}/600</span></label> <div class="summary-box svelte-5w81rd"><p class="summary-box__title svelte-5w81rd">סיכום</p> <div class="summary-box__row svelte-5w81rd"><span class="svelte-5w81rd">ניסיון</span><span class="svelte-5w81rd">${escape_html(experienceLabel(experience))}</span></div> <div class="summary-box__row svelte-5w81rd"><span class="svelte-5w81rd">ציוד</span><span class="svelte-5w81rd">${escape_html(equipment.map(equipmentLabel).join(", "))}</span></div> <div class="summary-box__row svelte-5w81rd"><span class="svelte-5w81rd">מטרות</span><span class="svelte-5w81rd">${escape_html(goals.map(goalLabel).join(", "))}</span></div></div>`);
			} else $$renderer.push("<!--[-1-->");
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
			$$renderer.push(`<!--]--></div> <div class="form-footer svelte-5w81rd">`);
			if (!isFirst()) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<button class="back-btn svelte-5w81rd" type="button"${attr("disabled", pending, true)}>← חזרה</button>`);
			} else {
				$$renderer.push("<!--[-1-->");
				$$renderer.push(`<span class="svelte-5w81rd"></span>`);
			}
			$$renderer.push(`<!--]--> `);
			if (isLast()) {
				$$renderer.push("<!--[0-->");
				Button($$renderer, {
					type: "button",
					tone: "ink",
					disabled: pending || !canProceed(),
					onclick: submit,
					children: ($$renderer) => {
						$$renderer.push(`<!---->${escape_html(pending ? "שומרים..." : mode === "edit" ? "שמור שינויים ✦" : "לשמור ולהתחיל ✦")}`);
					},
					$$slots: { default: true }
				});
			} else {
				$$renderer.push("<!--[-1-->");
				Button($$renderer, {
					type: "button",
					tone: "ink",
					disabled: !canProceed(),
					onclick: next,
					children: ($$renderer) => {
						$$renderer.push(`<!---->המשך →`);
					},
					$$slots: { default: true }
				});
			}
			$$renderer.push(`<!--]--></div></div></div></div>`);
		}
		$$renderer.push(`<!--]-->`);
	});
}
//#endregion
export { OnboardingForm as t };
