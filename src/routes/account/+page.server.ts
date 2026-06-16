import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	const session = await locals.safeGetSession();

	if (!session) {
		throw redirect(303, `/auth/sign-in?next=${encodeURIComponent(url.pathname)}`);
	}

	const meta = session.user.user_metadata ?? {};
	const fullName = ((meta.full_name ?? meta.name ?? '') as string);

	return {
		user: {
			id: session.user.id,
			email: session.user.email ?? '',
			full_name: fullName
		}
	};
};
