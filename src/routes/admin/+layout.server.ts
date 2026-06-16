import { redirect } from '@sveltejs/kit';
import { verifyAdminToken } from '$lib/admin-auth';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ cookies, url }) => {
	if (url.pathname === '/admin/login') return {};

	const token = cookies.get('admin_session') ?? '';
	if (!verifyAdminToken(token)) {
		throw redirect(303, '/admin/login');
	}

	return {};
};
