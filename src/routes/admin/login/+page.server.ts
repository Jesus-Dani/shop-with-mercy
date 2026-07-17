import { fail, redirect } from '@sveltejs/kit';
import { timingSafeEqual } from 'crypto';
import { env } from '$env/dynamic/private';
import { makeAdminToken, verifyAdminToken } from '$lib/admin-auth';
import type { Actions, PageServerLoad } from './$types';

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;

export const load: PageServerLoad = async ({ cookies, locals }) => {
	const token = cookies.get('admin_session') ?? '';
	const parts = verifyAdminToken(token);
	if (parts) {
		const { data } = await locals.supabaseAdmin
			.from('admin_sessions')
			.select('id')
			.eq('id', parts.sessionId)
			.gt('expires_at', new Date().toISOString())
			.maybeSingle();
		if (data) throw redirect(303, '/admin');
	}
	return {};
};

export const actions: Actions = {
	default: async ({ request, locals, cookies }) => {
		const ip =
			request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
			request.headers.get('x-real-ip') ??
			'unknown';

		const windowStart = new Date(Date.now() - WINDOW_MS).toISOString();

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
			locals.supabaseAdmin
				.from('failed_login_attempts')
				.insert({ ip })
				.then(({ error }) => {
					if (error) console.error('[login] failed to record attempt:', error.message);
				});
			return fail(401, { error: 'Incorrect password.' });
		}

		// Clear this IP's attempts
		locals.supabaseAdmin.from('failed_login_attempts').delete().eq('ip', ip).then(() => {});

		// Purge any expired sessions to keep the table small
		locals.supabaseAdmin
			.from('admin_sessions')
			.delete()
			.lt('expires_at', new Date().toISOString())
			.then(() => {});

		const { sessionId, expiresAt, cookie } = makeAdminToken();

		const { error: sessionErr } = await locals.supabaseAdmin
			.from('admin_sessions')
			.insert({ id: sessionId, expires_at: expiresAt });

		if (sessionErr) {
			console.error('[login] failed to create session:', sessionErr.message);
			return fail(500, { error: 'Could not create session. Try again.' });
		}

		cookies.set('admin_session', cookie, {
			httpOnly: true,
			secure: true,
			sameSite: 'strict',
			path: '/admin',
			maxAge: 60 * 60 * 24
		});

		throw redirect(303, '/admin');
	}
};
