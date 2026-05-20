

export const index = 2;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/(app)/_layout.svelte.js')).default;
export const universal = {
  "prerender": false,
  "ssr": false
};
export const universal_id = "src/routes/(app)/+layout.js";
export const imports = ["_app/immutable/nodes/2.2XlomG84.js","_app/immutable/chunks/Cfx3GPPx.js","_app/immutable/chunks/Cncd85Oh.js","_app/immutable/chunks/yDtY7xdz.js","_app/immutable/chunks/C61G5_fo.js","_app/immutable/chunks/CCi4sbZS.js"];
export const stylesheets = ["_app/immutable/assets/2.lg7M5yhs.css"];
export const fonts = [];
