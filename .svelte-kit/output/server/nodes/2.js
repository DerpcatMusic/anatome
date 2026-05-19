

export const index = 2;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/(app)/_layout.svelte.js')).default;
export const universal = {
  "prerender": false,
  "ssr": false
};
export const universal_id = "src/routes/(app)/+layout.js";
export const imports = ["_app/immutable/nodes/2.CZppRbMO.js","_app/immutable/chunks/Co9uX_hQ.js","_app/immutable/chunks/BKu15lNO.js","_app/immutable/chunks/BSuc4Zc4.js","_app/immutable/chunks/CCi4sbZS.js"];
export const stylesheets = ["_app/immutable/assets/2.D5sVx7CT.css"];
export const fonts = [];
