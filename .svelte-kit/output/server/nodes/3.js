

export const index = 3;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/(app)/i/_layout.svelte.js')).default;
export const universal = {
  "prerender": false,
  "ssr": false
};
export const universal_id = "src/routes/(app)/i/+layout.js";
export const imports = ["_app/immutable/nodes/3.08Bj6Mez.js","_app/immutable/chunks/DK3Fl9T5.js","_app/immutable/chunks/3h1GKgYo.js","_app/immutable/chunks/BuFlayix.js","_app/immutable/chunks/DBgQEYmP.js","_app/immutable/chunks/s-UIkEIw.js","_app/immutable/chunks/xihTtKlq.js","_app/immutable/chunks/fxgsQ7qI.js"];
export const stylesheets = [];
export const fonts = [];
