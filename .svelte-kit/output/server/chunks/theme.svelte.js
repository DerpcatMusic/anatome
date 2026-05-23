import "./dev.js";
//#region src/lib/features/app/theme.svelte.ts
var STORAGE_KEY = "homebody-theme";
function getInitialTheme() {
	if (typeof window === "undefined") return "system";
	const stored = localStorage.getItem(STORAGE_KEY);
	if (stored && [
		"light",
		"dark",
		"system"
	].includes(stored)) return stored;
	return "system";
}
function applyTheme(theme) {
	const root = document.documentElement;
	const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
	const isDark = theme === "dark" || theme === "system" && prefersDark;
	root.setAttribute("data-theme", isDark ? "dark" : "light");
}
var ThemeStore = class {
	value = "system";
	constructor() {
		if (typeof window !== "undefined") {
			this.value = getInitialTheme();
			applyTheme(this.value);
			window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
				if (this.value === "system") applyTheme("system");
			});
		}
	}
	set(theme) {
		this.value = theme;
		localStorage.setItem(STORAGE_KEY, theme);
		applyTheme(theme);
	}
	toggle() {
		const prefersDark = typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;
		const isCurrentlyDark = this.value === "dark" || this.value === "system" && prefersDark;
		this.set(isCurrentlyDark ? "light" : "dark");
	}
};
var theme = new ThemeStore();
//#endregion
export { theme as t };
