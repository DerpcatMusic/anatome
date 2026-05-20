export { matchers } from './matchers.js';

export const nodes = [
	() => import('./nodes/0'),
	() => import('./nodes/1'),
	() => import('./nodes/2'),
	() => import('./nodes/3'),
	() => import('./nodes/4'),
	() => import('./nodes/5'),
	() => import('./nodes/6'),
	() => import('./nodes/7'),
	() => import('./nodes/8'),
	() => import('./nodes/9'),
	() => import('./nodes/10'),
	() => import('./nodes/11'),
	() => import('./nodes/12'),
	() => import('./nodes/13'),
	() => import('./nodes/14'),
	() => import('./nodes/15'),
	() => import('./nodes/16'),
	() => import('./nodes/17'),
	() => import('./nodes/18'),
	() => import('./nodes/19'),
	() => import('./nodes/20'),
	() => import('./nodes/21'),
	() => import('./nodes/22'),
	() => import('./nodes/23'),
	() => import('./nodes/24'),
	() => import('./nodes/25'),
	() => import('./nodes/26'),
	() => import('./nodes/27'),
	() => import('./nodes/28'),
	() => import('./nodes/29'),
	() => import('./nodes/30'),
	() => import('./nodes/31'),
	() => import('./nodes/32'),
	() => import('./nodes/33'),
	() => import('./nodes/34'),
	() => import('./nodes/35'),
	() => import('./nodes/36'),
	() => import('./nodes/37')
];

export const server_loads = [];

export const dictionary = {
		"/": [6],
		"/(app)/calendar": [7,[2]],
		"/callback": [35],
		"/(app)/dashboard": [8,[2]],
		"/(app)/i/dashboard": [9,[2,3]],
		"/(app)/i/live": [10,[2,3]],
		"/(app)/i/one-on-one": [11,[2,3]],
		"/(app)/i/profile": [12,[2,3]],
		"/(app)/i/videos": [13,[2,3]],
		"/(app)/live-room": [15,[2]],
		"/(app)/live": [14,[2]],
		"/onboarding": [36],
		"/(app)/one-on-one": [16,[2]],
		"/(app)/profile": [17,[2]],
		"/(app)/studio/videos": [18,[2]],
		"/(app)/u/calendar": [19,[2,4]],
		"/(app)/u/dashboard": [20,[2,4]],
		"/(app)/u/one-on-one": [21,[2,4]],
		"/(app)/u/profile": [22,[2,4]],
		"/(app)/u/videos": [23,[2,4]],
		"/(app)/videos": [24,[2]],
		"/(app)/watch": [25,[2]],
		"/(app)/אזור-אישי": [26,[2]],
		"/(app)/אחד-על-אחד": [27,[2]],
		"/התאמה": [37],
		"/(app)/וידאו": [28,[2]],
		"/(app)/חדר-לייב": [29,[5]],
		"/(app)/לוח": [30,[2]],
		"/(app)/סטודיו/וידאו": [31,[2]],
		"/(app)/סטודיו/לייב": [32,[2]],
		"/(app)/פרופיל": [33,[2]],
		"/(app)/צפייה": [34,[2]]
	};

export const hooks = {
	handleError: (({ error }) => { console.error(error) }),
	
	reroute: (() => {}),
	transport: {}
};

export const decoders = Object.fromEntries(Object.entries(hooks.transport).map(([k, v]) => [k, v.decode]));
export const encoders = Object.fromEntries(Object.entries(hooks.transport).map(([k, v]) => [k, v.encode]));

export const hash = false;

export const decode = (type, value) => decoders[type](value);

export { default as root } from '../root.js';