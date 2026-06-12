import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, locals }) => {
	const code = url.searchParams.get('code');
	const next = url.searchParams.get('next') ?? '/account';
	const safeNext = next.startsWith('/') ? next : '/account';

	if (code) {
		const { error } = await locals.supabase.auth.exchangeCodeForSession(code);
		if (error) {
			throw redirect(303, `/auth/sign-in?error=${encodeURIComponent('Authentication failed. Please try again.')}`);
		}
	}

	throw redirect(303, safeNext);
};
