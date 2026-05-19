import { U as attr, W as escape_html, a as derived, i as bind_props, n as attr_class, o as ensure_array_like, r as attr_style, u as html } from "./dev.js";
import { n as routePath } from "./context.js";
import { n as useConvexClient } from "./client.svelte.js";
import { s as api } from "./session.svelte.js";
import { t as Notice } from "./Notice.js";
import { t as useI18n } from "./runes.svelte.js";
import { t as Button } from "./Button.js";
import { d as goalLabel, i as equipmentLabel, l as experienceOptions, o as equipmentOptions, p as goalOptions, s as experienceLabel } from "./labels.js";
//#region src/lib/features/app/components/AppSkeleton.svelte
function AppSkeleton($$renderer, $$props) {
	let { title = true, lines = 2, width = "60%" } = $$props;
	$$renderer.push(`<div class="loading svelte-4wdaoi">`);
	if (title) {
		$$renderer.push("<!--[0-->");
		$$renderer.push(`<div class="skeleton skeleton--title svelte-4wdaoi"></div>`);
	} else $$renderer.push("<!--[-1-->");
	$$renderer.push(`<!--]--> <!--[-->`);
	const each_array = ensure_array_like(Array.from({ length: lines }));
	for (let i = 0, $$length = each_array.length; i < $$length; i++) {
		each_array[i];
		$$renderer.push(`<div class="skeleton skeleton--text svelte-4wdaoi"${attr_style(i === lines - 1 ? `width: ${width};` : void 0)}></div>`);
	}
	$$renderer.push(`<!--]--></div>`);
}
//#endregion
//#region src/lib/features/app/components/AppLocked.svelte
function AppLocked($$renderer, $$props) {
	let { kicker = "HomeBody", title, subtitle, actions } = $$props;
	$$renderer.push(`<div class="locked svelte-17fcklh"><p class="kicker svelte-17fcklh">${escape_html(kicker)}</p> <h1 class="svelte-17fcklh">${escape_html(title)}</h1> <p class="svelte-17fcklh">${escape_html(subtitle)}</p> `);
	if (actions) {
		$$renderer.push("<!--[0-->");
		$$renderer.push(`<div class="locked__actions svelte-17fcklh">`);
		actions($$renderer);
		$$renderer.push(`<!----></div>`);
	} else $$renderer.push("<!--[-1-->");
	$$renderer.push(`<!--]--></div>`);
}
//#endregion
//#region src/lib/features/onboarding/components/steps/ExperienceStep.svelte
function ExperienceStep($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { experience = void 0 } = $$props;
		const { t } = useI18n();
		$$renderer.push(`<div class="options svelte-1n930o"><!--[-->`);
		const each_array = ensure_array_like(experienceOptions);
		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let [val, title] = each_array[$$index];
			const desc = val === "new" ? t.onboarding.experience.newDesc() : val === "some" ? t.onboarding.experience.someDesc() : t.onboarding.experience.steadyDesc();
			$$renderer.push(`<label${attr_class("option svelte-1n930o", void 0, { "selected": experience === val })}><input type="radio"${attr("checked", experience === val, true)}${attr("value", val)} class="svelte-1n930o"/> <span class="option__title svelte-1n930o">${escape_html(title)}</span> <span class="option__desc svelte-1n930o">${escape_html(desc)}</span></label>`);
		}
		$$renderer.push(`<!--]--></div>`);
		bind_props($$props, { experience });
	});
}
//#endregion
//#region src/lib/components/icons/EquipmentIcon.svelte
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
//#region src/lib/features/onboarding/components/steps/EquipmentStep.svelte
function EquipmentStep($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { equipment = void 0 } = $$props;
		const { t } = useI18n();
		$$renderer.push(`<div class="equip-grid svelte-7wc14w"><!--[-->`);
		const each_array = ensure_array_like(equipmentOptions);
		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let [value, label] = each_array[$$index];
			$$renderer.push(`<label${attr_class("equip-card svelte-7wc14w", void 0, { "selected": equipment.includes(value) })}><input type="checkbox"${attr("checked", equipment.includes(value), true)} class="svelte-7wc14w"/> `);
			EquipmentIcon($$renderer, { name: value });
			$$renderer.push(`<!----> <span class="svelte-7wc14w">${escape_html(label)}</span></label>`);
		}
		$$renderer.push(`<!--]--></div> `);
		if (equipment.length === 0) {
			$$renderer.push("<!--[0-->");
			Notice($$renderer, {
				tone: "neutral",
				children: ($$renderer) => {
					$$renderer.push(`<!---->${escape_html(t.onboarding.equipment.emptyWarning())}`);
				},
				$$slots: { default: true }
			});
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]-->`);
		bind_props($$props, { equipment });
	});
}
//#endregion
//#region src/lib/features/onboarding/components/steps/GoalsStep.svelte
function GoalsStep($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { goals = void 0 } = $$props;
		const { t } = useI18n();
		$$renderer.push(`<div class="chips svelte-vptto8"><!--[-->`);
		const each_array = ensure_array_like(goalOptions);
		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let [value, label] = each_array[$$index];
			$$renderer.push(`<label${attr_class("chip svelte-vptto8", void 0, { "selected": goals.includes(value) })}><input type="checkbox"${attr("checked", goals.includes(value), true)} class="svelte-vptto8"/> <span class="svelte-vptto8">${escape_html(label)}</span></label>`);
		}
		$$renderer.push(`<!--]--></div> `);
		if (goals.length === 0) {
			$$renderer.push("<!--[0-->");
			Notice($$renderer, {
				tone: "neutral",
				children: ($$renderer) => {
					$$renderer.push(`<!---->${escape_html(t.onboarding.goals.emptyWarning())}`);
				},
				$$slots: { default: true }
			});
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]-->`);
		bind_props($$props, { goals });
	});
}
//#endregion
//#region src/lib/features/onboarding/components/steps/NotesStep.svelte
function NotesStep($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { notes = void 0 } = $$props;
		const { t } = useI18n();
		$$renderer.push(`<label class="notes-wrap svelte-1566ibt"><textarea maxlength="600"${attr("placeholder", t.onboarding.notes.placeholder())} rows="5" class="svelte-1566ibt">`);
		const $$body = escape_html(notes);
		if ($$body) $$renderer.push(`${$$body}`);
		$$renderer.push(`</textarea> <span class="char-count svelte-1566ibt">${escape_html(t.misc.charCount({ count: notes.length }))}</span></label>`);
		bind_props($$props, { notes });
	});
}
//#endregion
//#region src/lib/features/onboarding/components/steps/SummaryStep.svelte
function SummaryStep($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { experience, equipment, goals } = $$props;
		const { t } = useI18n();
		$$renderer.push(`<div class="summary-box svelte-1h1kiqw"><p class="summary-box__title svelte-1h1kiqw">${escape_html(t.onboarding.summary.boxTitle())}</p> <div class="summary-box__row svelte-1h1kiqw"><span class="svelte-1h1kiqw">${escape_html(t.onboarding.summary.experience())}</span><span class="svelte-1h1kiqw">${escape_html(experienceLabel(experience))}</span></div> <div class="summary-box__row svelte-1h1kiqw"><span class="svelte-1h1kiqw">${escape_html(t.onboarding.summary.equipment())}</span><span class="svelte-1h1kiqw">${escape_html(equipment.map(equipmentLabel).join(", "))}</span></div> <div class="summary-box__row svelte-1h1kiqw"><span class="svelte-1h1kiqw">${escape_html(t.onboarding.summary.goals())}</span><span class="svelte-1h1kiqw">${escape_html(goals.map(goalLabel).join(", "))}</span></div></div>`);
	});
}
//#endregion
//#region src/lib/features/onboarding/components/OnboardingForm.svelte
function OnboardingForm($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { redirectTo, initialProfile, mode = "onboarding" } = $$props;
		const { t } = useI18n();
		const steps = [
			{ id: "experience" },
			{ id: "equipment" },
			{ id: "goals" },
			{ id: "notes" }
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
		function getStepLabel(id) {
			return id === "experience" ? t.onboarding.stepLabels.experience() : id === "equipment" ? t.onboarding.stepLabels.equipment() : id === "goals" ? t.onboarding.stepLabels.goals() : t.onboarding.stepLabels.notes();
		}
		const stepTitle = derived(() => currentStep().id === "experience" ? t.onboarding.experience.title() : currentStep().id === "equipment" ? t.onboarding.equipment.title() : currentStep().id === "goals" ? t.onboarding.goals.title() : t.onboarding.notes.title());
		const stepSubtitle = derived(() => currentStep().id === "experience" ? t.onboarding.experience.subtitle() : currentStep().id === "equipment" ? t.onboarding.equipment.subtitle() : currentStep().id === "goals" ? t.onboarding.goals.subtitle() : t.onboarding.notes.subtitle());
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
				await useConvexClient().mutation(api.users.completeOnboarding, {
					equipment,
					experience,
					goals,
					notes
				});
				submitted = true;
				const target = redirectTo ?? routePath("dashboard");
				setTimeout(() => window.location.assign(target), 800);
			} catch (reason) {
				error = reason instanceof Error ? reason.message : t.onboarding.saveError();
				pending = false;
			}
		}
		let $$settled = true;
		let $$inner_renderer;
		function $$render_inner($$renderer) {
			if (submitted) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<div class="success svelte-j1vmuv"><div class="success-mark svelte-j1vmuv">✦</div> <h2 class="svelte-j1vmuv">${escape_html(mode === "edit" ? t.onboarding.success.editTitle() : t.onboarding.success.title())}</h2> <p class="svelte-j1vmuv">${escape_html(mode === "edit" ? t.onboarding.success.editSubtitle() : t.onboarding.success.subtitle())}</p></div>`);
			} else {
				$$renderer.push("<!--[-1-->");
				$$renderer.push(`<div class="onboarding svelte-j1vmuv"><div class="panel panel--question svelte-j1vmuv"><div class="panel__inner svelte-j1vmuv">`);
				if (mode === "onboarding") {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<div class="progress-dots svelte-j1vmuv"><!--[-->`);
					const each_array = ensure_array_like(steps);
					for (let i = 0, $$length = each_array.length; i < $$length; i++) {
						let step = each_array[i];
						$$renderer.push(`<button${attr_class("dot svelte-j1vmuv", void 0, {
							"active": i === stepIndex,
							"done": i < stepIndex
						})}${attr("disabled", i > stepIndex, true)} type="button"${attr("aria-label", getStepLabel(step.id))}></button>`);
					}
					$$renderer.push(`<!--]--></div>`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--> <div class="question svelte-j1vmuv"><span class="question__num svelte-j1vmuv">${escape_html(String(stepIndex + 1).padStart(2, "0"))}</span> <h1 class="svelte-j1vmuv">${escape_html(stepTitle())}</h1> <p class="svelte-j1vmuv">${escape_html(stepSubtitle())}</p></div></div></div> <div class="panel panel--form svelte-j1vmuv"><div class="panel__inner svelte-j1vmuv"><div class="form-body svelte-j1vmuv">`);
				if (currentStep().id === "experience") {
					$$renderer.push("<!--[0-->");
					ExperienceStep($$renderer, {
						get experience() {
							return experience;
						},
						set experience($$value) {
							experience = $$value;
							$$settled = false;
						}
					});
				} else if (currentStep().id === "equipment") {
					$$renderer.push("<!--[1-->");
					EquipmentStep($$renderer, {
						get equipment() {
							return equipment;
						},
						set equipment($$value) {
							equipment = $$value;
							$$settled = false;
						}
					});
				} else if (currentStep().id === "goals") {
					$$renderer.push("<!--[2-->");
					GoalsStep($$renderer, {
						get goals() {
							return goals;
						},
						set goals($$value) {
							goals = $$value;
							$$settled = false;
						}
					});
				} else if (currentStep().id === "notes") {
					$$renderer.push("<!--[3-->");
					NotesStep($$renderer, {
						get notes() {
							return notes;
						},
						set notes($$value) {
							notes = $$value;
							$$settled = false;
						}
					});
					$$renderer.push(`<!----> `);
					SummaryStep($$renderer, {
						experience,
						equipment,
						goals
					});
					$$renderer.push(`<!---->`);
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
				$$renderer.push(`<!--]--></div> <div class="form-footer svelte-j1vmuv">`);
				if (!isFirst()) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<button class="back-btn svelte-j1vmuv" type="button"${attr("disabled", pending, true)}>${escape_html(t.onboarding.nav.back())}</button>`);
				} else {
					$$renderer.push("<!--[-1-->");
					$$renderer.push(`<span class="svelte-j1vmuv"></span>`);
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
							$$renderer.push(`<!---->${escape_html(pending ? t.onboarding.nav.submitPending() : mode === "edit" ? t.onboarding.nav.submitEdit() : t.onboarding.nav.submit())}`);
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
							$$renderer.push(`<!---->${escape_html(t.onboarding.nav.next())}`);
						},
						$$slots: { default: true }
					});
				}
				$$renderer.push(`<!--]--></div></div></div></div>`);
			}
			$$renderer.push(`<!--]-->`);
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
export { AppLocked as n, AppSkeleton as r, OnboardingForm as t };
