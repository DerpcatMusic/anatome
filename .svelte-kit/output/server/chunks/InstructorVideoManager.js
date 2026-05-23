import { Q as attr, a as bind_props, c as ensure_array_like, et as escape_html, f as spread_props, i as attributes, n as attr_class, o as derived, p as stringify, r as attr_style, u as props_id } from "./dev.js";
import { _ as useQuery, c as TextareaAutosize, g as useConvexClient, r as initAuth, s as api, t as authQuery, u as resource } from "./session.svelte.js";
import { R as createBitsAttrs, X as mergeProps, Y as attachRef, c as createId, l as noop, nt as boxWith } from "./arrays.js";
import { c as MenuItemState, l as MenuMenuState, o as DropdownMenuTriggerState, p as Portal, s as MenuContentState, u as MenuRootState } from "./scroll-lock.js";
import { i as DialogCloseState, n as Dialog, r as Dialog_overlay, t as Dialog_content } from "./dialog-content.js";
import { a as Dialog_title, i as Scroll_area, n as Scroll_area_scrollbar, r as Scroll_area_viewport, t as Scroll_area_thumb } from "./scroll-area-thumb.js";
import { t as Button } from "./button.js";
import { n as Radio_group_item, r as Radio_group } from "./EquipmentIcon.js";
import { a as getFloatingContentCSSVars, i as Floating_layer, n as Popper_layer, r as Floating_layer_anchor, t as Popper_layer_force_mount } from "./popper-layer-force-mount.js";
import { t as Notice } from "./Notice.js";
import { t as PageShell } from "./PageShell.js";
import { i as equipmentLabel, r as durationLabel } from "./labels.js";
import { t as EquipmentPicker } from "./EquipmentPicker.js";
//#region node_modules/bits-ui/dist/bits/aspect-ratio/aspect-ratio.svelte.js
var aspectRatioAttrs = createBitsAttrs({
	component: "aspect-ratio",
	parts: ["root"]
});
var AspectRatioRootState = class AspectRatioRootState {
	static create(opts) {
		return new AspectRatioRootState(opts);
	}
	opts;
	attachment;
	constructor(opts) {
		this.opts = opts;
		this.attachment = attachRef(this.opts.ref);
	}
	#props = derived(() => ({
		id: this.opts.id.current,
		style: {
			position: "absolute",
			top: 0,
			right: 0,
			bottom: 0,
			left: 0
		},
		[aspectRatioAttrs.root]: "",
		...this.attachment
	}));
	get props() {
		return this.#props();
	}
	set props($$value) {
		return this.#props($$value);
	}
};
//#endregion
//#region node_modules/bits-ui/dist/bits/aspect-ratio/components/aspect-ratio.svelte
function Aspect_ratio($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = props_id($$renderer);
		let { ref = null, id = createId(uid), ratio = 1, children, child, $$slots, $$events, ...restProps } = $$props;
		const rootState = AspectRatioRootState.create({
			id: boxWith(() => id),
			ref: boxWith(() => ref, (v) => ref = v),
			ratio: boxWith(() => ratio)
		});
		const mergedProps = derived(() => mergeProps(restProps, rootState.props));
		$$renderer.push(`<div${attr_style("", {
			position: "relative",
			width: "100%",
			"padding-bottom": `${stringify(ratio ? 100 / ratio : 0)}%`
		})}>`);
		if (child) {
			$$renderer.push("<!--[0-->");
			child($$renderer, { props: mergedProps() });
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<div${attributes({ ...mergedProps() })}>`);
			children?.($$renderer);
			$$renderer.push(`<!----></div>`);
		}
		$$renderer.push(`<!--]--></div>`);
		bind_props($$props, { ref });
	});
}
//#endregion
//#region node_modules/bits-ui/dist/bits/menu/components/menu-item.svelte
function Menu_item($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = props_id($$renderer);
		let { child, children, ref = null, id = createId(uid), disabled = false, onSelect = noop, closeOnSelect = true, $$slots, $$events, ...restProps } = $$props;
		const itemState = MenuItemState.create({
			id: boxWith(() => id),
			disabled: boxWith(() => disabled),
			onSelect: boxWith(() => onSelect),
			ref: boxWith(() => ref, (v) => ref = v),
			closeOnSelect: boxWith(() => closeOnSelect)
		});
		const mergedProps = derived(() => mergeProps(restProps, itemState.props));
		if (child) {
			$$renderer.push("<!--[0-->");
			child($$renderer, { props: mergedProps() });
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<div${attributes({ ...mergedProps() })}>`);
			children?.($$renderer);
			$$renderer.push(`<!----></div>`);
		}
		$$renderer.push(`<!--]-->`);
		bind_props($$props, { ref });
	});
}
//#endregion
//#region node_modules/bits-ui/dist/bits/dialog/components/dialog-close.svelte
function Dialog_close($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = props_id($$renderer);
		let { children, child, id = createId(uid), ref = null, disabled = false, $$slots, $$events, ...restProps } = $$props;
		const closeState = DialogCloseState.create({
			variant: boxWith(() => "close"),
			id: boxWith(() => id),
			ref: boxWith(() => ref, (v) => ref = v),
			disabled: boxWith(() => Boolean(disabled))
		});
		const mergedProps = derived(() => mergeProps(restProps, closeState.props));
		if (child) {
			$$renderer.push("<!--[0-->");
			child($$renderer, { props: mergedProps() });
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<button${attributes({ ...mergedProps() })}>`);
			children?.($$renderer);
			$$renderer.push(`<!----></button>`);
		}
		$$renderer.push(`<!--]-->`);
		bind_props($$props, { ref });
	});
}
//#endregion
//#region node_modules/bits-ui/dist/bits/menu/components/menu.svelte
function Menu($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { open = false, dir = "ltr", onOpenChange = noop, onOpenChangeComplete = noop, _internal_variant: variant = "dropdown-menu", _internal_should_skip_exit_animation: shouldSkipExitAnimation = void 0, children } = $$props;
		const root = MenuRootState.create({
			variant: boxWith(() => variant),
			dir: boxWith(() => dir),
			onClose: () => {
				open = false;
				onOpenChange(false);
			},
			shouldSkipExitAnimation: () => shouldSkipExitAnimation?.() ?? false
		});
		MenuMenuState.create({
			open: boxWith(() => open, (v) => {
				open = v;
				onOpenChange(v);
			}),
			onOpenChangeComplete: boxWith(() => onOpenChangeComplete)
		}, root);
		Floating_layer($$renderer, {
			children: ($$renderer) => {
				children?.($$renderer);
				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});
		bind_props($$props, { open });
	});
}
//#endregion
//#region node_modules/bits-ui/dist/bits/dropdown-menu/components/dropdown-menu-content.svelte
function Dropdown_menu_content($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = props_id($$renderer);
		let { id = createId(uid), child, children, ref = null, loop = true, onInteractOutside = noop, onEscapeKeydown = noop, onCloseAutoFocus = noop, forceMount = false, trapFocus = false, style, $$slots, $$events, ...restProps } = $$props;
		const contentState = MenuContentState.create({
			id: boxWith(() => id),
			loop: boxWith(() => loop),
			ref: boxWith(() => ref, (v) => ref = v),
			onCloseAutoFocus: boxWith(() => onCloseAutoFocus)
		});
		const mergedProps = derived(() => mergeProps(restProps, contentState.props));
		function handleInteractOutside(e) {
			contentState.handleInteractOutside(e);
			if (e.defaultPrevented) return;
			onInteractOutside(e);
			if (e.defaultPrevented) return;
			if (e.target && e.target instanceof Element) {
				const subContentSelector = `[${contentState.parentMenu.root.getBitsAttr("sub-content")}]`;
				if (e.target.closest(subContentSelector)) return;
			}
			contentState.parentMenu.onClose();
		}
		function handleEscapeKeydown(e) {
			onEscapeKeydown(e);
			if (e.defaultPrevented) return;
			contentState.parentMenu.onClose();
		}
		if (forceMount) {
			$$renderer.push("<!--[0-->");
			{
				function popper($$renderer, { props, wrapperProps }) {
					const finalProps = mergeProps(props, { style: getFloatingContentCSSVars("dropdown-menu") }, { style });
					if (child) {
						$$renderer.push("<!--[0-->");
						child($$renderer, {
							props: finalProps,
							wrapperProps,
							...contentState.snippetProps
						});
						$$renderer.push(`<!---->`);
					} else {
						$$renderer.push("<!--[-1-->");
						$$renderer.push(`<div${attributes({ ...wrapperProps })}><div${attributes({ ...finalProps })}>`);
						children?.($$renderer);
						$$renderer.push(`<!----></div></div>`);
					}
					$$renderer.push(`<!--]-->`);
				}
				Popper_layer_force_mount($$renderer, spread_props([
					mergedProps(),
					contentState.popperProps,
					{
						ref: contentState.opts.ref,
						enabled: contentState.parentMenu.opts.open.current,
						onInteractOutside: handleInteractOutside,
						onEscapeKeydown: handleEscapeKeydown,
						trapFocus,
						loop,
						forceMount: true,
						id,
						shouldRender: contentState.shouldRender,
						popper,
						$$slots: { popper: true }
					}
				]));
			}
		} else if (!forceMount) {
			$$renderer.push("<!--[1-->");
			{
				function popper($$renderer, { props, wrapperProps }) {
					const finalProps = mergeProps(props, { style: getFloatingContentCSSVars("dropdown-menu") }, { style });
					if (child) {
						$$renderer.push("<!--[0-->");
						child($$renderer, {
							props: finalProps,
							wrapperProps,
							...contentState.snippetProps
						});
						$$renderer.push(`<!---->`);
					} else {
						$$renderer.push("<!--[-1-->");
						$$renderer.push(`<div${attributes({ ...wrapperProps })}><div${attributes({ ...finalProps })}>`);
						children?.($$renderer);
						$$renderer.push(`<!----></div></div>`);
					}
					$$renderer.push(`<!--]-->`);
				}
				Popper_layer($$renderer, spread_props([
					mergedProps(),
					contentState.popperProps,
					{
						ref: contentState.opts.ref,
						open: contentState.parentMenu.opts.open.current,
						onInteractOutside: handleInteractOutside,
						onEscapeKeydown: handleEscapeKeydown,
						trapFocus,
						loop,
						forceMount: false,
						id,
						shouldRender: contentState.shouldRender,
						popper,
						$$slots: { popper: true }
					}
				]));
			}
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]-->`);
		bind_props($$props, { ref });
	});
}
//#endregion
//#region node_modules/bits-ui/dist/bits/menu/components/menu-trigger.svelte
function Menu_trigger($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = props_id($$renderer);
		let { id = createId(uid), ref = null, child, children, disabled = false, type = "button", $$slots, $$events, ...restProps } = $$props;
		const triggerState = DropdownMenuTriggerState.create({
			id: boxWith(() => id),
			disabled: boxWith(() => disabled ?? false),
			ref: boxWith(() => ref, (v) => ref = v)
		});
		const mergedProps = derived(() => mergeProps(restProps, triggerState.props, { type }));
		Floating_layer_anchor($$renderer, {
			id,
			ref: triggerState.opts.ref,
			children: ($$renderer) => {
				if (child) {
					$$renderer.push("<!--[0-->");
					child($$renderer, { props: mergedProps() });
					$$renderer.push(`<!---->`);
				} else {
					$$renderer.push("<!--[-1-->");
					$$renderer.push(`<button${attributes({ ...mergedProps() })}>`);
					children?.($$renderer);
					$$renderer.push(`<!----></button>`);
				}
				$$renderer.push(`<!--]-->`);
			},
			$$slots: { default: true }
		});
		bind_props($$props, { ref });
	});
}
//#endregion
//#region node_modules/bits-ui/dist/bits/progress/progress.svelte.js
var progressAttrs = createBitsAttrs({
	component: "progress",
	parts: ["root"]
});
var ProgressRootState = class ProgressRootState {
	static create(opts) {
		return new ProgressRootState(opts);
	}
	opts;
	attachment;
	constructor(opts) {
		this.opts = opts;
		this.attachment = attachRef(this.opts.ref);
	}
	#props = derived(() => ({
		role: "progressbar",
		value: this.opts.value.current,
		"aria-valuemin": this.opts.min.current,
		"aria-valuemax": this.opts.max.current,
		"aria-valuenow": this.opts.value.current === null ? void 0 : this.opts.value.current,
		"data-value": this.opts.value.current === null ? void 0 : this.opts.value.current,
		"data-state": getProgressDataState(this.opts.value.current, this.opts.max.current),
		"data-max": this.opts.max.current,
		"data-min": this.opts.min.current,
		"data-indeterminate": this.opts.value.current === null ? "" : void 0,
		[progressAttrs.root]: "",
		...this.attachment
	}));
	get props() {
		return this.#props();
	}
	set props($$value) {
		return this.#props($$value);
	}
};
function getProgressDataState(value, max) {
	if (value === null) return "indeterminate";
	return value === max ? "loaded" : "loading";
}
//#endregion
//#region node_modules/bits-ui/dist/bits/progress/components/progress.svelte
function Progress($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = props_id($$renderer);
		let { child, children, value = 0, max = 100, min = 0, id = createId(uid), ref = null, $$slots, $$events, ...restProps } = $$props;
		const rootState = ProgressRootState.create({
			value: boxWith(() => value),
			max: boxWith(() => max),
			min: boxWith(() => min),
			id: boxWith(() => id),
			ref: boxWith(() => ref, (v) => ref = v)
		});
		const mergedProps = derived(() => mergeProps(restProps, rootState.props));
		if (child) {
			$$renderer.push("<!--[0-->");
			child($$renderer, { props: mergedProps() });
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<div${attributes({ ...mergedProps() })}>`);
			children?.($$renderer);
			$$renderer.push(`<!----></div>`);
		}
		$$renderer.push(`<!--]-->`);
		bind_props($$props, { ref });
	});
}
//#endregion
//#region src/lib/features/studio/components/VideoUploadForm.svelte
function VideoUploadForm($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { categories = [], uploadStatus = "idle", uploadProgress = 0, uploadError = "", creatingCategory = false, categoryError = "", onCreateCategory, onSubmit, onCancel } = $$props;
		let showAdvanced = false;
		let title = "";
		let description = "";
		new TextareaAutosize({
			element: () => void 0,
			input: () => description
		});
		let requiredEquipment = ["mat"];
		let accessKind = "macroflow";
		let selectedCategoryIds = [];
		let newCategoryName = "";
		let videoFile = null;
		let isDragOver = false;
		const accessOptions = [{
			value: "macroflow",
			label: "Macroflow",
			description: "רכישה חד-פעמית וגישה קבועה ללקוחה."
		}, {
			value: "microflow",
			label: "Microflow",
			description: "פתוח למנויות פעילות בלבד, בלי צריכת קרדיט."
		}];
		const canSubmit = derived(() => Boolean(videoFile) && title.trim().length >= 3 && selectedCategoryIds.length > 0 && uploadStatus !== "uploading" && uploadStatus !== "processing");
		async function handleAddCategory() {
			const name = newCategoryName.trim();
			if (!name) return;
			await onCreateCategory(name);
			newCategoryName = "";
		}
		let $$settled = true;
		let $$inner_renderer;
		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="video-upload-form">`);
			if (uploadStatus === "error" || categoryError) {
				$$renderer.push("<!--[0-->");
				Notice($$renderer, {
					tone: "danger",
					children: ($$renderer) => {
						$$renderer.push(`<!---->${escape_html(uploadError || categoryError)}`);
					},
					$$slots: { default: true }
				});
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--> <form><div${attr_class("file-drop", void 0, {
				"has-file": Boolean(videoFile),
				"drag-over": isDragOver
			})} role="region" aria-label="אזור גרירת קובץ וידאו">`);
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<label class="drop-label"><input type="file" accept="video/*"${attr("disabled", uploadStatus === "uploading", true)}/> <span class="material-symbols-rounded drop-icon">video_library</span> <span class="drop-text"><strong>גררי קובץ וידאו לכאן</strong> <span class="drop-hint">או לחצי לבחירה מהמחשב · עד 2GB</span></span></label>`);
			$$renderer.push(`<!--]--></div> `);
			if (uploadStatus === "uploading") {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<div class="progress-container"><div class="progress-meta"><span>מעלה קובץ...</span> <span>${escape_html(uploadProgress)}%</span></div> `);
				if (Progress) {
					$$renderer.push("<!--[-->");
					Progress($$renderer, {
						class: "hb-progress-track",
						value: uploadProgress,
						max: 100,
						children: ($$renderer) => {
							$$renderer.push(`<div class="hb-progress-fill"${attr_style("", { width: `${stringify(uploadProgress)}%` })}></div>`);
						},
						$$slots: { default: true }
					});
					$$renderer.push("<!--]-->");
				} else {
					$$renderer.push("<!--[!-->");
					$$renderer.push("<!--]-->");
				}
				$$renderer.push(`</div>`);
			} else if (uploadStatus === "processing") {
				$$renderer.push("<!--[1-->");
				$$renderer.push(`<div class="processing-bar"><span class="material-symbols-rounded spinner">sync</span> <span>הקובץ הועלה בהצלחה. מעבדים בשרתי Mux...</span></div>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--> <div class="details-section"><label class="field"><span class="field__label">כותרת השיעור</span> <input${attr("value", title)} required="" maxlength="120" placeholder="למשל: יסודות הרפורמר למתחילות"${attr("disabled", uploadStatus === "uploading", true)}/></label> <label class="field"><span class="field__label">תיאור קצר</span> <textarea maxlength="500" placeholder="ספרי למתאמנות מה נעשה בשיעור זה..."${attr("disabled", uploadStatus === "uploading", true)}>`);
			const $$body = escape_html(description);
			if ($$body) $$renderer.push(`${$$body}`);
			$$renderer.push(`</textarea></label> <div class="form-field-group"><div class="form-field-label"><span class="material-symbols-rounded">key</span> מודל גישה</div> `);
			if (Radio_group) {
				$$renderer.push("<!--[-->");
				Radio_group($$renderer, {
					orientation: "horizontal",
					class: "hb-choice-grid",
					get value() {
						return accessKind;
					},
					set value($$value) {
						accessKind = $$value;
						$$settled = false;
					},
					children: ($$renderer) => {
						$$renderer.push(`<!--[-->`);
						const each_array = ensure_array_like(accessOptions);
						for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
							let option = each_array[$$index];
							if (Radio_group_item) {
								$$renderer.push("<!--[-->");
								Radio_group_item($$renderer, {
									class: "hb-choice",
									value: option.value,
									children: ($$renderer) => {
										$$renderer.push(`<span class="hb-choice__title">${escape_html(option.label)}</span> `);
										if (option.description) {
											$$renderer.push("<!--[0-->");
											$$renderer.push(`<span class="hb-choice__description">${escape_html(option.description)}</span>`);
										} else $$renderer.push("<!--[-1-->");
										$$renderer.push(`<!--]-->`);
									},
									$$slots: { default: true }
								});
								$$renderer.push("<!--]-->");
							} else {
								$$renderer.push("<!--[!-->");
								$$renderer.push("<!--]-->");
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
			$$renderer.push(`</div> <div class="form-field-group"><div class="form-field-label"><span class="material-symbols-rounded">folder_open</span> קטגוריות <span class="count-badge">${escape_html(selectedCategoryIds.length)}</span></div> `);
			if (categories.length === 0) {
				$$renderer.push("<!--[0-->");
				Notice($$renderer, {
					tone: "neutral",
					children: ($$renderer) => {
						$$renderer.push(`<!---->אין קטגוריות זמינות. צרי קטגוריה ראשונה למטה.`);
					},
					$$slots: { default: true }
				});
			} else {
				$$renderer.push("<!--[-1-->");
				$$renderer.push(`<div class="category-grid"><!--[-->`);
				const each_array_1 = ensure_array_like(categories);
				for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
					let category = each_array_1[$$index_1];
					$$renderer.push(`<button${attr_class("category-token", void 0, { "selected": selectedCategoryIds.includes(category._id) })} type="button"${attr("disabled", uploadStatus === "uploading", true)}>${escape_html(category.name)}</button>`);
				}
				$$renderer.push(`<!--]--></div>`);
			}
			$$renderer.push(`<!--]--> <div class="new-category-input-row"><input type="text"${attr("value", newCategoryName)} placeholder="שם קטגוריה חדשה..."${attr("disabled", creatingCategory || uploadStatus === "uploading", true)}/> `);
			if (Button) {
				$$renderer.push("<!--[-->");
				Button($$renderer, {
					class: "hb-button hb-button--paper",
					type: "button",
					onclick: handleAddCategory,
					disabled: creatingCategory || !newCategoryName.trim() || uploadStatus === "uploading",
					children: ($$renderer) => {
						$$renderer.push(`<!---->הוסף`);
					},
					$$slots: { default: true }
				});
				$$renderer.push("<!--]-->");
			} else {
				$$renderer.push("<!--[!-->");
				$$renderer.push("<!--]-->");
			}
			$$renderer.push(`</div></div> <div class="form-field-group"><div class="form-field-label"><span class="material-symbols-rounded">fitness_center</span> ציוד נדרש</div> `);
			EquipmentPicker($$renderer, {
				disabled: uploadStatus === "uploading",
				get selected() {
					return requiredEquipment;
				},
				set selected($$value) {
					requiredEquipment = $$value;
					$$settled = false;
				}
			});
			$$renderer.push(`<!----></div> <div class="advanced-collapsible-wrapper"><button type="button" class="advanced-toggle"><span>הגדרות קידוד מתקדמות (Mux)</span> <span${attr_class("material-symbols-rounded arrow-icon", void 0, { "rotated": showAdvanced })}>expand_more</span></button> `);
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--></div></div> <div class="submit-action-row">`);
			if (onCancel) {
				$$renderer.push("<!--[0-->");
				if (Button) {
					$$renderer.push("<!--[-->");
					Button($$renderer, {
						class: "hb-button hb-button--paper",
						type: "button",
						onclick: onCancel,
						disabled: uploadStatus === "uploading",
						children: ($$renderer) => {
							$$renderer.push(`<!---->ביטול`);
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
			if (Button) {
				$$renderer.push("<!--[-->");
				Button($$renderer, {
					class: "hb-button hb-button--ink upload-submit-button",
					type: "submit",
					disabled: !canSubmit() || uploadStatus === "uploading",
					children: ($$renderer) => {
						if (uploadStatus === "uploading") {
							$$renderer.push("<!--[0-->");
							$$renderer.push(`מעלה...`);
						} else if (uploadStatus === "processing") {
							$$renderer.push("<!--[1-->");
							$$renderer.push(`מעבד...`);
						} else {
							$$renderer.push("<!--[-1-->");
							$$renderer.push(`<span class="material-symbols-rounded">cloud_upload</span> העלאה לספריה`);
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
			$$renderer.push(`</div></form></div>`);
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
//#region src/lib/features/studio/components/VideoCard.svelte
function VideoCard($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { video, actionId = null, onEdit, onPublish, onDelete } = $$props;
		const isPending = derived(() => actionId === video._id);
		function getStatusLabel(status) {
			if (status === "published") return "פעיל";
			if (status === "draft") return "טיוטה";
			return "בארכיון";
		}
		$$renderer.push(`<article${attr_class("video-card", void 0, {
			"is-draft": video.status === "draft",
			"is-pending": isPending()
		})}><div class="thumbnail-wrapper">`);
		if (Aspect_ratio) {
			$$renderer.push("<!--[-->");
			Aspect_ratio($$renderer, {
				class: "hb-aspect-ratio",
				ratio: 16 / 9,
				children: ($$renderer) => {
					if (video.thumbnailUrl) {
						$$renderer.push("<!--[0-->");
						$$renderer.push(`<img${attr("src", video.thumbnailUrl)}${attr("alt", video.title)} loading="lazy" class="thumbnail-img"/>`);
					} else {
						$$renderer.push("<!--[-1-->");
						$$renderer.push(`<div class="thumbnail-placeholder"><span class="material-symbols-rounded placeholder-icon">movie</span> <span class="placeholder-duration">${escape_html(durationLabel(video.durationSeconds))}</span></div>`);
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
		$$renderer.push(` <span${attr_class("status-badge", void 0, {
			"published": video.status === "published",
			"draft": video.status === "draft"
		})}>${escape_html(getStatusLabel(video.status))}</span></div> <div class="card-body"><div class="card-header"><h3 class="video-title">${escape_html(video.title)}</h3> `);
		if (Menu) {
			$$renderer.push("<!--[-->");
			Menu($$renderer, {
				children: ($$renderer) => {
					if (Menu_trigger) {
						$$renderer.push("<!--[-->");
						Menu_trigger($$renderer, {
							class: "hb-dropdown-trigger",
							children: ($$renderer) => {
								$$renderer.push(`<button class="menu-trigger-button" type="button" aria-label="תפריט פעולות"><span class="material-symbols-rounded">more_vert</span></button>`);
							},
							$$slots: { default: true }
						});
						$$renderer.push("<!--]-->");
					} else {
						$$renderer.push("<!--[!-->");
						$$renderer.push("<!--]-->");
					}
					$$renderer.push(` `);
					if (Portal) {
						$$renderer.push("<!--[-->");
						Portal($$renderer, {
							children: ($$renderer) => {
								if (Dropdown_menu_content) {
									$$renderer.push("<!--[-->");
									Dropdown_menu_content($$renderer, {
										class: "hb-dropdown-content",
										children: ($$renderer) => {
											if (Menu_item) {
												$$renderer.push("<!--[-->");
												Menu_item($$renderer, {
													class: "hb-dropdown-item",
													onclick: () => onEdit(video),
													children: ($$renderer) => {
														$$renderer.push(`<!---->ערוך פרטים`);
													},
													$$slots: { default: true }
												});
												$$renderer.push("<!--]-->");
											} else {
												$$renderer.push("<!--[!-->");
												$$renderer.push("<!--]-->");
											}
											$$renderer.push(` `);
											if (Menu_item) {
												$$renderer.push("<!--[-->");
												Menu_item($$renderer, {
													class: "hb-dropdown-item",
													onclick: () => onPublish(video._id),
													disabled: isPending() || video.status === "published",
													children: ($$renderer) => {
														$$renderer.push(`<!---->פרסם שיעור`);
													},
													$$slots: { default: true }
												});
												$$renderer.push("<!--]-->");
											} else {
												$$renderer.push("<!--[!-->");
												$$renderer.push("<!--]-->");
											}
											$$renderer.push(` `);
											if (Menu_item) {
												$$renderer.push("<!--[-->");
												Menu_item($$renderer, {
													class: "hb-dropdown-item hb-dropdown-item--danger",
													onclick: () => onDelete(video._id),
													disabled: isPending(),
													children: ($$renderer) => {
														$$renderer.push(`<!---->מחק וידאו`);
													},
													$$slots: { default: true }
												});
												$$renderer.push("<!--]-->");
											} else {
												$$renderer.push("<!--[!-->");
												$$renderer.push("<!--]-->");
											}
										},
										$$slots: { default: true }
									});
									$$renderer.push("<!--]-->");
								} else {
									$$renderer.push("<!--[!-->");
									$$renderer.push("<!--]-->");
								}
							},
							$$slots: { default: true }
						});
						$$renderer.push("<!--]-->");
					} else {
						$$renderer.push("<!--[!-->");
						$$renderer.push("<!--]-->");
					}
				},
				$$slots: { default: true }
			});
			$$renderer.push("<!--]-->");
		} else {
			$$renderer.push("<!--[!-->");
			$$renderer.push("<!--]-->");
		}
		$$renderer.push(`</div> <p class="video-desc">${escape_html(video.description || "אין תיאור לשיעור זה.")}</p> <div class="metadata-tags"><span class="meta-tag duration">${escape_html(durationLabel(video.durationSeconds))}</span> <span${attr_class("meta-tag access", void 0, {
			"macroflow": video.accessKind === "macroflow",
			"microflow": video.accessKind === "microflow"
		})}>${escape_html(video.accessKind === "macroflow" ? "Macroflow" : "Microflow")}</span> <span class="meta-tag quality">${escape_html(video.muxVideoQuality)}</span> <span class="meta-tag resolution">${escape_html(video.muxMaxResolutionTier)}</span> <!--[-->`);
		const each_array = ensure_array_like(video.requiredEquipment);
		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let eq = each_array[$$index];
			$$renderer.push(`<span class="meta-tag equipment">${escape_html(equipmentLabel(eq))}</span>`);
		}
		$$renderer.push(`<!--]--></div></div></article>`);
	});
}
//#endregion
//#region src/lib/features/studio/components/VideoList.svelte
function VideoList($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { library = null, actionId = null, onEdit, onPublish, onDelete } = $$props;
		let searchQuery = "";
		function filterVideos(list) {
			return list.filter((video) => {
				return (video.title.toLowerCase().includes(searchQuery.toLowerCase()) || video.description.toLowerCase().includes(searchQuery.toLowerCase())) && true;
			});
		}
		const filteredPublished = derived(() => library ? filterVideos(library.published) : []);
		const filteredDrafts = derived(() => library ? filterVideos(library.drafts) : []);
		const totalPublishedCount = derived(() => library?.published.length ?? 0);
		const totalDraftsCount = derived(() => library?.drafts.length ?? 0);
		$$renderer.push(`<div class="video-library-list"><div class="filter-controls-row"><div class="search-input-wrapper"><span class="material-symbols-rounded search-icon">search</span> <input type="text"${attr("value", searchQuery)} placeholder="חיפוש שיעורים לפי כותרת או תיאור..." class="search-input"/> `);
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></div> <div class="access-filter-chips"><button type="button"${attr_class("filter-chip", void 0, { "active": true })}>הכל</button> <button type="button"${attr_class("filter-chip macro", void 0, { "active": false })}>Macroflow</button> <button type="button"${attr_class("filter-chip micro", void 0, { "active": false })}>Microflow</button></div></div> `);
		if (!library) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="skeleton-grid"><div class="skeleton-card"></div> <div class="skeleton-card"></div> <div class="skeleton-card"></div></div>`);
		} else {
			$$renderer.push("<!--[-1-->");
			if (Scroll_area) {
				$$renderer.push("<!--[-->");
				Scroll_area($$renderer, {
					class: "hb-scroll-area library-scroll-container",
					children: ($$renderer) => {
						if (Scroll_area_viewport) {
							$$renderer.push("<!--[-->");
							Scroll_area_viewport($$renderer, {
								class: "hb-scroll-area__viewport",
								children: ($$renderer) => {
									$$renderer.push(`<div class="sections-stack">`);
									if (filteredDrafts().length > 0) {
										$$renderer.push("<!--[0-->");
										$$renderer.push(`<section class="library-group"><div class="group-header"><span class="material-symbols-rounded group-icon draft">edit_document</span> <h2 class="group-title">שיעורים בטיוטה (${escape_html(filteredDrafts().length)})</h2> `);
										if (totalDraftsCount() !== filteredDrafts().length) {
											$$renderer.push("<!--[0-->");
											$$renderer.push(`<span class="filtered-badge">מסונן</span>`);
										} else $$renderer.push("<!--[-1-->");
										$$renderer.push(`<!--]--></div> <div class="video-grid"><!--[-->`);
										const each_array = ensure_array_like(filteredDrafts());
										for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
											let video = each_array[$$index];
											VideoCard($$renderer, {
												video,
												actionId,
												onEdit,
												onPublish,
												onDelete
											});
										}
										$$renderer.push(`<!--]--></div></section>`);
									} else $$renderer.push("<!--[-1-->");
									$$renderer.push(`<!--]--> `);
									if (filteredPublished().length > 0) {
										$$renderer.push("<!--[0-->");
										$$renderer.push(`<section class="library-group"><div class="group-header"><span class="material-symbols-rounded group-icon published">check_circle</span> <h2 class="group-title">שיעורים פעילים בספרייה (${escape_html(filteredPublished().length)})</h2> `);
										if (totalPublishedCount() !== filteredPublished().length) {
											$$renderer.push("<!--[0-->");
											$$renderer.push(`<span class="filtered-badge">מסונן</span>`);
										} else $$renderer.push("<!--[-1-->");
										$$renderer.push(`<!--]--></div> <div class="video-grid"><!--[-->`);
										const each_array_1 = ensure_array_like(filteredPublished());
										for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
											let video = each_array_1[$$index_1];
											VideoCard($$renderer, {
												video,
												actionId,
												onEdit,
												onPublish,
												onDelete
											});
										}
										$$renderer.push(`<!--]--></div></section>`);
									} else $$renderer.push("<!--[-1-->");
									$$renderer.push(`<!--]--> `);
									if (totalPublishedCount() === 0 && totalDraftsCount() === 0) {
										$$renderer.push("<!--[0-->");
										$$renderer.push(`<div class="empty-state-notice"><span class="material-symbols-rounded empty-icon">video_library</span> <h3>אין עדיין שיעורים בספרייה</h3> <p>העלי את השיעור הראשון שלך באמצעות כרטיסיית "העלאה חדשה" למעלה.</p></div>`);
									} else if (filteredPublished().length === 0 && filteredDrafts().length === 0) {
										$$renderer.push("<!--[1-->");
										$$renderer.push(`<div class="empty-state-notice"><span class="material-symbols-rounded empty-icon">search_off</span> <h3>לא נמצאו תוצאות</h3> <p>נסי לשנות את מונח החיפוש או פילטר מודל הגישה.</p></div>`);
									} else $$renderer.push("<!--[-1-->");
									$$renderer.push(`<!--]--></div>`);
								},
								$$slots: { default: true }
							});
							$$renderer.push("<!--]-->");
						} else {
							$$renderer.push("<!--[!-->");
							$$renderer.push("<!--]-->");
						}
						$$renderer.push(` `);
						if (Scroll_area_scrollbar) {
							$$renderer.push("<!--[-->");
							Scroll_area_scrollbar($$renderer, {
								class: "hb-scroll-area__bar",
								orientation: "vertical",
								children: ($$renderer) => {
									if (Scroll_area_thumb) {
										$$renderer.push("<!--[-->");
										Scroll_area_thumb($$renderer, { class: "hb-scroll-area__thumb" });
										$$renderer.push("<!--]-->");
									} else {
										$$renderer.push("<!--[!-->");
										$$renderer.push("<!--]-->");
									}
								},
								$$slots: { default: true }
							});
							$$renderer.push("<!--]-->");
						} else {
							$$renderer.push("<!--[!-->");
							$$renderer.push("<!--]-->");
						}
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
	});
}
//#endregion
//#region src/lib/features/studio/components/VideoEditModal.svelte
function VideoEditModal($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { video, actionId = null, onClose, onSave } = $$props;
		let title = "";
		let description = "";
		new TextareaAutosize({
			element: () => void 0,
			input: () => description
		});
		let isSaving = false;
		const isPending = derived(() => actionId === video?._id || isSaving);
		if (Dialog) {
			$$renderer.push("<!--[-->");
			Dialog($$renderer, {
				open: video !== null,
				onOpenChange: (open) => {
					if (!open) onClose();
				},
				children: ($$renderer) => {
					if (Portal) {
						$$renderer.push("<!--[-->");
						Portal($$renderer, {
							children: ($$renderer) => {
								if (Dialog_overlay) {
									$$renderer.push("<!--[-->");
									Dialog_overlay($$renderer, { class: "edit-modal-backdrop" });
									$$renderer.push("<!--]-->");
								} else {
									$$renderer.push("<!--[!-->");
									$$renderer.push("<!--]-->");
								}
								$$renderer.push(` `);
								if (Dialog_content) {
									$$renderer.push("<!--[-->");
									Dialog_content($$renderer, {
										class: "edit-modal-card",
										"aria-label": "עריכת פרטי שיעור",
										children: ($$renderer) => {
											if (video) {
												$$renderer.push("<!--[0-->");
												$$renderer.push(`<div class="modal-header"><span class="material-symbols-rounded header-icon">edit_note</span> `);
												if (Dialog_title) {
													$$renderer.push("<!--[-->");
													Dialog_title($$renderer, {
														class: "modal-title",
														level: 2,
														children: ($$renderer) => {
															$$renderer.push(`<!---->עריכת פרטי שיעור`);
														},
														$$slots: { default: true }
													});
													$$renderer.push("<!--]-->");
												} else {
													$$renderer.push("<!--[!-->");
													$$renderer.push("<!--]-->");
												}
												$$renderer.push(` `);
												if (Dialog_close) {
													$$renderer.push("<!--[-->");
													Dialog_close($$renderer, {
														class: "close-button",
														"aria-label": "סגור",
														children: ($$renderer) => {
															$$renderer.push(`<span class="material-symbols-rounded">close</span>`);
														},
														$$slots: { default: true }
													});
													$$renderer.push("<!--]-->");
												} else {
													$$renderer.push("<!--[!-->");
													$$renderer.push("<!--]-->");
												}
												$$renderer.push(`</div> <form class="modal-form"><label class="field"><span class="field__label">כותרת השיעור</span> <input${attr("value", title)} required="" maxlength="120"${attr("disabled", isPending(), true)}/></label> <label class="field"><span class="field__label">תיאור השיעור</span> <textarea maxlength="500"${attr("disabled", isPending(), true)}>`);
												const $$body = escape_html(description);
												if ($$body) $$renderer.push(`${$$body}`);
												$$renderer.push(`</textarea></label> <div class="modal-actions">`);
												if (Button) {
													$$renderer.push("<!--[-->");
													Button($$renderer, {
														class: "hb-button hb-button--ink",
														type: "submit",
														disabled: isPending() || !title.trim(),
														children: ($$renderer) => {
															$$renderer.push(`<!---->${escape_html(isPending() ? "שומר..." : "שמירת שינויים")}`);
														},
														$$slots: { default: true }
													});
													$$renderer.push("<!--]-->");
												} else {
													$$renderer.push("<!--[!-->");
													$$renderer.push("<!--]-->");
												}
												$$renderer.push(` `);
												if (Button) {
													$$renderer.push("<!--[-->");
													Button($$renderer, {
														class: "hb-button hb-button--paper",
														type: "button",
														onclick: onClose,
														disabled: isPending(),
														children: ($$renderer) => {
															$$renderer.push(`<!---->ביטול`);
														},
														$$slots: { default: true }
													});
													$$renderer.push("<!--]-->");
												} else {
													$$renderer.push("<!--[!-->");
													$$renderer.push("<!--]-->");
												}
												$$renderer.push(`</div></form>`);
											} else $$renderer.push("<!--[-1-->");
											$$renderer.push(`<!--]-->`);
										},
										$$slots: { default: true }
									});
									$$renderer.push("<!--]-->");
								} else {
									$$renderer.push("<!--[!-->");
									$$renderer.push("<!--]-->");
								}
							},
							$$slots: { default: true }
						});
						$$renderer.push("<!--]-->");
					} else {
						$$renderer.push("<!--[!-->");
						$$renderer.push("<!--]-->");
					}
				},
				$$slots: { default: true }
			});
			$$renderer.push("<!--]-->");
		} else {
			$$renderer.push("<!--[!-->");
			$$renderer.push("<!--]-->");
		}
	});
}
//#endregion
//#region src/lib/features/studio/components/InstructorVideoManager.svelte
function InstructorVideoManager($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const auth = initAuth();
		let showUpload = false;
		let actionId = null;
		let actionError = "";
		let uploadStatus = "idle";
		let uploadProgress = 0;
		let uploadError = "";
		let creatingCategory = false;
		let categoryError = "";
		let editingVideoObj = null;
		const client = useConvexClient();
		const listQuery = useQuery(api.video.admin.listAll, () => auth.isAuthenticated ? {} : "skip");
		const library = derived(() => listQuery.data ?? null);
		const categoriesResource = resource(() => auth.isAuthenticated, async (isAuthenticated) => {
			if (!isAuthenticated) return [];
			return await authQuery(api.video.categories.listCategories, {});
		}, { initialValue: [] });
		const categories = derived(() => categoriesResource.current ?? []);
		async function handleCreateCategory(name) {
			creatingCategory = true;
			categoryError = "";
			try {
				await client.mutation(api.video.categories.createCategory, { name });
				await categoriesResource.refetch();
			} catch (reason) {
				categoryError = reason instanceof Error ? reason.message : "לא הצלחנו ליצור קטגוריה.";
			} finally {
				creatingCategory = false;
			}
		}
		async function handleStartUpload(data) {
			uploadStatus = "uploading";
			uploadProgress = 0;
			uploadError = "";
			try {
				const result = await client.action(api.video.uploads.requestUpload, {
					title: data.title,
					description: data.description,
					requiredEquipment: data.requiredEquipment,
					accessKind: data.accessKind,
					categoryIds: data.categoryIds,
					muxVideoQuality: data.muxVideoQuality,
					muxMaxResolutionTier: data.muxMaxResolutionTier,
					staticRendition: data.staticRendition
				});
				if (!result?.uploadUrl) {
					uploadStatus = "error";
					uploadError = "לא הצלחנו ליצור כתובת העלאה משרת Mux.";
					return;
				}
				await uploadToMux(result.uploadUrl, data.file);
				uploadStatus = "processing";
				setTimeout(() => {
					if (uploadStatus === "processing") {
						uploadStatus = "ready";
						showUpload = false;
						uploadProgress = 0;
					}
				}, 1500);
			} catch (reason) {
				uploadStatus = "error";
				uploadError = reason instanceof Error ? reason.message : "העלאת קובץ הווידאו נכשלה.";
			}
		}
		function uploadToMux(url, file) {
			return new Promise((resolve, reject) => {
				const xhr = new XMLHttpRequest();
				xhr.upload.addEventListener("progress", (e) => {
					if (e.lengthComputable) uploadProgress = Math.round(e.loaded / e.total * 100);
				});
				xhr.addEventListener("load", () => {
					if (xhr.status >= 200 && xhr.status < 300) resolve();
					else reject(/* @__PURE__ */ new Error(`Mux returned failure code: ${xhr.status}`));
				});
				xhr.addEventListener("error", () => reject(/* @__PURE__ */ new Error("שגיאת רשת במהלך העלאת קובץ.")));
				xhr.open("PUT", url);
				xhr.setRequestHeader("Content-Type", file.type || "video/mp4");
				xhr.send(file);
			});
		}
		async function handlePublishVideo(videoId) {
			actionId = videoId;
			actionError = "";
			try {
				await client.mutation(api.video.admin.updateMetadata, {
					videoId,
					status: "published"
				});
			} catch (reason) {
				actionError = reason instanceof Error ? reason.message : "לא הצלחנו לפרסם את השיעור.";
			} finally {
				actionId = null;
			}
		}
		async function handleDeleteVideo(videoId) {
			actionId = videoId;
			actionError = "";
			try {
				await client.mutation(api.video.admin.updateMetadata, {
					videoId,
					status: "archived"
				});
			} catch (reason) {
				actionError = reason instanceof Error ? reason.message : "לא הצלחנו להעביר לארכיון.";
			} finally {
				actionId = null;
			}
		}
		async function handleSaveEdit(videoId, editTitle, editDescription) {
			actionId = videoId;
			actionError = "";
			try {
				await client.mutation(api.video.admin.updateMetadata, {
					videoId,
					title: editTitle,
					description: editDescription
				});
				editingVideoObj = null;
			} catch (reason) {
				actionError = reason instanceof Error ? reason.message : "לא הצלחנו לשמור שינויים.";
				throw reason;
			} finally {
				actionId = null;
			}
		}
		PageShell($$renderer, {
			title: "ספריית שיעורי וידאו",
			description: "העלאת שיעורים חדשים, שיוך לקטגוריות Macroflow/Microflow, וניהול תוכן מתוזמן.",
			children: ($$renderer) => {
				if (actionError) {
					$$renderer.push("<!--[0-->");
					Notice($$renderer, {
						tone: "danger",
						children: ($$renderer) => {
							$$renderer.push(`<!---->${escape_html(actionError)}`);
						},
						$$slots: { default: true }
					});
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--> `);
				if (uploadStatus === "ready") {
					$$renderer.push("<!--[0-->");
					Notice($$renderer, {
						tone: "success",
						children: ($$renderer) => {
							$$renderer.push(`<!---->הווידאו הועלה בהצלחה! מעבדים אותו בשרתי Mux — יופיע בספריה תוך כמה דקות.`);
						},
						$$slots: { default: true }
					});
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--> <div class="manager-layout svelte-19auows"><div class="manager-toolbar svelte-19auows">`);
				if (Button) {
					$$renderer.push("<!--[-->");
					Button($$renderer, {
						class: `hb-button ${showUpload ? "hb-button--paper" : "hb-button--ink"}`,
						type: "button",
						onclick: () => {
							showUpload = !showUpload;
						},
						children: ($$renderer) => {
							$$renderer.push(`<span class="material-symbols-rounded">${escape_html(showUpload ? "close" : "cloud_upload")}</span> ${escape_html(showUpload ? "סגירת פאנל" : "העלאת וידאו חדש")}`);
						},
						$$slots: { default: true }
					});
					$$renderer.push("<!--]-->");
				} else {
					$$renderer.push("<!--[!-->");
					$$renderer.push("<!--]-->");
				}
				$$renderer.push(`</div> `);
				if (showUpload) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<div class="upload-panel svelte-19auows">`);
					VideoUploadForm($$renderer, {
						categories: categories(),
						uploadStatus,
						uploadProgress,
						uploadError,
						creatingCategory,
						categoryError,
						onCreateCategory: handleCreateCategory,
						onSubmit: handleStartUpload,
						onCancel: () => {
							showUpload = false;
						}
					});
					$$renderer.push(`<!----></div>`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--> `);
				VideoList($$renderer, {
					library: library(),
					actionId,
					onEdit: (video) => editingVideoObj = video,
					onPublish: handlePublishVideo,
					onDelete: handleDeleteVideo
				});
				$$renderer.push(`<!----></div>`);
			},
			$$slots: { default: true }
		});
		$$renderer.push(`<!----> `);
		if (editingVideoObj) {
			$$renderer.push("<!--[0-->");
			VideoEditModal($$renderer, {
				video: editingVideoObj,
				actionId,
				onClose: () => editingVideoObj = null,
				onSave: handleSaveEdit
			});
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]-->`);
	});
}
//#endregion
export { InstructorVideoManager as t };
