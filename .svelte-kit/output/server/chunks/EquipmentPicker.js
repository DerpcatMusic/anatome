import { a as bind_props, c as ensure_array_like, et as escape_html } from "./dev.js";
import { i as Checkbox, t as EquipmentIcon } from "./EquipmentIcon.js";
import { o as equipmentOptions } from "./labels.js";
//#region src/lib/components/ui/EquipmentPicker.svelte
function EquipmentPicker($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { selected = [], readonly = false, disabled = false, label = "ציוד לשיעור", onchange } = $$props;
		function toggle(value) {
			if (readonly || disabled) return;
			const next = selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value];
			selected = next;
			onchange?.(next);
		}
		$$renderer.push(`<div class="equipment-picker svelte-smumyd"><p class="equipment-picker__label svelte-smumyd">${escape_html(label)}</p> <div class="equipment-grid svelte-smumyd"><!--[-->`);
		const each_array = ensure_array_like(equipmentOptions);
		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let [value, itemLabel] = each_array[$$index];
			if (Checkbox) {
				$$renderer.push("<!--[-->");
				Checkbox($$renderer, {
					class: "hb-choice",
					checked: selected.includes(value),
					readonly,
					disabled,
					onchange: () => toggle(value),
					children: ($$renderer) => {
						$$renderer.push(`<div class="equipment-choice-content svelte-smumyd"><div class="icon-wrapper svelte-smumyd">`);
						EquipmentIcon($$renderer, { name: value });
						$$renderer.push(`<!----></div> <span class="choice-label svelte-smumyd">${escape_html(itemLabel)}</span></div>`);
					},
					$$slots: { default: true }
				});
				$$renderer.push("<!--]-->");
			} else {
				$$renderer.push("<!--[!-->");
				$$renderer.push("<!--]-->");
			}
		}
		$$renderer.push(`<!--]--></div></div>`);
		bind_props($$props, { selected });
	});
}
//#endregion
export { EquipmentPicker as t };
