import { redirect, error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, url }) => {
	const session = await locals.safeGetSession();

	if (!session) {
		throw redirect(303, `/auth/sign-in?next=${encodeURIComponent(url.pathname)}`);
	}

	// Admin privilege checked server-side against admin_users table — never trust client claims
	const { data: adminRow } = await locals.supabase
		.from('admin_users')
		.select('id')
		.eq('user_id', session.user.id)
		.maybeSingle();

	if (!adminRow) {
		throw error(403, 'Access denied.');
	}

	const meta = session.user.user_metadata ?? {};
	const fullName = ((meta.full_name ?? meta.name ?? '') as string);

	return {
		adminUser: {
			id: session.user.id,
			email: session.user.email ?? '',
			full_name: fullName
		}
	};
};
