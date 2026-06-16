import { fail, redirect } from '@sveltejs/kit';
import { timingSafeEqual } from 'crypto';
import { env } from '$env/dynamic/private';
import { makeAdminToken, verifyAdminToken } from '$lib/admin-auth';
import type { Actions, PageServerLoad } from './$types';

const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS = 5;

export const load: PageServerLoad = async ({ cookies }) => {
	const token = cookies.get('admin_session') ?? '';
	if (verifyAdminToken(token)) throw redirect(303, '/admin');
	return {};
};

export const actions: Actions = {
	default: async ({ request, locals, cookies }) => {
		const ip =
			request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
			request.headers.get('x-real-ip') ??
			'unknown';

		const windowStart = new Date(Date.now() - WINDOW_MS).toISOString();

		// Purge stale attempts then count current window for this IP
		await locals.supabaseAdmin
			.from('failed_login_attempts')
			.delete()
			.lt('attempted_at', windowStart);

		const { count } = await locals.supabaseAdmin
			.from('failed_login_attempts')
			.select('id', { count: 'exact', head: true })
			.eq('ip', ip);

		if ((count ?? 0) >= MAX_ATTEMPTS) {
			return fail(429, { error: 'Too many attempts. Try again in 15 minutes.' });
		}

		const form = await request.formData();
		const password = String(form.get('password') ?? '');
		const expected = env.ADMIN_PASSWORD ?? '';

		let match = false;
		if (password.length > 0 && password.length === expected.length) {
			match = timingSafeEqual(Buffer.from(password), Buffer.from(expected));
		}

		if (!match) {
			// Record failed attempt (fire-and-forget)
			locals.supabaseAdmin
				.from('failed_login_attempts')
				.insert({ ip })
				.then(({ error }) => {
					if (error) console.error('[login] failed to record attempt:', error.message);
				});

			return fail(401, { error: 'Incorrect password.' });
		}

		// Success: clear this IP's attempts and set session
		locals.supabaseAdmin
			.from('failed_login_attempts')
			.delete()
			.eq('ip', ip)
			.then(() => {});

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
