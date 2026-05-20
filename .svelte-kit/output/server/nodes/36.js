import * as universal from '../entries/pages/onboarding/_page.js';

export const index = 36;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/onboarding/_page.svelte.js')).default;
export { universal };
export const universal_id = "src/routes/onboarding/+page.js";
export const imports = ["_app/immutable/nodes/36.CO-wtxJR.js","_app/immutable/chunks/DNelhIy7.js","_app/immutable/chunks/DU2SdQ_i.js","_app/immutable/chunks/DCbV68uA.js","_app/immutable/chunks/qCpTV9sU.js","_app/immutable/chunks/D-khBeyW.js","_app/immutable/chunks/hNfF-DrT.js","_app/immutable/chunks/CuOZrXZT.js","_app/immutable/chunks/D5TglNO2.js","_app/immutable/chunks/BtPa_TcV.js","_app/immutable/chunks/DJ4RyLIz.js","_app/immutable/chunks/BcR1FczD.js","_app/immutable/chunks/CxkLmIT9.js","_app/immutable/chunks/D1O6j5JF.js","_app/immutable/chunks/BGLLBNVa.js","_app/immutable/chunks/D42Sqqha.js","_app/immutable/chunks/Cby09Fr0.js"];
export const stylesheets = ["_app/immutable/assets/Notice.DLRT_-Qh.css","_app/immutable/assets/OnboardingForm.BfX-yhJ-.css","_app/immutable/assets/OnboardingShell.CBQyazNE.css"];
export const fonts = [];
