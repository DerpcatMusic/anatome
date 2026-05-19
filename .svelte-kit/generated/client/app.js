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
	() => import('./nodes/25')
];

export const server_loads = [];

export const dictionary = {
		"/": [4],
		"/(app)/calendar": [5,[2]],
		"/callback": [23],
		"/(app)/dashboard": [6,[2]],
		"/(app)/live-room": [8,[2]],
		"/(app)/live": [7,[2]],
		"/onboarding": [24],
		"/(app)/one-on-one": [9,[2]],
		"/(app)/profile": [10,[2]],
		"/(app)/studio/videos": [11,[2]],
		"/(app)/videos": [12,[2]],
		"/(app)/watch": [13,[2]],
		"/(app)/אזור-אישי": [14,[2]],
		"/(app)/אחד-על-אחד": [15,[2]],
		"/התאמה": [25],
		"/(app)/וידאו": [16,[2]],
		"/(app)/חדר-לייב": [17,[3]],
		"/(app)/לוח": [18,[2]],
		"/(app)/סטודיו/וידאו": [19,[2]],
		"/(app)/סטודיו/לייב": [20,[2]],
		"/(app)/פרופיל": [21,[2]],
		"/(app)/צפייה": [22,[2]]
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