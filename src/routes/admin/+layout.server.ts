import { redirect } from '@sveltejs/kit';
import { verifyAdminToken } from '$lib/admin-auth';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ cookies, url, locals }) => {
	if (url.pathname === '/admin/login') return {};

	const token = cookies.get('admin_session') ?? '';
	const parts = verifyAdminToken(token);

	if (!parts) throw redirect(303, '/admin/login');

	const { data } = await locals.supabaseAdmin
		.from('admin_sessions')
		.select('id')
		.eq('id', parts.sessionId)
		.gt('expires_at', new Date().toISOString())
		.maybeSingle();

	if (!data) throw redirect(303, '/admin/login');

	return {};
};
