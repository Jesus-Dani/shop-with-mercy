import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const session = await locals.safeGetSession();
	if (session) throw redirect(303, '/account');
};

export const actions: Actions = {
	signup: async ({ request, locals, url }) => {
		const form = await request.formData();
		const name = String(form.get('name') ?? '').trim();
		const email = String(form.get('email') ?? '').trim().toLowerCase();
		const password = String(form.get('password') ?? '');

		if (!name || !email || !password) {
			return fail(400, { error: 'All fields are required.', name, email });
		}
		if (password.length < 8) {
			return fail(400, { error: 'Password must be at least 8 characters.', name, email });
		}

		const { data, error } = await locals.supabase.auth.signUp({
			email,
			password,
			options: {
				data: { full_name: name },
				emailRedirectTo: `${url.origin}/auth/callback`
			}
		});

		if (error) {
			const msg = error.message.toLowerCase().includes('already')
				? 'An account with this email already exists. Try signing in.'
				: 'Could not create your account. Please try again.';
			return fail(400, { error: msg, name, email });
		}

		// If email confirmation disabled in Supabase → session exists immediately
		if (data.session) throw redirect(303, '/account');

		// Confirmation email sent
		return { success: true, email };
	},

	google: async ({ locals, url }) => {
		const { data, error } = await locals.supabase.auth.signInWithOAuth({
			provider: 'google',
			options: { redirectTo: `${url.origin}/auth/callback` }
		});

		if (error || !data.url) {
			return fail(500, { error: 'Could not start Google sign-in. Please try again.' });
		}

		throw redirect(303, data.url);
	}
};
