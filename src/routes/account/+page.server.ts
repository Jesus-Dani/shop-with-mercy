import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	const session = await locals.safeGetSession();

	if (!session) {
		throw redirect(303, `/auth/sign-in?next=${encodeURIComponent(url.pathname)}`);
	}

	return {
		user: {
			id: session.user.id,
			email: session.user.email ?? '',
			full_name: (session.user.user_metadata?.full_name as string | undefined) ?? ''
		}
	};
};
