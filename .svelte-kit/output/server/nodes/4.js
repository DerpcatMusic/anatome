

export const index = 4;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/(app)/u/_layout.svelte.js')).default;
export const universal = {
  "prerender": false,
  "ssr": false
};
export const universal_id = "src/routes/(app)/u/+layout.js";
export const imports = ["_app/immutable/nodes/4.Bxl4zyNA.js","_app/immutable/chunks/DNelhIy7.js","_app/immutable/chunks/DQnJaRO0.js","_app/immutable/chunks/BVopJGLV.js","_app/immutable/chunks/DU2SdQ_i.js","_app/immutable/chunks/BTAwJCvG.js","_app/immutable/chunks/DCbV68uA.js","_app/immutable/chunks/CCGCE7YR.js"];
export const stylesheets = ["_app/immutable/assets/4.WZkJq0Ta.css"];
export const fonts = [];
