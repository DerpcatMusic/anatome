import * as universal from '../entries/pages/_layout.js';

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export { universal };
export const universal_id = "src/routes/+layout.js";
export const imports = ["_app/immutable/nodes/0.0fNzIdfo.js","_app/immutable/chunks/Cfx3GPPx.js","_app/immutable/chunks/Cncd85Oh.js","_app/immutable/chunks/CGeTKPHw.js","_app/immutable/chunks/CCi4sbZS.js","_app/immutable/chunks/BSh82o-3.js"];
export const stylesheets = ["_app/immutable/assets/0.BfAnaRCW.css"];
export const fonts = [];
