import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	const session = await locals.safeGetSession();

	return {
		user: session?.user
			? { full_name: (session.user.user_metadata?.full_name as string | undefined) ?? '' }
			: null,
		cartCount: 0,
		wishlistCount: 0
	};
};
