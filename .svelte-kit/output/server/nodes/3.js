

export const index = 3;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/(app)/i/_layout.svelte.js')).default;
export const universal = {
  "prerender": false,
  "ssr": false
};
export const universal_id = "src/routes/(app)/i/+layout.js";
export const imports = ["_app/immutable/nodes/3.C7C1wqqj.js","_app/immutable/chunks/DNelhIy7.js","_app/immutable/chunks/BF_5PAbf.js","_app/immutable/chunks/BVopJGLV.js","_app/immutable/chunks/DU2SdQ_i.js","_app/immutable/chunks/DYTSfoLX.js","_app/immutable/chunks/DCbV68uA.js","_app/immutable/chunks/CCGCE7YR.js"];
export const stylesheets = ["_app/immutable/assets/3.BkjAaIr8.css"];
export const fonts = [];
