import { H as attr, U as escape_html, i as bind_props, n as attr_class, o as ensure_array_like } from "./dev.js";
import { o as equipmentOptions } from "./labels.js";
//#region src/components/app/FormSection.svelte
function FormSection($$renderer, $$props) {
	let { title, children } = $$props;
	$$renderer.push(`<section class="form-section svelte-1tukt3d"><h3 class="svelte-1tukt3d">${escape_html(title)}</h3> <div class="form-section__body svelte-1tukt3d">`);
	children($$renderer);
	$$renderer.push(`<!----></div></section>`);
}
//#endregion
//#region src/components/ui/EquipmentPicker.svelte
function EquipmentPicker($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { selected = [], readonly = false, disabled = false, label = "ציוד לשיעור", onchange } = $$props;
		$$renderer.push(`<div class="equipment-picker svelte-118jnsd"><p class="equipment-picker__label svelte-118jnsd">${escape_html(label)}</p> <div class="equipment-grid svelte-118jnsd"><!--[-->`);
		const each_array = ensure_array_like(equipmentOptions);
		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let [value, itemLabel] = each_array[$$index];
			$$renderer.push(`<label${attr_class("svelte-118jnsd", void 0, {
				"selected": selected.includes(value),
				"readonly": readonly
			})}><input type="checkbox"${attr("checked", selected.includes(value), true)}${attr("disabled", disabled, true)} class="svelte-118jnsd"/> <span>${escape_html(itemLabel)}</span></label>`);
		}
		$$renderer.push(`<!--]--></div></div>`);
		bind_props($$props, { selected });
	});
}
//#endregion
export { FormSection as n, EquipmentPicker as t };
