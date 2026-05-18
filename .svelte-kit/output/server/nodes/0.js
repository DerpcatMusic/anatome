import * as universal from '../entries/pages/_layout.js';

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export { universal };
export const universal_id = "src/routes/+layout.js";
export const imports = ["_app/immutable/nodes/0.DLu2dW6R.js","_app/immutable/chunks/IR7L6Deb.js","_app/immutable/chunks/OFq3flSA.js","_app/immutable/chunks/CP97kCR3.js"];
export const stylesheets = ["_app/immutable/assets/0.C9kd21Ns.css"];
export const fonts = [];
