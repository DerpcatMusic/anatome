export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["_redirects","favicon.ico","favicon.svg"]),
	mimeTypes: {".svg":"image/svg+xml"},
	_: {
		client: {start:"_app/immutable/entry/start.B9RnNHJr.js",app:"_app/immutable/entry/app.17otOFer.js",imports:["_app/immutable/entry/start.B9RnNHJr.js","_app/immutable/chunks/3h1GKgYo.js","_app/immutable/chunks/BuFlayix.js","_app/immutable/chunks/DBgQEYmP.js","_app/immutable/chunks/DK3Fl9T5.js","_app/immutable/entry/app.17otOFer.js","_app/immutable/chunks/kNaey6uv.js","_app/immutable/chunks/DBgQEYmP.js","_app/immutable/chunks/DK3Fl9T5.js","_app/immutable/chunks/xihTtKlq.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js')),
			__memo(() => import('./nodes/2.js')),
			__memo(() => import('./nodes/3.js')),
			__memo(() => import('./nodes/4.js')),
			__memo(() => import('./nodes/5.js')),
			__memo(() => import('./nodes/7.js')),
			__memo(() => import('./nodes/8.js')),
			__memo(() => import('./nodes/9.js')),
			__memo(() => import('./nodes/10.js')),
			__memo(() => import('./nodes/11.js')),
			__memo(() => import('./nodes/12.js')),
			__memo(() => import('./nodes/13.js')),
			__memo(() => import('./nodes/14.js')),
			__memo(() => import('./nodes/15.js')),
			__memo(() => import('./nodes/16.js')),
			__memo(() => import('./nodes/17.js')),
			__memo(() => import('./nodes/18.js')),
			__memo(() => import('./nodes/19.js')),
			__memo(() => import('./nodes/20.js')),
			__memo(() => import('./nodes/21.js')),
			__memo(() => import('./nodes/22.js')),
			__memo(() => import('./nodes/23.js')),
			__memo(() => import('./nodes/24.js')),
			__memo(() => import('./nodes/25.js')),
			__memo(() => import('./nodes/26.js')),
			__memo(() => import('./nodes/27.js')),
			__memo(() => import('./nodes/28.js')),
			__memo(() => import('./nodes/29.js')),
			__memo(() => import('./nodes/30.js')),
			__memo(() => import('./nodes/31.js')),
			__memo(() => import('./nodes/32.js')),
			__memo(() => import('./nodes/33.js')),
			__memo(() => import('./nodes/34.js')),
			__memo(() => import('./nodes/35.js')),
			__memo(() => import('./nodes/41.js')),
			__memo(() => import('./nodes/42.js'))
		],
		remotes: {
			
		},
		routes: [
			{
				id: "/(app)/calendar",
				pattern: /^\/calendar\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 6 },
				endpoint: null
			},
			{
				id: "/callback",
				pattern: /^\/callback\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 34 },
				endpoint: null
			},
			{
				id: "/(app)/dashboard",
				pattern: /^\/dashboard\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 7 },
				endpoint: null
			},
			{
				id: "/(app)/i/dashboard",
				pattern: /^\/i\/dashboard\/?$/,
				params: [],
				page: { layouts: [0,2,3,], errors: [1,,,], leaf: 8 },
				endpoint: null
			},
			{
				id: "/(app)/i/live",
				pattern: /^\/i\/live\/?$/,
				params: [],
				page: { layouts: [0,2,3,], errors: [1,,,], leaf: 9 },
				endpoint: null
			},
			{
				id: "/(app)/i/one-on-one",
				pattern: /^\/i\/one-on-one\/?$/,
				params: [],
				page: { layouts: [0,2,3,], errors: [1,,,], leaf: 10 },
				endpoint: null
			},
			{
				id: "/(app)/i/profile",
				pattern: /^\/i\/profile\/?$/,
				params: [],
				page: { layouts: [0,2,3,], errors: [1,,,], leaf: 11 },
				endpoint: null
			},
			{
				id: "/(app)/i/videos",
				pattern: /^\/i\/videos\/?$/,
				params: [],
				page: { layouts: [0,2,3,], errors: [1,,,], leaf: 12 },
				endpoint: null
			},
			{
				id: "/(app)/live-room",
				pattern: /^\/live-room\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 14 },
				endpoint: null
			},
			{
				id: "/(app)/live",
				pattern: /^\/live\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 13 },
				endpoint: null
			},
			{
				id: "/onboarding",
				pattern: /^\/onboarding\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 35 },
				endpoint: null
			},
			{
				id: "/(app)/one-on-one",
				pattern: /^\/one-on-one\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 15 },
				endpoint: null
			},
			{
				id: "/(app)/profile",
				pattern: /^\/profile\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 16 },
				endpoint: null
			},
			{
				id: "/(app)/studio/videos",
				pattern: /^\/studio\/videos\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 17 },
				endpoint: null
			},
			{
				id: "/(app)/u/calendar",
				pattern: /^\/u\/calendar\/?$/,
				params: [],
				page: { layouts: [0,2,4,], errors: [1,,,], leaf: 18 },
				endpoint: null
			},
			{
				id: "/(app)/u/dashboard",
				pattern: /^\/u\/dashboard\/?$/,
				params: [],
				page: { layouts: [0,2,4,], errors: [1,,,], leaf: 19 },
				endpoint: null
			},
			{
				id: "/(app)/u/one-on-one",
				pattern: /^\/u\/one-on-one\/?$/,
				params: [],
				page: { layouts: [0,2,4,], errors: [1,,,], leaf: 20 },
				endpoint: null
			},
			{
				id: "/(app)/u/profile",
				pattern: /^\/u\/profile\/?$/,
				params: [],
				page: { layouts: [0,2,4,], errors: [1,,,], leaf: 21 },
				endpoint: null
			},
			{
				id: "/(app)/u/videos",
				pattern: /^\/u\/videos\/?$/,
				params: [],
				page: { layouts: [0,2,4,], errors: [1,,,], leaf: 22 },
				endpoint: null
			},
			{
				id: "/(app)/videos",
				pattern: /^\/videos\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 23 },
				endpoint: null
			},
			{
				id: "/(app)/watch",
				pattern: /^\/watch\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 24 },
				endpoint: null
			},
			{
				id: "/(app)/אזור-אישי",
				pattern: /^\/אזור-אישי\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 25 },
				endpoint: null
			},
			{
				id: "/(app)/אחד-על-אחד",
				pattern: /^\/אחד-על-אחד\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 26 },
				endpoint: null
			},
			{
				id: "/התאמה",
				pattern: /^\/התאמה\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 36 },
				endpoint: null
			},
			{
				id: "/(app)/וידאו",
				pattern: /^\/וידאו\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 27 },
				endpoint: null
			},
			{
				id: "/(app)/חדר-לייב",
				pattern: /^\/חדר-לייב\/?$/,
				params: [],
				page: { layouts: [0,5,], errors: [1,,], leaf: 28 },
				endpoint: null
			},
			{
				id: "/(app)/לוח",
				pattern: /^\/לוח\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 29 },
				endpoint: null
			},
			{
				id: "/(app)/סטודיו/וידאו",
				pattern: /^\/סטודיו\/וידאו\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 30 },
				endpoint: null
			},
			{
				id: "/(app)/סטודיו/לייב",
				pattern: /^\/סטודיו\/לייב\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 31 },
				endpoint: null
			},
			{
				id: "/(app)/פרופיל",
				pattern: /^\/פרופיל\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 32 },
				endpoint: null
			},
			{
				id: "/(app)/צפייה",
				pattern: /^\/צפייה\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 33 },
				endpoint: null
			}
		],
		prerendered_routes: new Set(["/","/sitemap.xml","/robots.txt","/legal/terms","/legal/privacy","/legal/cancellations","/legal/accessibility","/legal/health"]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();
