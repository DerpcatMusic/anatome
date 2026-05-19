import { U as attr, W as escape_html, i as bind_props, n as attr_class, o as ensure_array_like } from "./dev.js";
import { o as equipmentOptions } from "./labels.js";
//#region src/lib/features/app/components/FormSection.svelte
function FormSection($$renderer, $$props) {
	let { title, children } = $$props;
	$$renderer.push(`<section class="form-section svelte-gohi6t"><h3 class="svelte-gohi6t">${escape_html(title)}</h3> <div class="form-section__body svelte-gohi6t">`);
	children($$renderer);
	$$renderer.push(`<!----></div></section>`);
}
//#endregion
//#region src/lib/components/ui/EquipmentPicker.svelte
function EquipmentPicker($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { selected = [], readonly = false, disabled = false, label = "ציוד לשיעור", onchange } = $$props;
		$$renderer.push(`<div class="equipment-picker svelte-smumyd"><p class="equipment-picker__label svelte-smumyd">${escape_html(label)}</p> <div class="equipment-grid svelte-smumyd"><!--[-->`);
		const each_array = ensure_array_like(equipmentOptions);
		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let [value, itemLabel] = each_array[$$index];
			$$renderer.push(`<label${attr_class("svelte-smumyd", void 0, {
				"selected": selected.includes(value),
				"readonly": readonly
			})}><input type="checkbox"${attr("checked", selected.includes(value), true)}${attr("disabled", disabled, true)} class="svelte-smumyd"/> <span>${escape_html(itemLabel)}</span></label>`);
		}
		$$renderer.push(`<!--]--></div></div>`);
		bind_props($$props, { selected });
	});
}
//#endregion
export { FormSection as n, EquipmentPicker as t };
