

export const index = 2;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/(app)/_layout.svelte.js')).default;
export const universal = {
  "prerender": false,
  "ssr": false
};
export const universal_id = "src/routes/(app)/+layout.js";
export const imports = ["_app/immutable/nodes/2.BHLzrNA2.js","_app/immutable/chunks/IR7L6Deb.js","_app/immutable/chunks/CP97kCR3.js"];
export const stylesheets = [];
export const fonts = [];
