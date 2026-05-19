import * as universal from '../entries/pages/callback/_page.js';

export const index = 23;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/callback/_page.svelte.js')).default;
export { universal };
export const universal_id = "src/routes/callback/+page.js";
export const imports = ["_app/immutable/nodes/23.RtGq1JOp.js","_app/immutable/chunks/Co9uX_hQ.js","_app/immutable/chunks/BKu15lNO.js","_app/immutable/chunks/BSuc4Zc4.js","_app/immutable/chunks/CCi4sbZS.js","_app/immutable/chunks/CGGEpbdl.js"];
export const stylesheets = ["_app/immutable/assets/23.BE0nr9Kh.css"];
export const fonts = [];
