import * as universal from '../entries/pages/_layout.js';

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export { universal };
export const universal_id = "src/routes/+layout.js";
export const imports = ["_app/immutable/nodes/0.1R0hBQzD.js","_app/immutable/chunks/DK3Fl9T5.js","_app/immutable/chunks/CdgY-bjR.js","_app/immutable/chunks/DBgQEYmP.js","_app/immutable/chunks/BKun_xNH.js","_app/immutable/chunks/xihTtKlq.js","_app/immutable/chunks/CtHCqe6S.js","_app/immutable/chunks/jkO1MSg-.js"];
export const stylesheets = ["_app/immutable/assets/0.BQdTRYP0.css"];
export const fonts = [];
