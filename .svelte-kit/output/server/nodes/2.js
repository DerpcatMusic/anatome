

export const index = 2;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/(app)/_layout.svelte.js')).default;
export const universal = {
  "prerender": false,
  "ssr": false
};
export const universal_id = "src/routes/(app)/+layout.js";
export const imports = ["_app/immutable/nodes/2.zuPNCAwv.js","_app/immutable/chunks/DK3Fl9T5.js","_app/immutable/chunks/CdgY-bjR.js","_app/immutable/chunks/DBgQEYmP.js","_app/immutable/chunks/BYZnWc1V.js","_app/immutable/chunks/3h1GKgYo.js","_app/immutable/chunks/BuFlayix.js","_app/immutable/chunks/xihTtKlq.js","_app/immutable/chunks/fxgsQ7qI.js","_app/immutable/chunks/jkO1MSg-.js","_app/immutable/chunks/D4bwasFl.js"];
export const stylesheets = ["_app/immutable/assets/2.Cgiagexn.css"];
export const fonts = [];
