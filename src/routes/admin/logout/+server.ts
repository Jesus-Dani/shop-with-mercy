import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { verifyAdminToken } from '$lib/admin-auth';

export const POST: RequestHandler = async ({ cookies, locals }) => {
	const token = cookies.get('admin_session') ?? '';
	const parts = verifyAdminToken(token);

	if (parts) {
		await locals.supabaseAdmin
			.from('admin_sessions')
			.delete()
			.eq('id', parts.sessionId);
	}

	cookies.delete('admin_session', { path: '/admin' });
	throw redirect(303, '/admin/login');
};
