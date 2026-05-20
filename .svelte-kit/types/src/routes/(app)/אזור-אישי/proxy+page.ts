// @ts-nocheck
import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load = () => {
	throw redirect(307, '/u/dashboard');
};
;null as any as PageLoad;