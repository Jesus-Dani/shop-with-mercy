import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	const session = await locals.safeGetSession();
	const meta = session?.user?.user_metadata ?? {};
	const fullName = (meta.full_name ?? meta.name ?? '') as string;

	return {
		user: session?.user ? { full_name: fullName } : null,
		cartCount: 0,
		wishlistCount: 0
	};
};
