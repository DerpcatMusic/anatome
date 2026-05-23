import { Q as attr, a as bind_props, c as ensure_array_like, et as escape_html, o as derived, p as stringify, r as attr_style } from "./dev.js";
import { c as TextareaAutosize, g as useConvexClient, s as api } from "./session.svelte.js";
import { t as Button } from "./button.js";
import { i as Checkbox, n as Radio_group_item, r as Radio_group, t as EquipmentIcon } from "./EquipmentIcon.js";
import { t as Notice } from "./Notice.js";
import { t as useI18n } from "./runes.svelte.js";
import { d as goalLabel, i as equipmentLabel, l as experienceOptions, o as equipmentOptions, p as goalOptions, s as experienceLabel } from "./labels.js";
//#region src/lib/features/app/components/AppSkeleton.svelte
function AppSkeleton($$renderer, $$props) {
	let { title = true, lines = 2, width = "60%" } = $$props;
	$$renderer.push(`<div class="loading grid gap-3 svelte-4wdaoi">`);
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
		const options = derived(() => experienceOptions.map(([val, title]) => ({
			value: val,
			label: title,
			description: val === "new" ? t.onboarding.experience.newDesc() : val === "some" ? t.onboarding.experience.someDesc() : t.onboarding.experience.steadyDesc()
		})));
		let $$settled = true;
		let $$inner_renderer;
		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="experience-options svelte-1n930o">`);
			if (Radio_group) {
				$$renderer.push("<!--[-->");
				Radio_group($$renderer, {
					orientation: "vertical",
					get value() {
						return experience;
					},
					set value($$value) {
						experience = $$value;
						$$settled = false;
					},
					children: ($$renderer) => {
						$$renderer.push(`<!--[-->`);
						const each_array = ensure_array_like(options());
						for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
							let option = each_array[$$index];
							{
								function children($$renderer, { checked }) {
									$$renderer.push(`<span class="hb-choice__title">${escape_html(option.label)}</span> <span class="hb-choice__description">${escape_html(option.description)}</span>`);
								}
								if (Radio_group_item) {
									$$renderer.push("<!--[-->");
									Radio_group_item($$renderer, {
										value: option.value,
										class: "hb-choice experience-choice",
										children,
										$$slots: { default: true }
									});
									$$renderer.push("<!--]-->");
								} else {
									$$renderer.push("<!--[!-->");
									$$renderer.push("<!--]-->");
								}
							}
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
			$$renderer.push(`</div>`);
		}
		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);
		$$renderer.subsume($$inner_renderer);
		bind_props($$props, { experience });
	});
}
//#endregion
//#region src/lib/features/onboarding/components/steps/EquipmentStep.svelte
function EquipmentStep($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { equipment = void 0 } = $$props;
		const { t } = useI18n();
		function toggle(list, value) {
			return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
		}
		$$renderer.push(`<div class="equip-grid svelte-7wc14w"><!--[-->`);
		const each_array = ensure_array_like(equipmentOptions);
		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let [value, label] = each_array[$$index];
			if (Checkbox) {
				$$renderer.push("<!--[-->");
				Checkbox($$renderer, {
					class: "hb-choice equip-choice",
					checked: equipment.includes(value),
					onchange: () => equipment = toggle(equipment, value),
					children: ($$renderer) => {
						EquipmentIcon($$renderer, { name: value });
						$$renderer.push(`<!----> <span>${escape_html(label)}</span>`);
					},
					$$slots: { default: true }
				});
				$$renderer.push("<!--]-->");
			} else {
				$$renderer.push("<!--[!-->");
				$$renderer.push("<!--]-->");
			}
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
		function toggle(list, value) {
			return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
		}
		$$renderer.push(`<div class="goals-wrap svelte-vptto8"><!--[-->`);
		const each_array = ensure_array_like(goalOptions);
		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let [value, label] = each_array[$$index];
			if (Checkbox) {
				$$renderer.push("<!--[-->");
				Checkbox($$renderer, {
					class: "hb-choice goal-choice",
					checked: goals.includes(value),
					onchange: () => goals = toggle(goals, value),
					children: ($$renderer) => {
						$$renderer.push(`<span>${escape_html(label)}</span>`);
					},
					$$slots: { default: true }
				});
				$$renderer.push("<!--]-->");
			} else {
				$$renderer.push("<!--[!-->");
				$$renderer.push("<!--]-->");
			}
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
		new TextareaAutosize({
			element: () => void 0,
			input: () => notes
		});
		$$renderer.push(`<label class="notes-wrap svelte-1566ibt"><textarea maxlength="600"${attr("placeholder", t.onboarding.notes.placeholder())} class="svelte-1566ibt">`);
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
		const client = useConvexClient();
		const steps = [
			{
				id: "experience",
				title: t.onboarding.experience.title(),
				subtitle: t.onboarding.experience.subtitle()
			},
			{
				id: "equipment-goals",
				title: t.onboarding.equipment.title(),
				subtitle: t.onboarding.equipment.subtitle()
			},
			{
				id: "notes-summary",
				title: t.onboarding.notes.title(),
				subtitle: t.onboarding.notes.subtitle()
			}
		];
		let stepIndex = 0;
		let equipment = ["mat"];
		let goals = ["strength"];
		let experience = "some";
		let notes = "";
		let healthInfoConsent = false;
		let healthDeclarationAccepted = false;
		let pending = false;
		let error = "";
		let submitted = false;
		const currentStep = derived(() => steps[stepIndex]);
		const isFirst = derived(() => stepIndex === 0);
		const isLast = derived(() => stepIndex === steps.length - 1);
		const progressPercent = derived(() => (stepIndex + 1) / steps.length * 100);
		const canProceed = derived(() => currentStep().id === "equipment-goals" ? equipment.length > 0 && goals.length > 0 : currentStep().id === "notes-summary" ? healthDeclarationAccepted : true);
		function next() {
			if (!canProceed()) return;
			error = "";
			if (!isLast()) stepIndex++;
		}
		function back() {
			error = "";
			if (!isFirst()) stepIndex--;
		}
		async function submit() {
			pending = true;
			error = "";
			try {
				await client.mutation(api.users.onboarding.complete, {
					equipment,
					experience,
					goals,
					notes,
					healthInfoConsent,
					healthDeclarationAccepted
				});
				submitted = true;
				const target = redirectTo ?? "/u/dashboard";
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
				$$renderer.push(`<div class="success"><div class="success-mark">✦</div> <h2>${escape_html(mode === "edit" ? t.onboarding.success.editTitle() : t.onboarding.success.title())}</h2> <p>${escape_html(mode === "edit" ? t.onboarding.success.editSubtitle() : t.onboarding.success.subtitle())}</p></div>`);
			} else {
				$$renderer.push("<!--[-1-->");
				$$renderer.push(`<div class="onboarding"><div class="panel panel--question"><div class="panel__inner"><div class="question"><h1>${escape_html(currentStep().title)}</h1> <p>${escape_html(currentStep().subtitle)}</p></div></div></div> <div class="panel panel--form"><div class="panel__inner">`);
				if (mode === "onboarding") {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<div class="progress-bar" role="progressbar"${attr("aria-valuenow", stepIndex + 1)}${attr("aria-valuemin", 1)}${attr("aria-valuemax", steps.length)}${attr("aria-label", t.onboarding.step())}><div class="progress-bar__fill"${attr_style(`width: ${stringify(progressPercent())}%`)}></div></div> <div class="progress-label">${escape_html(t.onboarding.step())} ${escape_html(stepIndex + 1)} ${escape_html(t.onboarding.stepCount())}</div>`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--> <div class="form-body">`);
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
				} else if (currentStep().id === "equipment-goals") {
					$$renderer.push("<!--[1-->");
					$$renderer.push(`<div class="combo-section"><p class="combo-section__label">${escape_html(t.onboarding.equipment.title())}</p> `);
					EquipmentStep($$renderer, {
						get equipment() {
							return equipment;
						},
						set equipment($$value) {
							equipment = $$value;
							$$settled = false;
						}
					});
					$$renderer.push(`<!----></div> <div class="combo-section"><p class="combo-section__label">${escape_html(t.onboarding.goals.title())}</p> `);
					GoalsStep($$renderer, {
						get goals() {
							return goals;
						},
						set goals($$value) {
							goals = $$value;
							$$settled = false;
						}
					});
					$$renderer.push(`<!----></div>`);
				} else if (currentStep().id === "notes-summary") {
					$$renderer.push("<!--[2-->");
					NotesStep($$renderer, {
						get notes() {
							return notes;
						},
						set notes($$value) {
							notes = $$value;
							$$settled = false;
						}
					});
					$$renderer.push(`<!----> <div class="privacy-consent"${attr("data-active", notes.trim().length > 0)}><p>השדה הזה אופציונלי ועשוי לכלול מידע רגיש כמו כאב, פציעה, הריון, ניתוח או מגבלה רפואית.
                המידע נשמר רק כדי להתאים לך תרגול ולייבים, ואינו מחליף ייעוץ רפואי.</p> <label class="privacy-consent__check"><input type="checkbox"${attr("checked", healthInfoConsent, true)}${attr("disabled", notes.trim().length === 0, true)}/> <span>אני מסכימ/ה לשמירת המידע שמסרתי לצורך התאמת פעילות.</span></label></div> <div class="health-declaration"><p>הצהרת בריאות: הפעילות אינה טיפול רפואי או פיזיותרפיה. אם יש כאב חד, פציעה פעילה,
                הריון, אחרי לידה, ניתוח, בעיית לב, לחץ דם, סחרחורת או מגבלה רפואית — יש להתייעץ
                עם גורם רפואי מוסמך לפני התחלה ולעצור מיד אם יש החמרה או תחושה חריגה.</p> <label class="privacy-consent__check"><input type="checkbox"${attr("checked", healthDeclarationAccepted, true)}/> <span>קראתי ואני מאשר/ת שהפעילות מתאימה לי או שהתייעצתי עם גורם רפואי כנדרש.</span></label></div> `);
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
				$$renderer.push(`<!--]--></div> <div class="form-footer">`);
				if (!isFirst()) {
					$$renderer.push("<!--[0-->");
					if (Button) {
						$$renderer.push("<!--[-->");
						Button($$renderer, {
							class: "hb-button hb-button--paper",
							type: "button",
							onclick: back,
							disabled: pending,
							children: ($$renderer) => {
								$$renderer.push(`<!---->${escape_html(t.onboarding.nav.back())}`);
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
					$$renderer.push(`<span></span>`);
				}
				$$renderer.push(`<!--]--> `);
				if (isLast()) {
					$$renderer.push("<!--[0-->");
					if (Button) {
						$$renderer.push("<!--[-->");
						Button($$renderer, {
							class: "hb-button hb-button--ink",
							type: "button",
							disabled: pending || !canProceed(),
							onclick: submit,
							children: ($$renderer) => {
								$$renderer.push(`<!---->${escape_html(pending ? t.onboarding.nav.submitPending() : mode === "edit" ? t.onboarding.nav.submitEdit() : t.onboarding.nav.submit())}`);
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
							class: "hb-button hb-button--ink",
							type: "button",
							disabled: !canProceed(),
							onclick: next,
							children: ($$renderer) => {
								$$renderer.push(`<!---->${escape_html(t.onboarding.nav.next())}`);
							},
							$$slots: { default: true }
						});
						$$renderer.push("<!--]-->");
					} else {
						$$renderer.push("<!--[!-->");
						$$renderer.push("<!--]-->");
					}
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
