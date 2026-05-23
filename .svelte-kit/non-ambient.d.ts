
// this file is generated — do not edit it


declare module "svelte/elements" {
	export interface HTMLAttributes<T> {
		'data-sveltekit-keepfocus'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-noscroll'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-preload-code'?:
			| true
			| ''
			| 'eager'
			| 'viewport'
			| 'hover'
			| 'tap'
			| 'off'
			| undefined
			| null;
		'data-sveltekit-preload-data'?: true | '' | 'hover' | 'tap' | 'off' | undefined | null;
		'data-sveltekit-reload'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-replacestate'?: true | '' | 'off' | undefined | null;
	}
}

export {};


declare module "$app/types" {
	type MatcherParam<M> = M extends (param : string) => param is (infer U extends string) ? U : string;

	export interface AppTypes {
		RouteId(): "/(app)" | "/" | "/(app)/calendar" | "/callback" | "/(app)/dashboard" | "/(app)/i" | "/(app)/i/dashboard" | "/(app)/i/live" | "/(app)/i/one-on-one" | "/(app)/i/profile" | "/(app)/i/videos" | "/legal" | "/legal/accessibility" | "/legal/cancellations" | "/legal/health" | "/legal/privacy" | "/legal/terms" | "/(app)/live-room" | "/(app)/live" | "/onboarding" | "/(app)/one-on-one" | "/(app)/profile" | "/robots.txt" | "/sitemap.xml" | "/(app)/studio" | "/(app)/studio/live" | "/(app)/studio/videos" | "/(app)/u" | "/(app)/u/calendar" | "/(app)/u/dashboard" | "/(app)/u/one-on-one" | "/(app)/u/profile" | "/(app)/u/videos" | "/(app)/videos" | "/(app)/watch" | "/(app)/אזור-אישי" | "/(app)/אחד-על-אחד" | "/התאמה" | "/(app)/וידאו" | "/(app)/חדר-לייב" | "/(app)/לוח" | "/(app)/סטודיו" | "/(app)/סטודיו/וידאו" | "/(app)/סטודיו/לייב" | "/(app)/פרופיל" | "/(app)/צפייה";
		RouteParams(): {
			
		};
		LayoutParams(): {
			"/(app)": Record<string, never>;
			"/": Record<string, never>;
			"/(app)/calendar": Record<string, never>;
			"/callback": Record<string, never>;
			"/(app)/dashboard": Record<string, never>;
			"/(app)/i": Record<string, never>;
			"/(app)/i/dashboard": Record<string, never>;
			"/(app)/i/live": Record<string, never>;
			"/(app)/i/one-on-one": Record<string, never>;
			"/(app)/i/profile": Record<string, never>;
			"/(app)/i/videos": Record<string, never>;
			"/legal": Record<string, never>;
			"/legal/accessibility": Record<string, never>;
			"/legal/cancellations": Record<string, never>;
			"/legal/health": Record<string, never>;
			"/legal/privacy": Record<string, never>;
			"/legal/terms": Record<string, never>;
			"/(app)/live-room": Record<string, never>;
			"/(app)/live": Record<string, never>;
			"/onboarding": Record<string, never>;
			"/(app)/one-on-one": Record<string, never>;
			"/(app)/profile": Record<string, never>;
			"/robots.txt": Record<string, never>;
			"/sitemap.xml": Record<string, never>;
			"/(app)/studio": Record<string, never>;
			"/(app)/studio/live": Record<string, never>;
			"/(app)/studio/videos": Record<string, never>;
			"/(app)/u": Record<string, never>;
			"/(app)/u/calendar": Record<string, never>;
			"/(app)/u/dashboard": Record<string, never>;
			"/(app)/u/one-on-one": Record<string, never>;
			"/(app)/u/profile": Record<string, never>;
			"/(app)/u/videos": Record<string, never>;
			"/(app)/videos": Record<string, never>;
			"/(app)/watch": Record<string, never>;
			"/(app)/אזור-אישי": Record<string, never>;
			"/(app)/אחד-על-אחד": Record<string, never>;
			"/התאמה": Record<string, never>;
			"/(app)/וידאו": Record<string, never>;
			"/(app)/חדר-לייב": Record<string, never>;
			"/(app)/לוח": Record<string, never>;
			"/(app)/סטודיו": Record<string, never>;
			"/(app)/סטודיו/וידאו": Record<string, never>;
			"/(app)/סטודיו/לייב": Record<string, never>;
			"/(app)/פרופיל": Record<string, never>;
			"/(app)/צפייה": Record<string, never>
		};
		Pathname(): "/" | "/calendar" | "/callback" | "/dashboard" | "/i/dashboard" | "/i/live" | "/i/one-on-one" | "/i/profile" | "/i/videos" | "/legal/accessibility" | "/legal/cancellations" | "/legal/health" | "/legal/privacy" | "/legal/terms" | "/live-room" | "/live" | "/onboarding" | "/one-on-one" | "/profile" | "/robots.txt" | "/sitemap.xml" | "/studio/videos" | "/u/calendar" | "/u/dashboard" | "/u/one-on-one" | "/u/profile" | "/u/videos" | "/videos" | "/watch" | "/אזור-אישי" | "/אחד-על-אחד" | "/התאמה" | "/וידאו" | "/חדר-לייב" | "/לוח" | "/סטודיו/וידאו" | "/סטודיו/לייב" | "/פרופיל" | "/צפייה";
		ResolvedPathname(): `${"" | `/${string}`}${ReturnType<AppTypes['Pathname']>}`;
		Asset(): "/_redirects" | "/favicon.ico" | "/favicon.svg" | string & {};
	}
}