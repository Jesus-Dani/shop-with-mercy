import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const form = await request.formData();
		const password = String(form.get('password') ?? '');
		const confirm = String(form.get('confirm') ?? '');

		if (!password || !confirm) {
			return fail(400, { error: 'Please enter and confirm your new password.' });
		}
		if (password !== confirm) {
			return fail(400, { error: 'Passwords do not match.' });
		}
		if (password.length < 8) {
			return fail(400, { error: 'Password must be at least 8 characters.' });
		}

		const { error } = await locals.supabase.auth.updateUser({ password });

		if (error) {
			return fail(400, { error: 'Could not update password. Please request a new reset link.' });
		}

		throw redirect(303, '/account');
	}
};
