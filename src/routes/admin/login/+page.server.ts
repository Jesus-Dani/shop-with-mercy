import { fail, redirect } from '@sveltejs/kit';
import { timingSafeEqual } from 'crypto';
import { env } from '$env/dynamic/private';
import { makeAdminToken, verifyAdminToken } from '$lib/admin-auth';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies }) => {
	const token = cookies.get('admin_session') ?? '';
	if (verifyAdminToken(token)) throw redirect(303, '/admin');
	return {};
};

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const form = await request.formData();
		const password = String(form.get('password') ?? '');
		const expected = env.ADMIN_PASSWORD ?? '';

		let match = false;
		if (password.length > 0 && password.length === expected.length) {
			match = timingSafeEqual(Buffer.from(password), Buffer.from(expected));
		}

		if (!match) {
			return fail(401, { error: 'Incorrect password.' });
		}

		cookies.set('admin_session', makeAdminToken(), {
			httpOnly: true,
			secure: true,
			sameSite: 'lax',
			path: '/admin',
			maxAge: 60 * 60 * 24 * 30
		});

		throw redirect(303, '/admin');
	}
};
