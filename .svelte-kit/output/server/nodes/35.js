import * as universal from '../entries/pages/callback/_page.js';

export const index = 35;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/callback/_page.svelte.js')).default;
export { universal };
export const universal_id = "src/routes/callback/+page.js";
export const imports = ["_app/immutable/nodes/35.2ihqnMR9.js","_app/immutable/chunks/DNelhIy7.js","_app/immutable/chunks/hNfF-DrT.js","_app/immutable/chunks/DU2SdQ_i.js","_app/immutable/chunks/DCbV68uA.js","_app/immutable/chunks/qCpTV9sU.js"];
export const stylesheets = ["_app/immutable/assets/35.BE0nr9Kh.css"];
export const fonts = [];
