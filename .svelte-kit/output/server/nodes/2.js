

export const index = 2;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/(app)/_layout.svelte.js')).default;
export const universal = {
  "prerender": false,
  "ssr": false
};
export const universal_id = "src/routes/(app)/+layout.js";
export const imports = ["_app/immutable/nodes/2.DsqtWoIV.js","_app/immutable/chunks/DNelhIy7.js","_app/immutable/chunks/hNfF-DrT.js","_app/immutable/chunks/DU2SdQ_i.js","_app/immutable/chunks/DwfEeimw.js","_app/immutable/chunks/D84R6owN.js","_app/immutable/chunks/BVopJGLV.js","_app/immutable/chunks/DCbV68uA.js","_app/immutable/chunks/CCGCE7YR.js","_app/immutable/chunks/DuznwvqE.js"];
export const stylesheets = ["_app/immutable/assets/2.DCPQdlL9.css"];
export const fonts = [];
