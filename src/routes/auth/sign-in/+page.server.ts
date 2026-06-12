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
			return fail(400, { error: 'Invalid email or password.', email });
		}

		throw redirect(303, next.startsWith('/') ? next : '/account');
	},

	google: async ({ locals, url }) => {
		const next = url.searchParams.get('next') ?? '/account';
		const { data, error } = await locals.supabase.auth.signInWithOAuth({
			provider: 'google',
			options: {
				redirectTo: `${url.origin}/auth/callback?next=${encodeURIComponent(next)}`
			}
		});

		if (error || !data.url) {
			return fail(500, { error: 'Could not start Google sign-in. Please try again.' });
		}

		throw redirect(303, data.url);
	}
};
