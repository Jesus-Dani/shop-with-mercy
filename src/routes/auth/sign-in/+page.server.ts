import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	const session = await locals.safeGetSession();
	const next = url.searchParams.get('next') ?? '/account';
	if (session) throw redirect(303, next.startsWith('/') ? next : '/account');
	return {
		next,
		urlError: url.searchParams.get('error') ?? null
	};
};

export const actions: Actions = {
	email: async ({ request, locals }) => {
		const form = await request.formData();
		const email = String(form.get('email') ?? '').trim().toLowerCase();
		const password = String(form.get('password') ?? '');
		const next = String(form.get('next') ?? '/account');

		if (!email || !password) {
			return fail(400, { error: 'Please enter your email and password.', email });
		}

		const { error } = await locals.supabase.auth.signInWithPassword({ email, password });

		if (error) {
			console.error('[sign-in] error:', error.code, error.message);

			if (error.code === 'email_not_confirmed') {
				return fail(400, {
					error: 'Please confirm your email before signing in. Check your inbox for a confirmation link.',
					email
				});
			}

			if (error.status === 400 || error.code === 'invalid_credentials') {
				return fail(400, { error: 'Invalid email or password.', email });
			}

			return fail(400, {
				error: error.message || 'Sign-in failed. Please try again.',
				email
			});
		}

		throw redirect(303, next.startsWith('/') ? next : '/account');
	},

};
