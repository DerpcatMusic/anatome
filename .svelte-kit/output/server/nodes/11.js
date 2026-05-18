import * as universal from '../entries/pages/callback/_page.js';

export const index = 11;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/callback/_page.svelte.js')).default;
export { universal };
export const universal_id = "src/routes/callback/+page.js";
export const imports = ["_app/immutable/nodes/11.DGMyv3H7.js","_app/immutable/chunks/IR7L6Deb.js","_app/immutable/chunks/OFq3flSA.js","_app/immutable/chunks/CP97kCR3.js"];
export const stylesheets = ["_app/immutable/assets/11.Ctdrq6j4.css"];
export const fonts = [];
